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
  type: string; // '>' (many-to-one) | '<' (one-to-many) | '-' (one-to-one) | '<>' (many-to-many)
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

    // --- Match Ref ---
    // Ref: TableA.col <> | > | < | - TableB.col
    // Support quoted identifiers: "My Table".col
    const refMatch = trimmed.match(
      /^Ref\s*:\s*(?:"([^"]+)"|(\w+))\s*\.\s*(?:"([^"]+)"|(\w+))\s*(<>|>|<|-)\s*(?:"([^"]+)"|(\w+))\s*\.\s*(?:"([^"]+)"|(\w+))/i
    );
    if (refMatch) {
      refs.push({
        fromTable: refMatch[1] || refMatch[2],
        fromCol: refMatch[3] || refMatch[4],
        type: refMatch[5],
        toTable: refMatch[6] || refMatch[7],
        toCol: refMatch[8] || refMatch[9],
      });
      continue;
    }

    // --- Match Table ---
    // Table Name { or Table "Quoted Name" {
    const tableMatch = trimmed.match(/^Table\s+(?:"([^"]+)"|(\w+))\s*\{?$/i);
    if (tableMatch) {
      const tableName = tableMatch[1] || tableMatch[2];
      currentTable = { name: tableName, columns: [] };
      tables.push(currentTable);
      continue;
    }

    // --- Match closing brace ---
    if (trimmed === "}") {
      currentTable = null;
      continue;
    }

    // --- Match Column ---
    if (currentTable) {
      // Match: name type [settings]
      // name can be quoted "my col" or simple word
      // type can be multi-word like varchar(255) or double precision
      const colMatch = trimmed.match(
        /^(?:"([^"]+)"|(\w+))\s+([\w]+(?:\([^)]*\))?(?:\s+\w+)*)(\s*\[.*\])?/
      );
      if (colMatch) {
        const colName = colMatch[1] || colMatch[2];
        const colType = colMatch[3].trim();
        const isPk = colMatch[4]?.includes("pk") || false;
        currentTable.columns.push({
          name: colName,
          type: colType,
          isPk,
        });
      }
    }
  }

  return { tables, refs };
}
