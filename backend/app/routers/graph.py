from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import Node, Edge
from app.schemas import NodeIn, NodeOut, EdgeIn, EdgeOut
from app.deps import get_current_user

router = APIRouter(prefix="/graph", tags=["graph"])

@router.post("/nodes", response_model=NodeOut)
def create_node(node_in: NodeIn, session: Session = Depends(get_session), user=Depends(get_current_user)):
    existing = session.exec(select(Node).where(Node.name == node_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Node name already exists")
    node = Node(name=node_in.name)
    session.add(node)
    session.commit()
    session.refresh(node)
    return node

@router.get("/nodes", response_model=list[NodeOut])
def list_nodes(session: Session = Depends(get_session), user=Depends(get_current_user)):
    return session.exec(select(Node)).all()

@router.delete("/nodes/{node_id}", status_code=204)
def delete_node(node_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    node = session.get(Node, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    edges = session.exec(select(Edge).where((Edge.src_id == node_id) | (Edge.dst_id == node_id))).all()
    for e in edges:
        session.delete(e)
    session.delete(node)
    session.commit()
    return

@router.post("/edges", response_model=EdgeOut)
def create_edge(edge_in: EdgeIn, session: Session = Depends(get_session), user=Depends(get_current_user)):
    src = session.get(Node, edge_in.src_id)
    dst = session.get(Node, edge_in.dst_id)
    if not src or not dst:
        raise HTTPException(status_code=400, detail="Invalid src_id or dst_id")
    if edge_in.weight <= 0:
        raise HTTPException(status_code=400, detail="Weight must be positive")
    edge = Edge(**edge_in.dict())
    session.add(edge)
    session.commit()
    session.refresh(edge)
    return edge

@router.get("/edges", response_model=list[EdgeOut])
def list_edges(session: Session = Depends(get_session), user=Depends(get_current_user)):
    return session.exec(select(Edge)).all()

@router.delete("/edges/{edge_id}", status_code=204)
def delete_edge(edge_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    edge = session.get(Edge, edge_id)
    if not edge:
        raise HTTPException(status_code=404, detail="Edge not found")
    session.delete(edge)
    session.commit()
    return
