from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from schemas import NewChat, Message ## Schemas
# Utilities
from utils.transcription import transcription_from_url as trans_url
from utils.rag import RagPipeline
from utils.crypt import http_bearer_get_current_user
from models import Thread, Chat  ## DB Models
from typing import Dict

rag_pipeline = RagPipeline()
thread_router = APIRouter(tags=["Chat"])

@thread_router.post("/new_chat")
async def new_chat(arg: NewChat, token: Dict = Depends(http_bearer_get_current_user)):
    trans_url.extracting_audio_from_url(arg.url)
    transcription = trans_url.extracting_text_from_audio()
    email_id = token["user"]["id"]
    thread = await Thread.create(url=arg.url, email_id=email_id)
    rag_pipeline.creating_pinecone_index(str(thread.id))
    rag_pipeline.chunking_and_upserting(transcription, str(thread.id))
    return JSONResponse({"created": "successful", "thread_id": str(thread.id), "url": arg.url})

@thread_router.post("/chat")
async def new_chat(arg: Message, token: Dict = Depends(http_bearer_get_current_user)):
    retriever = rag_pipeline.retrieving_chunks(str(arg.chat_id))
    output = rag_pipeline.answers_gen_via_llm(retriever, arg.message)
    chat = await Chat.create(assistant="human", chat=arg.message, thread_id=arg.chat_id)
    chat = await Chat.create(assistant="bot", chat=output, thread_id=arg.chat_id)
    return JSONResponse({"response": output})
    
@thread_router.get("/threads")
async def get_threads(token: Dict = Depends(http_bearer_get_current_user)):
    email_id = token["user"]["id"]
    threads = await Thread.filter(email_id=email_id).all()
    threads.reverse()
    return threads

@thread_router.get("/chat/{thread_id}")
async def get_chat(thread_id, token: Dict = Depends(http_bearer_get_current_user)):
    chat = await Chat.filter(thread_id=thread_id).all()        
    thread = await Thread.get(id=thread_id)
    email_id = token["user"]["id"]
    if email_id == thread.email_id:
        response = []
        human_chat = chat[0::2]
        bot_chat = chat[1::2]
        for i in range(len(human_chat)):
            response.append({"human": human_chat[i].chat, "bot": bot_chat[i].chat})
        return {"response": response}
    else:
        raise HTTPException(404, "Not Found")