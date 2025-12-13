from tortoise import Model
from tortoise.fields import (
    IntField,
    CharField,
    TextField,
    ForeignKeyField
    )

class User(Model):  ## This table is used for authorization
    __tablename__ = "users"

    id = IntField(primary_key=True, index=True)
    email = CharField(50, unique=True, index=True)
    password = TextField()
    
class Thread(Model):  ## This table is used for the threads to save the chat
    id = IntField(primary_key=True, index=True)
    url = TextField()
    email = ForeignKeyField(
        "models.User",
        related_name="thread",
        to_field="id",
        source_field="email_id",
    )
    
    class Meta:
        table = "thread"

class Chat(Model):  ## This table is used to save chats of the respective thread
    id = IntField(primary_key=True, index=True)
    assistant = CharField(5)
    chat = TextField()
    thread = ForeignKeyField(
        "models.Thread",
        related_name="chat",
        to_field="id",
        source_field="thread_id",
    )
    
    class Meta:
        table = "chat"