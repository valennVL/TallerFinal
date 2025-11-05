import { useState, useEffect } from "react";
import api from "../api"; // tu cliente axios/fetch
import GraphView from "../components/GraphView";
import "../DashboardStyle.css";

export default function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [nodeName, setNodeName] = useState("");
  const [deleteNodeName, setDeleteNodeName] = useState("");
  const [edgeData, setEdgeData] = useState({ src_id: "", dst_id: "", weight: "" });
  const [deleteEdgeId, setDeleteEdgeId] = useState("");

  const [bfsStart, setBfsStart] = useState("");
  const [dijkstraData, setDijkstraData] = useState({ src_id: "", dst_id: "" });

  const [bfsResult, setBfsResult] = useState(null);
  const [dijkstraResult, setDijkstraResult] = useState(null);

  const [openSections, setOpenSections] = useState({
    nodes: true,
    edges: false,
    bfs: false,
    dijkstra: false,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => {
      if (prev[key]) {
        // Si está abierta, cerrarla
        return { ...prev, [key]: false };
      } else {
        // Si está cerrada, abrirla y cerrar las otras
        return { nodes: false, edges: false, bfs: false, dijkstra: false, [key]: true };
      }
    });

  // Cargar nodos y aristas
  const fetchGraph = async () => {
    try {
      const [n, e] = await Promise.all([
        api.get("/graph/nodes"),
        api.get("/graph/edges"),
      ]);
      setNodes(n.data);
      setEdges(e.data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      window.location.reload();
    }
  };

  useEffect(() => { fetchGraph(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Crear mapa de IDs a nombres
  const nodeMap = nodes.reduce((map, node) => {
    map[node.id] = node.name;
    return map;
  }, {});

  // --- CRUD Nodos ---
  const createNode = async () => {
    if (!nodeName) return;
    await api.post("/graph/nodes", { name: nodeName });
    setNodeName("");
    fetchGraph();
  };

  const deleteNode = async (id) => {
    await api.delete(`/graph/nodes/${id}`);
    fetchGraph();
  };

  const deleteNodeByName = async () => {
    if (!deleteNodeName) return;
    const node = nodes.find(n => n.name === deleteNodeName);
    if (!node) {
      alert("Nodo no encontrado");
      return;
    }
    await api.delete(`/graph/nodes/${node.id}`);
    setDeleteNodeName("");
    fetchGraph();
  };

  // --- CRUD Aristas ---
  const createEdge = async () => {
    const { src_id, dst_id, weight } = edgeData;
    if (!src_id || !dst_id || !weight) return;
    await api.post("/graph/edges", {
      src_id: parseInt(src_id),
      dst_id: parseInt(dst_id),
      weight: parseFloat(weight)
    });
    setEdgeData({ src_id: "", dst_id: "", weight: "" });
    fetchGraph();
  };

  const deleteEdge = async (id) => {
    await api.delete(`/graph/edges/${id}`);
    fetchGraph();
  };

  const deleteEdgeById = async () => {
    if (!deleteEdgeId) return;
    await api.delete(`/graph/edges/${deleteEdgeId}`);
    setDeleteEdgeId("");
    fetchGraph();
  };

  // --- BFS ---
  const runBFS = async () => {
    if (!bfsStart) return;
    try {
      const res = await api.get(`/graph/bfs?start_id=${bfsStart}`);
      setBfsResult(res.data);
    } catch (err) {
      alert("Error en BFS: " + (err.response?.data?.detail || err.message));
    }
  };

  // --- Dijkstra ---
  const runDijkstra = async () => {
    const { src_id, dst_id } = dijkstraData;
    if (!src_id || !dst_id) return;
    try {
      const res = await api.get(`/graph/shortest-path?src_id=${src_id}&dst_id=${dst_id}`);
      setDijkstraResult(res.data);
    } catch (err) {
      alert("Error en Dijkstra: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <header  className="header">
          <h1>PathFinder 🧠</h1>
          <button onClick={logout}>Cerrar sesión</button>
        </header>

        <div className="sections-grid">
        {/* --- Nodos --- */}
        <section style={{ gridColumn: 1, gridRow: 1 }} className={`panel ${openSections.nodes ? "open" : "collapsed"}`}>
          <div className="panel-header" onClick={() => toggleSection("nodes")}>
            <h2>Nodos</h2>
            <span>{openSections.nodes ? "▾" : "▸"}</span>
          </div>
          {openSections.nodes && (
            <div className="panel-body">
              <input
                type="text"
                placeholder="Nombre nodo"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
              />
              <button onClick={createNode}>Crear nodo</button>
              <hr style={{margin: "0.5rem 0", borderColor: "#222"}} />
              <input
                type="text"
                placeholder="Nombre nodo a eliminar"
                value={deleteNodeName}
                onChange={(e) => setDeleteNodeName(e.target.value)}
              />
              <button onClick={deleteNodeByName}>Eliminar por nombre</button>
              <ul>
                {nodes.map(n => (
                  <li key={n.id}>
                    {n.id} - {n.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* --- Aristas --- */}
        <section style={{ gridColumn: 1, gridRow: 2 }} className={`panel ${openSections.edges ? "open" : "collapsed"}`}>
          <div className="panel-header" onClick={() => toggleSection("edges")}>
            <h2>Aristas</h2>
            <span>{openSections.edges ? "▾" : "▸"}</span>
          </div>
          {openSections.edges && (
            <div className="panel-body">
              <input type="number" placeholder="src_id" value={edgeData.src_id} onChange={e => setEdgeData({...edgeData, src_id: e.target.value})} />
              <input type="number" placeholder="dst_id" value={edgeData.dst_id} onChange={e => setEdgeData({...edgeData, dst_id: e.target.value})} />
              <input type="number" placeholder="peso" value={edgeData.weight} onChange={e => setEdgeData({...edgeData, weight: e.target.value})} />
              <button onClick={createEdge}>Crear arista</button>
              <hr style={{margin: "0.5rem 0", borderColor: "#222"}} />
              <input type="number" placeholder="ID arista a eliminar" value={deleteEdgeId} onChange={e => setDeleteEdgeId(e.target.value)} />
              <button onClick={deleteEdgeById}>Eliminar por ID</button>
              <ul>
                {edges.map(e => (
                  <li key={e.id}>
                    {e.id}: {nodeMap[e.src_id]} → {nodeMap[e.dst_id]} ({e.weight})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* --- BFS --- */}
        <section style={{ gridColumn: 2, gridRow: 1 }} className={`panel ${openSections.bfs ? "open" : "collapsed"}`}>
          <div className="panel-header" onClick={() => toggleSection("bfs")}>
            <h2>BFS</h2>
            <span>{openSections.bfs ? "▾" : "▸"}</span>
          </div>
          {openSections.bfs && (
            <div className="panel-body">
              <input type="number" placeholder="start_id" value={bfsStart} onChange={e => setBfsStart(e.target.value)} />
              <button onClick={runBFS}>Ejecutar BFS</button>
              {bfsResult && (
                <div>
                  <p>Orden: {bfsResult.order.join(", ")}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Node</th>
                        <th>Parent</th>
                        <th>Depth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bfsResult.tree.map(t => (
                        <tr key={t.node_id}>
                          <td>{t.node_id}</td>
                          <td>{t.parent_id ?? "-"}</td>
                          <td>{t.depth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        {/* --- Dijkstra --- */}
        <section style={{ gridColumn: 2, gridRow: 2 }} className={`panel ${openSections.dijkstra ? "open" : "collapsed"}`}>
          <div className="panel-header" onClick={() => toggleSection("dijkstra")}>
            <h2>Dijkstra</h2>
            <span>{openSections.dijkstra ? "▾" : "▸"}</span>
          </div>
          {openSections.dijkstra && (
            <div className="panel-body">
              <input type="number" placeholder="src_id" value={dijkstraData.src_id} onChange={e => setDijkstraData({...dijkstraData, src_id: e.target.value})} />
              <input type="number" placeholder="dst_id" value={dijkstraData.dst_id} onChange={e => setDijkstraData({...dijkstraData, dst_id: e.target.value})} />
              <button onClick={runDijkstra}>Ejecutar Dijkstra</button>
              {dijkstraResult && (
                <div>
                  <p>Path: {dijkstraResult.path.join(" → ")}</p>
                  <p>Distance: {dijkstraResult.distance}</p>
                </div>
              )}
            </div>
          )}
        </section>
        </div>
      </div>

      {/* --- Visualización del grafo --- */}
      <GraphView id="View" nodes={nodes} edges={edges} />
    </div>
  );
}
