// frontend/src/components/GraphView.jsx
import React, { useEffect, useRef } from "react";
import ForceGraph2D from "force-graph";

export default function GraphView({ nodes, edges, bfsResult, dijkstraResult }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const data = {
      nodes: nodes.map((n) => ({ id: n.id, name: n.name })),
      links: edges.map((e) => ({
        source: e.src_id,
        target: e.dst_id,
        value: e.weight,
      })),
    };

    // Crear sets para aristas resaltadas
    const bfsEdges = new Set();
    if (bfsResult?.tree) {
      bfsResult.tree.forEach(t => {
        if (t.parent_id !== null) {
          bfsEdges.add(`${t.parent_id}-${t.node_id}`);
        }
      });
    }

    const dijkstraEdges = new Set();
    if (dijkstraResult?.path) {
      for (let i = 0; i < dijkstraResult.path.length - 1; i++) {
        dijkstraEdges.add(`${dijkstraResult.path[i]}-${dijkstraResult.path[i + 1]}`);
      }
    }

    const Graph = ForceGraph2D()(containerRef.current)
      .graphData(data)
      .nodeLabel("name")
      .nodeAutoColorBy("id")
      .linkDirectionalArrowLength(5)
      .linkDirectionalArrowRelPos(1)
      .linkColor((link) => {
        const edgeKey = `${link.source.id}-${link.target.id}`;
        if (bfsEdges.has(edgeKey)) return "red";
        if (dijkstraEdges.has(edgeKey)) return "blue";
        return "white";
      })
      .linkLineDash((link) => {
        const edgeKey = `${link.source.id}-${link.target.id}`;
        if (bfsEdges.has(edgeKey) || dijkstraEdges.has(edgeKey)) return [0];
        return [0];
      })
      .linkCanvasObject((link, ctx, globalScale) => {
        const edgeKey = `${link.source.id}-${link.target.id}`;
        const isBfs = bfsEdges.has(edgeKey);
        const isDijkstra = dijkstraEdges.has(edgeKey);

        // Dibujar línea del enlace con color
        ctx.strokeStyle = isBfs ? "red" : isDijkstra ? "blue" : "white";
        ctx.lineWidth = isBfs || isDijkstra ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();

        // Dibujar etiqueta del peso
        const label = link.value.toString();
        const fontSize = 14 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "blue";
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        ctx.fillText(label, midX, midY);
      })
      .linkWidth((link) => {
        const edgeKey = `${link.source.id}-${link.target.id}`;
        if (bfsEdges.has(edgeKey) || dijkstraEdges.has(edgeKey)) return 3;
        return 1.5;
      })
      .nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 15 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#00bcd4";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = "#00bcd4";
        ctx.textAlign = "center";
        ctx.fillText(label, node.x, node.y - 8);
      })
      .backgroundColor("#000000ff");

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [nodes, edges, bfsResult, dijkstraResult]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        overflow: "hidden",
      }}
    />
  );
}
