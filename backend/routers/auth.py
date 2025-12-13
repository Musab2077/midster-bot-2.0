from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from schemas import UserCreate
from models import User
from utils.crypt import hash_password, verify_password, create_access_token
from utils.crypt import http_bearer_get_current_user

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register")
async def register(user: UserCreate):
    # Check user exists
    existing_user = await User.filter(email=user.email).first()
    if existing_user:
        raise HTTPException(400, "email already exists")

    # Create user
    hashed_pw = hash_password(user.password)
    new_user = await User.create(email=user.email, password=hashed_pw)

    token = create_access_token({"id" : new_user.id, "email": new_user.email})

    return JSONResponse({"message": "User registered successfully", "access_token": token, "token_type": "bearer"})

@auth_router.post("/login")
async def login(user: UserCreate):
    db_user = await User.filter(email=user.email).first()

    if not db_user:
        raise HTTPException(400, "User not found")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(400, "Incorrect password")


    token = create_access_token({"id": db_user.id, "username": db_user.email})

    return JSONResponse({"access_token": token, "token_type": "bearer"})

@auth_router.get("/protected/{id}")
def protected_route(id: int, token: dict = Depends(http_bearer_get_current_user)):
    if id == 0:
        return JSONResponse({"is_zero": True,"token": token})
    else:
        return JSONResponse({"is_zero": False,"token": token})