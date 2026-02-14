"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSchemaStore } from "@/store/schemaStore";

import TableNode from "./TableNode";

// Placeholder node for now (Moved inside component or kept here)
// already moved to TableNode above

export function ERDiagram() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateNodePosition } = useSchemaStore();
  
  const nodeTypes = React.useMemo(() => ({
    table: TableNode,
  }), []);

  return (
    <div className="h-full w-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={(_, node) => updateNodePosition(node.id, node.position)}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
