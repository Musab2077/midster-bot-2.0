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

from utils.system_prompt import PROMPT

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

class RagPipeline():        
    def creating_pinecone_index(self, index_name):
        self.index_name = index_name
        if not pc.has_index(self.index_name):
            pc.create_index(
                name=self.index_name,
                dimension=1536,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region="us-east-1"
                )
            )
            return {"is_exist": False}
        return {"is_exist": True}
    
    def chunking_and_upserting(self, text, index_name):
        splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50, separators=[". ", "\n", " "])
        text_chunks = splitter.split_text(text=text)
        docsearch = PineconeVectorStore.from_texts(
            texts=text_chunks,
            embedding=embeddings,
            index_name=index_name
        )
        
    def retrieving_chunks(self, index_name, k=3):
        """This is for retrieving the chunks with respect to the text"""
        documents = PineconeVectorStore.from_existing_index(
            index_name=index_name,
            embedding=embeddings
        )
        retriever = documents.as_retriever(search_type='similarity', search_kwargs={"k" : k})
        return retriever
    
    def answers_gen_via_llm(self, retriever, message):
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
        return output['answer']