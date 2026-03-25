from tortoise import Model
from tortoise.fields import (
    IntField,
    CharField,
    TextField,
    ForeignKeyField,
)


class User(Model):
    id = IntField(primary_key=True, index=True)
    email = CharField(50, unique=True, index=True)
    password = TextField()

    class Meta:
        table = "users"


class Thread(Model):
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


class Chat(Model):
    id = IntField(primary_key=True, index=True)
    assistant = CharField(10)   # "human" or "bot"
    chat = TextField()
    thread = ForeignKeyField(
        "models.Thread",
        related_name="chat",
        to_field="id",
        source_field="thread_id",
    )

    class Meta:
        table = "chat"