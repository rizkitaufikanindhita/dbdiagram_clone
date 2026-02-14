"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { Column } from "@/lib/parser";

interface TableNodeData {
  label: string;
  columns: Column[];
}

const TableNode = ({ data }: NodeProps<TableNodeData>) => {
  return (
    <div className="min-w-[200px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-800">{data.label}</h3>
        {/* Connection Handle (Header) */}
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-slate-300 !w-2 !h-2"
          id={`${data.label}-target`}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-slate-300 !w-2 !h-2"
          id={`${data.label}-source`}
        />
      </div>

      {/* Columns */}
      <div className="p-2">
        {data.columns.map((col, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1 text-xs text-slate-700"
          >
            <div className="flex items-center gap-1">
              {col.isPk && <Key className="h-3 w-3 text-amber-500" />}
              <span className={cn(col.isPk && "font-semibold")}>{col.name}</span>
            </div>
            <span className="text-slate-400">{col.type}</span>
            
            {/* Per-column handles for more precise connections later? 
                For MVP, table-level handles are easier, but let's see. 
                Use table handles for now to keep clutter low. 
             */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TableNode);
