import os
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import OpenAI
from dotenv import load_dotenv
from fastapi import HTTPException

from utils.system_prompt import PROMPT

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

class RagPipeline:

    def creating_pinecone_index(self, index_name: str) -> dict:
        try:
            if not pc.has_index(index_name):
                pc.create_index(
                    name=index_name,
                    dimension=1536,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1"),
                )
                return {"is_exist": False}
            return {"is_exist": True}   # ✅ already exists — not an error, just continue
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Pinecone index error: {str(e)}")

    def chunking_and_upserting(self, text: str, index_name: str) -> None:
        try:
            # ✅ Larger chunks — better for video transcriptions, fewer API calls
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=150,
                separators=[". ", "\n", " "],
            )
            text_chunks = splitter.split_text(text=text)
            PineconeVectorStore.from_texts(
                texts=text_chunks,
                embedding=embeddings,
                index_name=index_name,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Embedding/upsert failed: {str(e)}")

    def retrieving_chunks(self, index_name: str, k: int = 3):
        try:
            store = PineconeVectorStore.from_existing_index(
                index_name=index_name,
                embedding=embeddings,
            )
            return store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": k},
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    def answers_gen_via_llm(self, retriever, message: str) -> str:
        try:
            llm = OpenAI(api_key=OPENAI_API_KEY)
            system_prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", PROMPT),
                    ("human", "{input}"),
                ]
            )
            question_answer_chain = create_stuff_documents_chain(llm, system_prompt)
            rag_chain = create_retrieval_chain(retriever, question_answer_chain)
            output = rag_chain.invoke({"input": message})
            return output["answer"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")