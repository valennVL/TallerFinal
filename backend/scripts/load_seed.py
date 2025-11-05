import csv
from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import Node, Edge

def load_data():
    # Crear tablas si no existen
    init_db()

    with Session(engine) as session:
        # --- Cargar nodos ---
        with open("data/nodes.csv", newline='', encoding="utf-8") as f:
            for row in csv.DictReader(f):
                name = row["name"].strip()
                if not session.exec(select(Node).where(Node.name == name)).first():
                    session.add(Node(name=name))
        session.commit()

        # --- Cargar aristas ---
        with open("data/edges.csv", newline='', encoding="utf-8") as f:
            for row in csv.DictReader(f):
                src = session.exec(select(Node).where(Node.name == row["src_name"].strip())).first()
                dst = session.exec(select(Node).where(Node.name == row["dst_name"].strip())).first()
                if src and dst:
                    # Combinación correcta de condiciones
                    existing_edge = session.exec(
                        select(Edge).where((Edge.src_id == src.id) & (Edge.dst_id == dst.id))
                    ).first()
                    if not existing_edge:
                        session.add(Edge(src_id=src.id, dst_id=dst.id, weight=float(row["weight"])))
        session.commit()

if __name__ == "__main__":
    load_data()
    print("✅ Datos cargados correctamente.")
