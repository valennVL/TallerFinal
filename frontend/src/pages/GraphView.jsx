import React from "react";
import { ForceGraph2D } from "react-force-graph";

export default function GraphView({ nodes, edges }) {
  const data = {
    nodes: nodes.map((n) => ({ id: n.id, name: n.name })),
    links: edges.map((e) => ({
      source: e.src_id,
      target: e.dst_id,
      value: e.weight,
    })),
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="id"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.01}
        linkWidth={(link) => Math.sqrt(link.value)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "#00bcd4"; // color fijo
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.fillText(label, node.x + 6, node.y + 3);
        }}
        backgroundColor="#111111"
      />
    </div>
  );
}

