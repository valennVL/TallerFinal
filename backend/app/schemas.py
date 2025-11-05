from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field

# --- Usuarios ---
class UserBase(SQLModel):
    username: str

class UserIn(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

class TokenOut(SQLModel):
    access_token: str
    token_type: str


# --- Nodos ---
class NodeBase(SQLModel):
    name: str

class NodeIn(NodeBase):
    pass

class NodeOut(NodeBase):
    id: int
    created_at: datetime


# --- Aristas ---
class EdgeBase(SQLModel):
    src_id: int
    dst_id: int
    weight: float

class EdgeIn(EdgeBase):
    pass

class EdgeOut(EdgeBase):
    id: int
    created_at: datetime


# --- BFS y Shortest Path ---
class BFSTreeNode(SQLModel):
    node_id: int
    parent_id: Optional[int]
    depth: int

class BFSResult(SQLModel):
    order: List[int]
    tree: List[BFSTreeNode]

class ShortestPathOut(SQLModel):
    path: List[int]
    distance: float
