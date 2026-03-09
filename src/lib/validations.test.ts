import { describe, it, expect } from 'vitest';
import { loginSchema, scaleSchema, paymentSchema, userSchema } from './validations';

describe('loginSchema', () => {
  it('validates correct data', () => {
    const result = loginSchema.safeParse({ email: 'test@email.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@email.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('scaleSchema', () => {
  const validScale = {
    locationId: 'loc-1',
    scaleTypeId: 'st-1',
    specialtyId: 'spec-1',
    title: 'Plantão',
    date: '2026-03-15',
    startTime: '07:00',
    endTime: '19:00',
    shift: 'manha' as const,
    cancellationDeadlineDays: 3,
    transferDeadlineDays: 2,
    paymentValue: 1500,
  };

  it('validates correct data', () => {
    expect(scaleSchema.safeParse(validScale).success).toBe(true);
  });

  it('rejects missing title', () => {
    expect(scaleSchema.safeParse({ ...validScale, title: '' }).success).toBe(false);
  });

  it('rejects negative payment', () => {
    expect(scaleSchema.safeParse({ ...validScale, paymentValue: -1 }).success).toBe(false);
  });
});

describe('paymentSchema', () => {
  it('validates correct data', () => {
    const result = paymentSchema.safeParse({
      scaleId: 's1', doctorId: 'd1', amount: 100, dueDate: '2026-03-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing scaleId', () => {
    const result = paymentSchema.safeParse({
      scaleId: '', doctorId: 'd1', amount: 100, dueDate: '2026-03-15',
    });
    expect(result.success).toBe(false);
  });
});

describe('userSchema', () => {
  it('validates correct data', () => {
    const result = userSchema.safeParse({
      name: 'Test User', email: 'test@test.com', phone: '(11) 99999-9999',
      cpf: '52998224725', role: 'medico', status: 'ativo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid CPF', () => {
    const result = userSchema.safeParse({
      name: 'Test', email: 'test@test.com', phone: '123',
      cpf: '11111111111', role: 'medico', status: 'ativo',
    });
    expect(result.success).toBe(false);
  });
});
