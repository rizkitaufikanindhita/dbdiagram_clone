export interface Column {
  name: string;
  type: string;
  isPk?: boolean;
}

export interface Table {
  name: string;
  columns: Column[];
  position?: { x: number; y: number };
}

export interface Relationship {
  fromTable: string;
  fromCol: string;
  toTable: string;
  toCol: string;
  type: string; // '>' | '<' | '-'
}

export interface Schema {
  tables: Table[];
  refs: Relationship[];
}

export function parseDBML(text: string): Schema {
  const tables: Table[] = [];
  const refs: Relationship[] = [];
  const lines = text.split("\n");
  let currentTable: Table | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match "Ref: table.col > table.col"
    // simplified: Ref: (\w+).(\w+) ([><-]) (\w+).(\w+)
    const refMatch = trimmed.match(/^Ref:\s*(\w+)\.(\w+)\s*([><-])\s*(\w+)\.(\w+)/i);
    if (refMatch) {
      refs.push({
        fromTable: refMatch[1],
        fromCol: refMatch[2],
        type: refMatch[3],
        toTable: refMatch[4],
        toCol: refMatch[5],
      });
      continue;
    }

    // Match "Table Name {"
    const tableMatch = trimmed.match(/^Table\s+(\w+)\s*\{?$/i);
    if (tableMatch) {
      currentTable = { name: tableMatch[1], columns: [] };
      tables.push(currentTable);
      continue;
    }

    // Match "}"
    if (trimmed === "}") {
      currentTable = null;
      continue;
    }

    // Match Column: "id int [pk]" or "id int"
    if (currentTable) {
      // Basic match: name type [settings]
      // simplified regex for now
      const colMatch = trimmed.match(/^(\w+)\s+(\w+)(\s*\[.*\])?/);
      if (colMatch) {
        const isPk = colMatch[3]?.includes("pk") || false;
        currentTable.columns.push({
          name: colMatch[1],
          type: colMatch[2],
          isPk,
        });
      }
    }
  }

  return { tables, refs };
}
