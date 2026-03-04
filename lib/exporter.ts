import { Schema } from "./parser";

export function generateSQL(schema: Schema): string {
  const statements: string[] = [];

  // 1. Create Tables
  for (const table of schema.tables) {
    const lines: string[] = [];
    lines.push(`CREATE TABLE "${table.name}" (`);

    const colDefs = table.columns.map((col) => {
      let def = `  "${col.name}" ${col.type}`;
      if (col.isPk) {
        def += " PRIMARY KEY";
      }
      return def;
    });

    lines.push(colDefs.join(",\n"));
    lines.push(");");
    statements.push(lines.join("\n"));
  }

  // 2. Add Relationships
  for (const ref of schema.refs) {
    if (ref.type === ">") {
      // One-to-many: fromTable.fromCol references toTable.toCol
      // FK is on the "from" (many) side
      statements.push(
        `ALTER TABLE "${ref.fromTable}" ADD FOREIGN KEY ("${ref.fromCol}") REFERENCES "${ref.toTable}" ("${ref.toCol}");`
      );
    } else if (ref.type === "-") {
      // One-to-one: FK with UNIQUE constraint
      statements.push(
        `ALTER TABLE "${ref.fromTable}" ADD FOREIGN KEY ("${ref.fromCol}") REFERENCES "${ref.toTable}" ("${ref.toCol}");`
      );
      statements.push(
        `ALTER TABLE "${ref.fromTable}" ADD CONSTRAINT "unique_${ref.fromTable}_${ref.fromCol}" UNIQUE ("${ref.fromCol}");`
      );
    } else if (ref.type === "<>") {
      // Many-to-many: create junction table
      const junctionName = `${ref.fromTable}_${ref.toTable}`;
      statements.push(
        [
          `CREATE TABLE "${junctionName}" (`,
          `  "${ref.fromTable}_${ref.fromCol}" ${getColumnType(schema, ref.fromTable, ref.fromCol)},`,
          `  "${ref.toTable}_${ref.toCol}" ${getColumnType(schema, ref.toTable, ref.toCol)},`,
          `  PRIMARY KEY ("${ref.fromTable}_${ref.fromCol}", "${ref.toTable}_${ref.toCol}")`,
          `);`,
        ].join("\n")
      );
      statements.push(
        `ALTER TABLE "${junctionName}" ADD FOREIGN KEY ("${ref.fromTable}_${ref.fromCol}") REFERENCES "${ref.fromTable}" ("${ref.fromCol}");`
      );
      statements.push(
        `ALTER TABLE "${junctionName}" ADD FOREIGN KEY ("${ref.toTable}_${ref.toCol}") REFERENCES "${ref.toTable}" ("${ref.toCol}");`
      );
    }
  }

  return statements.join("\n\n");
}

/**
 * Helper: find the column type from the schema for junction table generation.
 */
function getColumnType(schema: Schema, tableName: string, colName: string): string {
  const table = schema.tables.find((t) => t.name === tableName);
  if (table) {
    const col = table.columns.find((c) => c.name === colName);
    if (col) return col.type;
  }
  return "integer"; // default fallback
}
