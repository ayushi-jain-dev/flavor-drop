declare module 'sql.js' {
  export type SqlValue = string | number | null | Uint8Array;

  export interface Statement {
    bind(values?: SqlValue[]): void;
    run(values?: SqlValue[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }

  export interface Database {
    exec(sql: string): unknown;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array | ArrayBuffer) => Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
