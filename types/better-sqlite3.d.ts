// Minimale Typdeklaration, damit TypeScript better-sqlite3 kennt.
// (Die offiziellen Typen wuerden eine zusaetzliche Abhaengigkeit erfordern.)
declare module "better-sqlite3" {
  type Database = {
    exec(sql: string): Database;
    close(): Database;
  };
  const DatabaseConstructor: new (path: string) => Database;
  export default DatabaseConstructor;
}
