from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Node(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Edge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    src_id: int = Field(foreign_key="node.id")
    dst_id: int = Field(foreign_key="node.id")
    weight: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
