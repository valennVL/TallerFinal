from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./app.db")
connect_args = {"check_same_thread": False}
engine = create_engine(SQLITE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
