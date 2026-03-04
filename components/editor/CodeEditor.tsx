"use client";

import { useRef, useEffect } from "react";
import { useSchemaStore } from "@/store/schemaStore";
import Editor from "@monaco-editor/react";

export function CodeEditor() {
  const code = useSchemaStore((state) => state.code);
  const setCode = useSchemaStore((state) => state.setCode);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intercept keyboard events at the DOCUMENT level (bubble phase).
  // Only stop propagation when the event originates from inside the editor.
  // This lets Monaco process all keys normally (backspace, delete, etc.)
  // while preventing events from leaking to ReactFlow or other components.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const stopIfFromEditor = (e: KeyboardEvent) => {
      if (el.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", stopIfFromEditor);
    document.addEventListener("keyup", stopIfFromEditor);
    document.addEventListener("keypress", stopIfFromEditor);

    return () => {
      document.removeEventListener("keydown", stopIfFromEditor);
      document.removeEventListener("keyup", stopIfFromEditor);
      document.removeEventListener("keypress", stopIfFromEditor);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="sql"
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

