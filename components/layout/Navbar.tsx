"use client";

import React from "react";
import { Download, Clipboard } from "lucide-react";
import { useSchemaStore } from "@/store/schemaStore";
import { generateSQL } from "@/lib/exporter";

export function Navbar() {
  const schema = useSchemaStore((state) => state.schema);

  const handleExport = () => {
    const sql = generateSQL(schema);
    navigator.clipboard.writeText(sql).then(() => {
        alert("SQL copied to clipboard!");
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
      </div>
    </nav>
  );
}
