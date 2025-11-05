# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router
from app.routers import graph as graph_router
from app.routers import algorithms as algo_router
from app.db import init_db
from scripts.load_seed import load_data
# importar tu función de seed

app = FastAPI(title="PathFinder Minimal API")

# CORS CONFIG
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth_router)
app.include_router(graph_router.router)
app.include_router(algo_router.router)

@app.on_event("startup")
def on_startup():
    # Crear tablas si no existen
    init_db()
    # Cargar datos iniciales automáticamente
    load_data()
