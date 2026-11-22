import { openDatabaseAsync } from 'expo-sqlite';
import { sampleClothing } from '../demo/data';

/** @typedef {import('../demo/data').Clothing} Clothing */
/** @typedef {{id: string, wornAt: string, items: Clothing[], outfitId?: string}} WearEntry */
/** @typedef {import('../utils/recommendationEngine').Outfit} Outfit */
/** @param {import('expo-sqlite').SQLiteDatabase} db */
export function createRepository(db) {
  return {
    async initialize() {
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      const version = await db.getFirstAsync('PRAGMA user_version');
      if (version.user_version > 1) throw new Error('This database needs a newer version of StyleMate.');
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.execAsync(`
          CREATE TABLE IF NOT EXISTS clothing (
            id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, image_uri TEXT,
            category TEXT NOT NULL, item_type TEXT NOT NULL, color TEXT NOT NULL,
            style TEXT NOT NULL, pattern TEXT NOT NULL, seasons_json TEXT NOT NULL,
            illustration TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS outfits (
            id TEXT PRIMARY KEY NOT NULL, snapshot_json TEXT NOT NULL,
            is_favorite INTEGER NOT NULL DEFAULT 0 CHECK(is_favorite IN (0,1)), updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS outfit_history (
            id TEXT PRIMARY KEY NOT NULL, outfit_id TEXT REFERENCES outfits(id) ON DELETE SET NULL,
            outfit_snapshot_json TEXT NOT NULL, worn_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS image_cleanup (uri TEXT PRIMARY KEY NOT NULL);
          PRAGMA user_version = 1;
        `);
      });
    },
    async load() {
      const rows = await db.getAllAsync('SELECT * FROM clothing ORDER BY created_at DESC, id ASC');
      const outfits = await db.getAllAsync('SELECT snapshot_json FROM outfits WHERE is_favorite = 1 ORDER BY updated_at DESC, id ASC');
      const history = await db.getAllAsync('SELECT id, outfit_id, outfit_snapshot_json, worn_at FROM outfit_history ORDER BY worn_at DESC, id DESC');
      const setting = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', 'preferredStyle');
      return {
        items: rows.map((row) => /** @type {Clothing} */ ({ id: row.id, name: row.name, imageUri: row.image_uri ?? undefined, category: row.category, itemType: row.item_type, color: row.color, style: row.style, pattern: row.pattern, seasons: JSON.parse(row.seasons_json), image: row.illustration })),
        savedOutfits: outfits.map((row) => { const snapshot = JSON.parse(row.snapshot_json); return /** @type {Outfit} */ ({ ...snapshot, items: snapshot.items ?? [], legacy: snapshot.id === 'demo-outfit' }); }),
        history: history.map((row) => /** @type {WearEntry} */ ({ id: row.id, outfitId: row.outfit_id, wornAt: row.worn_at, items: JSON.parse(row.outfit_snapshot_json) })),
        preferredStyle: setting?.value ?? 'any',
      };
    },
    /** @param {Clothing} item */
    async saveItem(item) {
      await db.withExclusiveTransactionAsync(async (tx) => {
        const old = await tx.getFirstAsync('SELECT image_uri FROM clothing WHERE id = ?', item.id);
        const now = new Date().toISOString();
        await tx.runAsync(`INSERT INTO clothing VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, image_uri=excluded.image_uri,
          category=excluded.category, item_type=excluded.item_type, color=excluded.color,
          style=excluded.style, pattern=excluded.pattern, seasons_json=excluded.seasons_json,
          illustration=excluded.illustration, updated_at=excluded.updated_at`,
        item.id, item.name, item.imageUri ?? null, item.category, item.itemType, item.color, item.style, item.pattern, JSON.stringify(item.seasons), item.image, now, now);
        if (old?.image_uri && old.image_uri !== item.imageUri) await tx.runAsync('INSERT OR IGNORE INTO image_cleanup VALUES (?)', old.image_uri);
      });
    },
    /** @param {string} id */
    async deleteItem(id) {
      await db.withExclusiveTransactionAsync(async (tx) => {
        const old = await tx.getFirstAsync('SELECT image_uri FROM clothing WHERE id = ?', id);
        if (old?.image_uri) await tx.runAsync('INSERT OR IGNORE INTO image_cleanup VALUES (?)', old.image_uri);
        await tx.runAsync('DELETE FROM clothing WHERE id = ?', id);
      });
    },
    /** @param {Outfit} outfit @param {boolean} saved */
    async setFavorite(outfit, saved) {
      await db.runAsync(`INSERT INTO outfits VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET snapshot_json=excluded.snapshot_json, is_favorite=excluded.is_favorite, updated_at=excluded.updated_at`, outfit.id, JSON.stringify(outfit), saved ? 1 : 0, new Date().toISOString());
    },
    /** @param {WearEntry} entry @param {Outfit} outfit */
    async markWorn(entry, outfit) {
      await db.withExclusiveTransactionAsync(async (tx) => {
        await tx.runAsync('INSERT OR IGNORE INTO outfits VALUES (?, ?, 0, ?)', outfit.id, JSON.stringify(outfit), entry.wornAt);
        await tx.runAsync('INSERT OR IGNORE INTO outfit_history VALUES (?, ?, ?, ?)', entry.id, outfit.id, JSON.stringify(entry.items), entry.wornAt);
      });
    },
    /** @param {string} style */
    async setStyle(style) { await db.runAsync('INSERT INTO settings VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', 'preferredStyle', style); },
    /** Samples are explicit opt-in and never replace photos or user edits. */
    async addSamples() {
      for (const item of sampleClothing) {
        const exists = await db.getFirstAsync('SELECT id FROM clothing WHERE id = ?', item.id);
        if (!exists) await this.saveItem(item);
      }
    },
    async hideSamples() { await db.runAsync("DELETE FROM clothing WHERE id LIKE 'demo-%' AND image_uri IS NULL"); },
    /** @param {(uri: string) => Promise<void>} remove */
    async cleanup(remove) {
      const pending = await db.getAllAsync('SELECT uri FROM image_cleanup');
      for (const { uri } of pending) {
        try {
          const referenced = await db.getFirstAsync('SELECT id FROM clothing WHERE image_uri = ?', uri);
          if (!referenced) await remove(uri);
          await db.runAsync('DELETE FROM image_cleanup WHERE uri = ?', uri);
        } catch { /* Keep queued and retry on the next launch or mutation. */ }
      }
    },
  };
}
/** @type {Promise<ReturnType<typeof createRepository>> | undefined} */
let opening;
export function getRepository() {
  if (!opening) opening = (async () => {
    const db = await openDatabaseAsync('stylemate.db');
    try {
      const repository = createRepository(db);
      await repository.initialize();
      return repository;
    } catch (error) { await db.closeAsync(); throw error; }
  })().catch((error) => { opening = undefined; throw error; });
  return opening;
}
