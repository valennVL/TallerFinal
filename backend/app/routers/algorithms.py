from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from heapq import heappop, heappush
from app.db import get_session
from app.models import Node, Edge
from app.schemas import BFSResult, BFSTreeNode, ShortestPathOut
from app.deps import get_current_user
from collections import deque
import math

router = APIRouter(prefix="/graph", tags=["algorithms"])

@router.get("/bfs", response_model=BFSResult)
def run_bfs(start_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    start = session.get(Node, start_id)
    if not start:
        raise HTTPException(status_code=404, detail="Start node not found")

    adj = {}
    for e in session.exec(select(Edge)).all():
        adj.setdefault(e.src_id, []).append(e.dst_id)

    visited = set()
    queue = deque([(start_id, None, 0)])
    order = []
    tree = []

    while queue:
        node_id, parent_id, depth = queue.popleft()
        if node_id in visited:
            continue
        visited.add(node_id)
        order.append(node_id)
        tree.append(BFSTreeNode(node_id=node_id, parent_id=parent_id, depth=depth))
        for neigh in adj.get(node_id, []):
            if neigh not in visited:
                queue.append((neigh, node_id, depth + 1))
    return BFSResult(order=order, tree=tree)

@router.get("/shortest-path", response_model=ShortestPathOut)
def run_shortest_path(src_id: int, dst_id: int, session: Session = Depends(get_session), user=Depends(get_current_user)):
    nodes = {n.id for n in session.exec(select(Node)).all()}
    if src_id not in nodes or dst_id not in nodes:
        raise HTTPException(status_code=404, detail="Invalid node IDs")

    adj = {}
    for e in session.exec(select(Edge)).all():
        adj.setdefault(e.src_id, []).append((e.dst_id, e.weight))

    dist = {n: math.inf for n in nodes}
    prev = {}
    dist[src_id] = 0
    pq = [(0, src_id)]

    while pq:
        d, u = heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj.get(u, []):
            alt = d + w
            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                heappush(pq, (alt, v))

    if dist[dst_id] == math.inf:
        raise HTTPException(status_code=404, detail="No path found")

    path = []
    u = dst_id
    while u in prev or u == src_id:
        path.append(u)
        if u == src_id:
            break
        u = prev[u]
    path.reverse()
    return ShortestPathOut(path=path, distance=dist[dst_id])
