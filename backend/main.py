from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
import os

from routers.auth import auth_router
from routers.thread import thread_router

load_dotenv()

security = HTTPBearer()

DB_HOST     = os.getenv("DB_HOST", "aws-1-ap-south-1.pooler.supabase.com")
DB_USER     = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME     = os.getenv("DB_NAME", "postgres")
DB_PORT     = int(os.getenv("DB_PORT", 5432))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(thread_router)

register_tortoise(
    app,
    config={
        "connections": {
            "default": {
                "engine": "tortoise.backends.asyncpg",
                "credentials": {
                    "host": DB_HOST,
                    "port": DB_PORT,
                    "user": DB_USER,
                    "password": DB_PASSWORD,
                    "database": DB_NAME,
                    "ssl": "require",
                },
            }
        },
        "apps": {
            "models": {
                "models": ["models"],
                "default_connection": "default",
            }
        },
    },
    generate_schemas=True,
    add_exception_handlers=True,
)