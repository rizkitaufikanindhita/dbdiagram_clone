"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSchemaStore } from "@/store/schemaStore";

import TableNode from "./TableNode";

export function ERDiagram() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateNodePosition } = useSchemaStore();

  const nodeTypes = React.useMemo(() => ({
    table: TableNode,
  }), []);

  // Prevent keyboard events from bubbling out of the ReactFlow container
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="h-full w-full bg-slate-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={(_, node) => updateNodePosition(node.id, node.position)}
        fitView
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        nodesDraggable={true}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={true}
        disableKeyboardA11y={true}
        // Disable keyboard shortcuts that steal keys from the editor
        panActivationKeyCode={null}
        zoomActivationKeyCode={null}
        multiSelectionKeyCode="Meta"
        deleteKeyCode={null}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
