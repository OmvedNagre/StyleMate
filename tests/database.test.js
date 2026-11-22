/** @jest-environment node */
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRepository } from '../src/services/database';
import { generateOutfits } from '../src/utils/recommendationEngine';
import { sampleClothing } from '../src/demo/data';

const outfit = generateOutfits(sampleClothing, {}, [], Date.parse('2026-11-22T12:00:00Z')).outfits[0];

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
let folder;
let native;
let db;
let repo;
function open() {
  native = new DatabaseSync(join(folder, 'test.db'));
  db = {
    execAsync: async (sql) => native.exec(sql),
    runAsync: async (sql, ...args) => native.prepare(sql).run(...args),
    getFirstAsync: async (sql, ...args) => native.prepare(sql).get(...args) ?? null,
    getAllAsync: async (sql, ...args) => native.prepare(sql).all(...args),
    withExclusiveTransactionAsync: async (action) => {
      native.exec('BEGIN IMMEDIATE');
      try { await action(db); native.exec('COMMIT'); }
      catch (error) { native.exec('ROLLBACK'); throw error; }
    },
  };
  repo = createRepository(db);
}
beforeEach(async () => { folder = mkdtempSync(join(tmpdir(), 'stylemate-db-')); open(); await repo.initialize(); });
afterEach(() => { native.close(); rmSync(folder, { recursive: true, force: true }); });

test('fresh database is empty; migration is repeatable and rejects future schemas', async () => {
  await repo.initialize();
  expect((await repo.load()).items).toEqual([]);
  expect(native.prepare('PRAGMA foreign_keys').get().foreign_keys).toBe(1);
  native.exec('PRAGMA user_version = 2');
  await expect(repo.initialize()).rejects.toThrow('newer version');
});

test('clothing, favorites, history and preferences survive a real database close/reopen', async () => {
  const item = { ...sampleClothing[0], id: 'user-1', name: "Alice's shirt; DROP TABLE clothing;--", imageUri: 'file:///documents/wardrobe/clothing-a.jpg' };
  await repo.saveItem(item);
  await repo.setFavorite(outfit, true);
  await repo.markWorn({ id: 'wear-1', wornAt: '2026-11-22T10:00:00Z', items: [item] }, outfit);
  await repo.setStyle('formal');
  native.close(); open(); await repo.initialize();
  const loaded = await repo.load();
  expect(loaded.items).toEqual([item]);
  expect(loaded.savedOutfits[0]).toMatchObject(outfit);
  expect(loaded.preferredStyle).toBe('formal');
  expect(loaded.history[0].items).toEqual([item]);
});

test('replacement and deletion queue old images after durable record updates', async () => {
  const item = { ...sampleClothing[0], imageUri: 'file:///documents/wardrobe/clothing-old.jpg' };
  await repo.saveItem(item);
  await repo.saveItem({ ...item, name: 'Updated', imageUri: 'file:///documents/wardrobe/clothing-new.jpg' });
  expect((await repo.load()).items).toHaveLength(1);
  expect((await repo.load()).items[0].name).toBe('Updated');
  const remove = jest.fn().mockRejectedValueOnce(new Error('Busy'));
  await repo.cleanup(remove);
  expect(native.prepare('SELECT * FROM image_cleanup').all()).toHaveLength(1);
  await repo.cleanup(remove);
  expect(native.prepare('SELECT * FROM image_cleanup').all()).toHaveLength(0);
  await repo.deleteItem(item.id);
  expect((await repo.load()).items).toEqual([]);
  expect(native.prepare('SELECT uri FROM image_cleanup').get().uri).toContain('clothing-new.jpg');
});

test('transaction rollback retains the old record and does not queue its photo', async () => {
  const item = { ...sampleClothing[0], imageUri: 'file:///documents/wardrobe/clothing-old.jpg' };
  await repo.saveItem(item);
  native.exec("CREATE TRIGGER fail_cleanup BEFORE INSERT ON image_cleanup BEGIN SELECT RAISE(ABORT, 'Full disk simulation'); END;");
  await expect(repo.saveItem({ ...item, name: 'New', imageUri: 'file:///documents/wardrobe/clothing-new.jpg' })).rejects.toThrow();
  expect((await repo.load()).items[0]).toEqual(item);
  await expect(repo.deleteItem(item.id)).rejects.toThrow();
  expect((await repo.load()).items).toHaveLength(1);
});

test('history survives item deletion, deduplicates a repeated request and orders newest first', async () => {
  await repo.saveItem(sampleClothing[0]);
  const entry = { id: 'first', wornAt: '2026-11-21T10:00:00Z', items: [sampleClothing[0]] };
  await repo.markWorn(entry, outfit); await repo.markWorn(entry, outfit);
  await repo.markWorn({ ...entry, id: 'second', wornAt: '2026-11-22T10:00:00Z' }, outfit);
  await repo.deleteItem(sampleClothing[0].id);
  expect((await repo.load()).history.map((row) => row.id)).toEqual(['second', 'first']);
  expect((await repo.load()).history[0].items).toEqual(entry.items);
  await repo.setFavorite(outfit, true); await repo.setFavorite(outfit, false);
  expect((await repo.load()).savedOutfits).toEqual([]);
});

test('sample controls preserve user photos and do not replace existing edits', async () => {
  await repo.addSamples();
  const item = { ...sampleClothing[0], name: 'My edit', imageUri: 'file:///documents/wardrobe/clothing-user.jpg' };
  await repo.saveItem(item);
  await repo.addSamples();
  expect((await repo.load()).items.find((row) => row.id === item.id)).toEqual(item);
  await repo.hideSamples();
  expect((await repo.load()).items).toEqual([item]);
});
