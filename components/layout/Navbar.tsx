"use client";

import React from "react";
import { Download, Clipboard, Image } from "lucide-react";
import { useSchemaStore } from "@/store/schemaStore";
import { generateSQL } from "@/lib/exporter";
import { useReactFlow, getRectOfNodes, getTransformForBounds } from "reactflow";
import { toPng } from "html-to-image";

export function Navbar() {
  const schema = useSchemaStore((state) => state.schema);
  const { getNodes } = useReactFlow();

  const handleExport = () => {
    const sql = generateSQL(schema);
    navigator.clipboard.writeText(sql).then(() => {
        alert("SQL copied to clipboard!");
    });
  };

  const handleExportImage = () => {
    const nodes = getNodes();
    if (nodes.length === 0) {
      alert("No tables to export!");
      return;
    }

    const viewportEl = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewportEl) {
      alert("Could not find diagram canvas viewport!");
      return;
    }

    // Calculate a bounding box for all tables/nodes
    const nodesBounds = getRectOfNodes(nodes);
    const padding = 60;
    const width = nodesBounds.width + padding * 2;
    const height = nodesBounds.height + padding * 2;

    // Calculate a transform mapping the viewport to perfectly bound all nodes in the image
    const transform = getTransformForBounds(
      nodesBounds,
      width,
      height,
      0.05, // min zoom limit
      2     // max zoom limit
    );

    toPng(viewportEl, {
      backgroundColor: "#f8fafc",
      width: width,
      height: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `dbdiagram-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong while exporting diagram PNG:", error);
        alert("Failed to export image!");
      });
  };

  return (
    <nav className="flex h-14 w-full items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-primary/10 p-1">
            {/* Logo placeholder */}
            <div className="h-full w-full rounded bg-indigo-600" />
        </div>
        <h1 className="text-lg font-bold text-slate-800">DBDiagram Clone</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            const code = useSchemaStore.getState().code;
            navigator.clipboard.writeText(code).then(() => alert("DBML copied to clipboard!"));
          }}
          className="flex items-center gap-2 rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <Clipboard className="h-4 w-4" />
          Export DBML
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Download className="h-4 w-4" />
          Export SQL
        </button>
        <button
          onClick={handleExportImage}
          className="flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
        >
          <Image className="h-4 w-4" />
          Export PNG
        </button>
      </div>
    </nav>
  );
}
