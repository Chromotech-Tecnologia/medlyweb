import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv } from './exportUtils';

describe('exportToCsv', () => {
  let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('does nothing for empty data', () => {
    exportToCsv([], 'test');
    expect(mockLink.click).not.toHaveBeenCalled();
  });

  it('generates CSV and triggers download', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    exportToCsv(data, 'users');
    expect(mockLink.click).toHaveBeenCalledOnce();
    expect(mockLink.download).toContain('users_');
    expect(mockLink.download).toContain('.csv');
  });

  it('uses custom columns when provided', () => {
    const data = [{ name: 'Alice', age: 30, hidden: 'x' }];
    exportToCsv(data, 'test', [
      { key: 'name', label: 'Nome' },
      { key: 'age', label: 'Idade' },
    ]);
    expect(mockLink.click).toHaveBeenCalledOnce();
  });

  it('handles null/undefined values', () => {
    const data = [{ name: null, value: undefined }];
    exportToCsv(data as any, 'test');
    expect(mockLink.click).toHaveBeenCalledOnce();
  });
});
