from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr = "umer@gmail.com"
    password: str = "umertechno"

class NewChat(BaseModel):
    url: str
    
class Message(BaseModel):
    chat_id: int
    message: str