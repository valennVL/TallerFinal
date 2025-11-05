from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel import Session, select
from app.db import get_session
from app.models import User
import os

# Variables de entorno (por si no están definidas)
SECRET_KEY = os.getenv("JWT_SECRET", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Definir el esquema de autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    """
    Extrae el usuario actual a partir del token JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido o sin usuario.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado.")

    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado.")

    return user
