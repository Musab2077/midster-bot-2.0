import asyncio
from functools import partial
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from schemas import NewChat, Message
from utils.transcription import TranscriptionFromUrl   # ✅ class, not singleton
from utils.rag import RagPipeline
from utils.crypt import http_bearer_get_current_user
from models import Thread, Chat

rag_pipeline  = RagPipeline()   # stateless — safe as a singleton
thread_router = APIRouter(tags=["Chat"])


@thread_router.post("/new_chat")
async def new_chat(arg: NewChat, token: Dict = Depends(http_bearer_get_current_user)):
    loop = asyncio.get_event_loop()
    thread = None  # track for rollback

    try:
        # Step 1: Transcribe directly from URL — no disk usage
        trans = TranscriptionFromUrl()
        transcription = await loop.run_in_executor(None, trans.transcribe_from_url, arg.url)

        # Step 2: Save thread to DB first to get the ID
        email_id = token["user"]["id"]
        thread = await Thread.create(url=arg.url, email_id=email_id)

        # Step 3: Create Pinecone index using the thread ID
        await loop.run_in_executor(
            None,
            rag_pipeline.creating_pinecone_index,
            str(thread.id)
        )

        # Step 4: Chunk and upsert embeddings
        await loop.run_in_executor(
            None,
            partial(rag_pipeline.chunking_and_upserting, transcription, str(thread.id)),
        )

        return JSONResponse({
            "created": "successful",
            "thread_id": str(thread.id),
            "url": arg.url,
        })

    except HTTPException as e:
        # Pinecone or transcription failed — rollback DB
        import traceback
        traceback.print_exc()  # Log the error for debugging
        if thread:
            await thread.delete()
        raise e

    except Exception as e:
        # Unexpected error — rollback DB
        if thread:
            await thread.delete()
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


@thread_router.post("/chat")
async def chat(arg: Message, token: Dict = Depends(http_bearer_get_current_user)):
    loop      = asyncio.get_event_loop()
    retriever = await loop.run_in_executor(
        None,
        partial(rag_pipeline.retrieving_chunks, str(arg.chat_id)),
    )
    output = await loop.run_in_executor(
        None,
        partial(rag_pipeline.answers_gen_via_llm, retriever, arg.message),
    )

    await Chat.create(assistant="human", chat=arg.message, thread_id=arg.chat_id)
    await Chat.create(assistant="bot",   chat=output,      thread_id=arg.chat_id)

    return JSONResponse({"response": output})


@thread_router.get("/threads")
async def get_threads(token: Dict = Depends(http_bearer_get_current_user)):
    email_id = token["user"]["id"]
    threads  = await Thread.filter(email_id=email_id).order_by("-id").all()
    return threads


@thread_router.get("/chat/{thread_id}")
async def get_chat(thread_id: int, token: Dict = Depends(http_bearer_get_current_user)):
    thread = await Thread.get_or_none(id=thread_id)
    if not thread:
        raise HTTPException(404, "Thread not found")
    if thread.email_id != token["user"]["id"]:
        raise HTTPException(403, "Forbidden")

    # ✅ Use the stored `assistant` field — not fragile index-based pairing
    chats    = await Chat.filter(thread_id=thread_id).order_by("id").all()
    response = [{"role": c.assistant, "message": c.chat} for c in chats]
    return {"response": response}