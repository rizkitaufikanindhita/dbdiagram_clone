import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseDBML, Schema } from "@/lib/parser";
import { Node, Edge, Connection, addEdge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges } from "reactflow";

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

Table Profiles {
  id integer [pk]
  user_id integer
  bio text
  avatar_url varchar
}

Table Tags {
  id integer [pk]
  name varchar
}

Ref: Posts.user_id > Users.id
Ref: Profiles.user_id - Users.id
Ref: Posts.id <> Tags.id`;

/**
 * Get edge label based on relationship type
 */
function getRelLabel(type: string): string {
  switch (type) {
    case "<":
      return "1 ─ *";
    case ">":
      return "* ─ 1";
    case "-":
      return "1 ─ 1";
    case "<>":
      return "* ─ *";
    default:
      return "";
  }
}

/**
 * Get edge color based on relationship type
 */
function getRelColor(type: string): string {
  switch (type) {
    case ">":
      return "#3b82f6"; // blue
    case "-":
      return "#8b5cf6"; // purple
    case "<>":
      return "#f59e0b"; // amber
    default:
      return "#64748b"; // slate
  }
}

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set, get) => ({
      code: DEFAULT_CODE,
      schema: parseDBML(DEFAULT_CODE),
      nodes: [],
      edges: [],

      setCode: (code) => {
        const schema = parseDBML(code);
        set((state) => {
          // Merge existing node positions
          const newNodes: Node[] = schema.tables.map((table, index) => {
            const existingNode = state.nodes.find((n) => n.id === table.name);
            return {
              id: table.name,
              position: existingNode?.position || {
                x: 100 + (index % 3) * 320,
                y: 100 + Math.floor(index / 3) * 320,
              },
              data: { label: table.name, columns: table.columns },
              type: "table",
              style: { border: '1px solid #777', padding: 0, borderRadius: 5, background: '#fff' }
            };
          });

          // Generate edges from refs with relationship type styling
          const newEdges: Edge[] = schema.refs.map((ref, idx) => {
            const color = getRelColor(ref.type);
            return {
              id: `ref-${idx}`,
              source: ref.fromTable,
              target: ref.toTable,
              sourceHandle: `${ref.fromTable}-source`,
              targetHandle: `${ref.toTable}-target`,
              type: "default",
              label: getRelLabel(ref.type),
              labelStyle: {
                fontSize: 12,
                fontWeight: 700,
                fill: color,
              },
              labelBgStyle: {
                fill: "#f8fafc",
                fillOpacity: 0.9,
              },
              labelBgPadding: [6, 4] as [number, number],
              labelBgBorderRadius: 4,
              markerEnd: ref.type === "<>"
                ? { type: "arrowclosed" as any, color }
                : { type: "arrowclosed" as any, color },
              markerStart: ref.type === "<>"
                ? { type: "arrowclosed" as any, color }
                : undefined,
              style: {
                strokeWidth: 2,
                stroke: color,
              },
              animated: ref.type === "<>",
            };
          });

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
    }),
    {
      name: "dbdiagram-schema",
      partialize: (state) => ({ code: state.code }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // Re-parse the persisted code to rebuild schema, nodes, and edges
            state.setCode(state.code);
          }
        };
      },
    }
  )
);

