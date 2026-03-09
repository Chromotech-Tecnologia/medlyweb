import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFromStorage, setToStorage, getAll, getById,
  create, update, softDelete, hardDelete,
} from './storage';
import type { BaseEntity } from './types';

const TEST_KEY = 'test_storage_key';

interface TestItem extends BaseEntity {
  name: string;
}

beforeEach(() => {
  localStorage.clear();
});

describe('getFromStorage / setToStorage', () => {
  it('returns empty array when key does not exist', () => {
    expect(getFromStorage(TEST_KEY)).toEqual([]);
  });

  it('stores and retrieves data', () => {
    setToStorage(TEST_KEY, [{ id: '1', name: 'test' }]);
    expect(getFromStorage(TEST_KEY)).toEqual([{ id: '1', name: 'test' }]);
  });
});

describe('create', () => {
  it('creates item with generated id and timestamps', () => {
    const item = create<TestItem>(TEST_KEY, { name: 'New Item' });
    expect(item.id).toBeTruthy();
    expect(item.createdAt).toBeTruthy();
    expect(item.deletedAt).toBeNull();
    expect((item as any).name).toBe('New Item');
  });
});

describe('getAll', () => {
  it('excludes soft-deleted by default', () => {
    setToStorage(TEST_KEY, [
      { id: '1', name: 'a', createdAt: '', updatedAt: '', deletedAt: null },
      { id: '2', name: 'b', createdAt: '', updatedAt: '', deletedAt: '2026-01-01' },
    ]);
    expect(getAll<TestItem>(TEST_KEY)).toHaveLength(1);
    expect(getAll<TestItem>(TEST_KEY, true)).toHaveLength(2);
  });
});

describe('getById', () => {
  it('finds existing item', () => {
    setToStorage(TEST_KEY, [
      { id: '1', name: 'a', createdAt: '', updatedAt: '', deletedAt: null },
    ]);
    expect(getById<TestItem>(TEST_KEY, '1')?.id).toBe('1');
  });

  it('returns undefined for deleted item', () => {
    setToStorage(TEST_KEY, [
      { id: '1', name: 'a', createdAt: '', updatedAt: '', deletedAt: '2026-01-01' },
    ]);
    expect(getById<TestItem>(TEST_KEY, '1')).toBeUndefined();
  });
});

describe('update', () => {
  it('updates item fields', () => {
    create<TestItem>(TEST_KEY, { name: 'Old' });
    const items = getAll<TestItem>(TEST_KEY);
    const updated = update<TestItem>(TEST_KEY, items[0].id, { name: 'New' });
    expect((updated as any).name).toBe('New');
  });

  it('returns undefined for non-existent id', () => {
    expect(update(TEST_KEY, 'nope', { name: 'x' })).toBeUndefined();
  });
});

describe('softDelete', () => {
  it('marks item as deleted', () => {
    const item = create<TestItem>(TEST_KEY, { name: 'x' });
    expect(softDelete(TEST_KEY, item.id)).toBe(true);
    expect(getAll<TestItem>(TEST_KEY)).toHaveLength(0);
    expect(getAll<TestItem>(TEST_KEY, true)).toHaveLength(1);
  });
});

describe('hardDelete', () => {
  it('removes item permanently', () => {
    const item = create<TestItem>(TEST_KEY, { name: 'x' });
    expect(hardDelete(TEST_KEY, item.id)).toBe(true);
    expect(getAll<TestItem>(TEST_KEY, true)).toHaveLength(0);
  });
});
