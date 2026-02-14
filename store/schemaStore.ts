import { create } from "zustand";
import { parseDBML, Schema } from "@/lib/parser";
import { Node, Edge, Connection, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, MarkerType } from "reactflow";

interface SchemaState {
  code: string;
  schema: Schema;
  nodes: Node[];
  edges: Edge[];
  
  setCode: (code: string) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
}

const DEFAULT_CODE = `Table Users {
  id integer [pk]
  username varchar
  email varchar
  created_at timestamp
}

Table Posts {
  id integer [pk]
  title varchar
  body text
  user_id integer
  created_at timestamp
}

Ref: Posts.user_id > Users.id`;

export const useSchemaStore = create<SchemaState>((set, get) => ({
  code: DEFAULT_CODE,
  schema: parseDBML(DEFAULT_CODE),
  nodes: [], // Will be populated by ERDiagram effect
  edges: [],

  setCode: (code) => {
    const schema = parseDBML(code);
    set((state) => {
      // Merge existing node positions
      const newNodes: Node[] = schema.tables.map((table, index) => {
        const existingNode = state.nodes.find((n) => n.id === table.name);
        return {
          id: table.name,
          // Use existing position if available, else default
          position: existingNode?.position || { x: 100 + index * 250, y: 100 },
          data: { label: table.name, columns: table.columns },
          type: "table",
          style: { border: '1px solid #777', padding: 0, borderRadius: 5, background: '#fff' }
        };
      });

      // Generate edges from refs
      const newEdges: Edge[] = schema.refs.map((ref, idx) => ({
        id: `ref-${idx}`,
        source: ref.fromTable,
        target: ref.toTable,
        sourceHandle: `${ref.fromTable}-source`,
        targetHandle: `${ref.toTable}-target`,
        type: "default",
        markerEnd: { type: "arrowclosed" as any }, // Assuming reactflow types allow this string literal or enum
        style: { strokeWidth: 2 },
        animated: true,
      }));

      return { code, schema, nodes: newNodes, edges: newEdges };
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  updateNodePosition: (id, position) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    }));
  },
}));
