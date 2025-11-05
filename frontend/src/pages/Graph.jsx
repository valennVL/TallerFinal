import { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function Graph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [name, setName] = useState("");
  const [srcId, setSrcId] = useState("");
  const [dstId, setDstId] = useState("");
  const [weight, setWeight] = useState("");
  const [bfsResult, setBfsResult] = useState(null);
  const [dijkstraResult, setDijkstraResult] = useState(null);

  const loadData = async () => {
    setNodes(await apiFetch("/graph/nodes"));
    setEdges(await apiFetch("/graph/edges"));
  };

  useEffect(() => { loadData(); }, []);

  const addNode = async () => {
    await apiFetch("/graph/nodes", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setName("");
    loadData();
  };

  const addEdge = async () => {
    await apiFetch("/graph/edges", {
      method: "POST",
      body: JSON.stringify({
        src_id: parseInt(srcId),
        dst_id: parseInt(dstId),
        weight: parseFloat(weight),
      }),
    });
    setSrcId(""); setDstId(""); setWeight("");
    loadData();
  };

  const runBfs = async (startId) => {
    const res = await apiFetch(`/graph/bfs?start_id=${startId}`);
    setBfsResult(res);
  };

  const runDijkstra = async (src, dst) => {
    const res = await apiFetch(`/graph/shortest-path?src_id=${src}&dst_id=${dst}`);
    setDijkstraResult(res);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Explorador de Grafo</h1>

      <section>
        <h2 className="text-xl font-semibold">Nodos</h2>
        <input
          className="border p-1 rounded mr-2"
          placeholder="Nombre del nodo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addNode} className="bg-green-500 text-white px-2 py-1 rounded">
          Crear
        </button>
        <ul className="mt-2">
          {nodes.map((n) => <li key={n.id}>{n.id} - {n.name}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Aristas</h2>
        <input className="border p-1 rounded mr-2" placeholder="src_id"
          value={srcId} onChange={(e) => setSrcId(e.target.value)} />
        <input className="border p-1 rounded mr-2" placeholder="dst_id"
          value={dstId} onChange={(e) => setDstId(e.target.value)} />
        <input className="border p-1 rounded mr-2" placeholder="peso"
          value={weight} onChange={(e) => setWeight(e.target.value)} />
        <button onClick={addEdge} className="bg-green-500 text-white px-2 py-1 rounded">
          Crear
        </button>
        <ul className="mt-2">
          {edges.map((e) => (
            <li key={e.id}>
              {e.id}: {e.src_id} → {e.dst_id} ({e.weight})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Algoritmos</h2>
        <button
          onClick={() => runBfs(prompt("ID inicial BFS:"))}
          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
        >
          Ejecutar BFS
        </button>
        <button
          onClick={() => runDijkstra(
            prompt("ID origen:"), prompt("ID destino:")
          )}
          className="bg-purple-500 text-white px-2 py-1 rounded"
        >
          Ejecutar Dijkstra
        </button>

        {bfsResult && (
          <div className="mt-4">
            <h3 className="font-bold">Resultado BFS:</h3>
            <p>Orden: {bfsResult.order.join(", ")}</p>
          </div>
        )}

        {dijkstraResult && (
          <div className="mt-4">
            <h3 className="font-bold">Resultado Dijkstra:</h3>
            <p>Camino: {dijkstraResult.path.join(" → ")}</p>
            <p>Distancia: {dijkstraResult.distance}</p>
          </div>
        )}
      </section>
    </div>
  );
}
