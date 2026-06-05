import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { schemaSql } from './schema.js';

export type SqlValue = string | number | null;
export type SqlRow = Record<string, unknown>;

const dataDir = path.resolve(process.cwd(), 'data');
const databasePath = path.join(dataDir, 'food-delivery.sqlite');
const wasmDir = path.resolve(process.cwd(), 'node_modules/sql.js/dist');

let sqlPromise: Promise<SqlJsStatic> | null = null;
let databasePromise: Promise<Database> | null = null;

const toBoolean = (value: unknown) => value === 1 || value === true || value === '1';

const queryAllSync = <T extends SqlRow>(db: Database, sql: string, params: SqlValue[] = []) => {
  const statement = db.prepare(sql);
  statement.bind(params);

  const rows: T[] = [];
  while (statement.step()) {
    rows.push(statement.getAsObject() as T);
  }

  statement.free();
  return rows;
};

const runSync = (db: Database, sql: string, params: SqlValue[] = []) => {
  const statement = db.prepare(sql);
  statement.run(params);
  statement.free();
};

const persist = async (db: Database) => {
  await fs.mkdir(dataDir, { recursive: true });
  const bytes = db.export();
  await fs.writeFile(databasePath, Buffer.from(bytes));
};

const seedSampleData = (db: Database) => {
  const { count } = queryAllSync<{ count: number }>(db, 'SELECT COUNT(*) as count FROM restaurants')[0] ?? {
    count: 0,
  };

  if (Number(count) > 0) {
    return;
  }

  const now = new Date().toISOString();
  const restaurants = [
    {
      id: randomUUID(),
      name: 'Spice Circuit',
      description: 'Bold Indian comfort food with quick pickup and delivery.',
      imageUrl: null,
      cuisineType: 'Indian',
      rating: 4.8,
      isActive: 1,
      ownerId: null,
    },
    {
      id: randomUUID(),
      name: 'Green Bowl Studio',
      description: 'Fresh salads, bowls, and clean-energy lunches.',
      imageUrl: null,
      cuisineType: 'Healthy',
      rating: 4.6,
      isActive: 1,
      ownerId: null,
    },
  ];

  const firstRestaurant = restaurants[0]!;
  const secondRestaurant = restaurants[1]!;

  for (const restaurant of restaurants) {
    runSync(
      db,
      `INSERT INTO restaurants (
        id, name, description, image_url, cuisine_type, rating, is_active, owner_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant.id,
        restaurant.name,
        restaurant.description,
        restaurant.imageUrl,
        restaurant.cuisineType,
        restaurant.rating,
        restaurant.isActive,
        restaurant.ownerId,
        now,
        now,
      ],
    );
  }

  const menuItems = [
    {
      restaurantId: firstRestaurant.id,
      name: 'Paneer Tikka Wrap',
      description: 'Charred paneer, mint chutney, onions, and a soft wrap.',
      price: 249,
      category: 'Wraps',
    },
    {
      restaurantId: firstRestaurant.id,
      name: 'Dal Tadka Bowl',
      description: 'Comforting lentils, rice, and a butter tempering finish.',
      price: 219,
      category: 'Bowls',
    },
    {
      restaurantId: secondRestaurant.id,
      name: 'Roasted Veg Bowl',
      description: 'Seasonal vegetables, grains, and lemon-herb dressing.',
      price: 289,
      category: 'Bowls',
    },
    {
      restaurantId: secondRestaurant.id,
      name: 'Protein Salad',
      description: 'Greens, chickpeas, seeds, and a creamy tahini dressing.',
      price: 309,
      category: 'Salads',
    },
  ];

  for (const item of menuItems) {
    runSync(
      db,
      `INSERT INTO menu_items (
        id, restaurant_id, name, description, price, image_url, category, is_available, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        item.restaurantId,
        item.name,
        item.description,
        item.price,
        null,
        item.category,
        1,
        now,
        now,
      ],
    );
  }
};

const openDatabase = async () => {
  const sql = await loadSqlJs();

  await fs.mkdir(dataDir, { recursive: true });

  let db: Database;
  try {
    const file = await fs.readFile(databasePath);
    db = new sql.Database(file);
  } catch {
    db = new sql.Database();
  }

  runSync(db, 'PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);
  seedSampleData(db);
  await persist(db);

  return db;
};

const loadSqlJs = async () => {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file: string) => path.join(wasmDir, file),
    });
  }

  return sqlPromise;
};

export const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = openDatabase();
  }

  return databasePromise;
};

export const all = async <T extends SqlRow>(sql: string, params: SqlValue[] = []) => {
  const db = await getDatabase();
  return queryAllSync<T>(db, sql, params);
};

export const get = async <T extends SqlRow>(sql: string, params: SqlValue[] = []) => {
  const rows = await all<T>(sql, params);
  return rows[0];
};

export const run = async (sql: string, params: SqlValue[] = []) => {
  const db = await getDatabase();
  runSync(db, sql, params);
  await persist(db);
};

export const transaction = async <T>(callback: (db: Database) => Promise<T> | T) => {
  const db = await getDatabase();
  runSync(db, 'BEGIN');

  try {
    const result = await callback(db);
    runSync(db, 'COMMIT');
    await persist(db);
    return result;
  } catch (error) {
    runSync(db, 'ROLLBACK');
    throw error;
  }
};

export const nowIso = () => new Date().toISOString();
export const createId = () => randomUUID();
export const boolFromRow = (value: unknown) => toBoolean(value);
