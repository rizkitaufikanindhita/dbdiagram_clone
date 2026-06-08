"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { ERDiagram } from "@/components/diagram/ERDiagram";
import { SplitPane } from "@/components/layout/SplitPane";
import { Navbar } from "@/components/layout/Navbar";
import { ReactFlowProvider } from "reactflow";

export default function Home() {
  return (
    <ReactFlowProvider>
      <main className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50">
        <Navbar />
        <div className="flex-1 overflow-hidden relative">
          <SplitPane
            className="h-full w-full"
            left={<CodeEditor />}
            right={<ERDiagram />}
            initialLeftWidth={30}
          />
        </div>
      </main>
    </ReactFlowProvider>
  );
}
