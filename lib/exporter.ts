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
    // Ref: fromTable.fromCol > toTable.toCol
    // We assume '>' means from -> to (Foreign Key on 'from' referencing 'to')
    // Standard DBML: Ref: posts.user_id > users.id  means posts.user_id is FK to users.id
    
    // We need to decide which table gets the ALTER TABLE.
    // Usually the "many" side (the one with the FK) references the "one" side.
    // In "posts.user_id > users.id", posts is the child, users is the parent.
    // So ALTER TABLE "posts" ... REFERENCES "users"
    
    const sourceTable = ref.fromTable;
    const sourceCol = ref.fromCol;
    const targetTable = ref.toTable;
    const targetCol = ref.toCol;
    
    // Check relationship type if needed, but for MVP '>' is standard FK
    statements.push(
      `ALTER TABLE "${sourceTable}" ADD FOREIGN KEY ("${sourceCol}") REFERENCES "${targetTable}" ("${targetCol}");`
    );
  }

  return statements.join("\n\n");
}
