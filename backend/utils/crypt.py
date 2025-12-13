from passlib.context import CryptContext
from fastapi.security import HTTPAuthorizationCredentials
from fastapi import Depends
from fastapi.exceptions import HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

SECRET_KEY = "hello1122"
ALGORITHM = "HS256"

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
security = HTTPBearer()

pwd_context = CryptContext(schemes=["argon2"])

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()      # No exp added
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def http_bearer_get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"message": "Authorized access", "user": payload}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
