import { type Database } from 'sql.js';
export type SqlValue = string | number | null;
export type SqlRow = Record<string, unknown>;
export declare const getDatabase: () => Promise<Database>;
export declare const all: <T extends SqlRow>(sql: string, params?: SqlValue[]) => Promise<T[]>;
export declare const get: <T extends SqlRow>(sql: string, params?: SqlValue[]) => Promise<T | undefined>;
export declare const run: (sql: string, params?: SqlValue[]) => Promise<void>;
export declare const transaction: <T>(callback: (db: Database) => Promise<T> | T) => Promise<T>;
export declare const nowIso: () => string;
export declare const createId: () => `${string}-${string}-${string}-${string}-${string}`;
export declare const boolFromRow: (value: unknown) => value is true | 1 | "1";
//# sourceMappingURL=sqlite.d.ts.map