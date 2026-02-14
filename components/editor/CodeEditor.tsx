"use client";

import { useSchemaStore } from "@/store/schemaStore";
import Editor from "@monaco-editor/react";

export function CodeEditor() {
  const code = useSchemaStore((state) => state.code);
  const setCode = useSchemaStore((state) => state.setCode);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="sql" // closest syntax highlight for now
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
