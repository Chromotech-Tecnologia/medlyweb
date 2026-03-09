import { describe, it, expect } from 'vitest';
import { checkScaleOverlap, checkDoctorScheduleConflict, formatDistance, getGoogleMapsUrl } from './scaleUtils';
import type { Scale } from './mocks/types';

const makeScale = (overrides: Partial<Scale> = {}): Scale => ({
  id: 'scale-1',
  locationId: 'loc-1',
  scaleTypeId: 'st-1',
  specialtyId: 'spec-1',
  title: 'Plantão',
  date: '2026-03-15',
  startTime: '07:00',
  endTime: '19:00',
  shift: 'plantao_12h',
  status: 'publicada',
  cancellationDeadlineDays: 3,
  transferDeadlineDays: 2,
  paymentValue: 1500,
  paymentStatus: 'pendente',
  createdAt: '',
  updatedAt: '',
  deletedAt: null,
  ...overrides,
});

describe('checkScaleOverlap', () => {
  it('detects overlap on same location/specialty/date/time', () => {
    const existing = [makeScale()];
    const result = checkScaleOverlap(existing, {
      locationId: 'loc-1',
      specialtyId: 'spec-1',
      date: '2026-03-15',
      startTime: '08:00',
      endTime: '20:00',
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('same_location_specialty');
  });

  it('returns empty for different date', () => {
    const existing = [makeScale()];
    const result = checkScaleOverlap(existing, {
      locationId: 'loc-1',
      specialtyId: 'spec-1',
      date: '2026-03-16',
      startTime: '07:00',
      endTime: '19:00',
    });
    expect(result).toHaveLength(0);
  });

  it('returns empty for different location', () => {
    const existing = [makeScale()];
    const result = checkScaleOverlap(existing, {
      locationId: 'loc-2',
      specialtyId: 'spec-1',
      date: '2026-03-15',
      startTime: '07:00',
      endTime: '19:00',
    });
    expect(result).toHaveLength(0);
  });

  it('skips cancelled scales', () => {
    const existing = [makeScale({ status: 'cancelada' })];
    const result = checkScaleOverlap(existing, {
      locationId: 'loc-1',
      specialtyId: 'spec-1',
      date: '2026-03-15',
      startTime: '07:00',
      endTime: '19:00',
    });
    expect(result).toHaveLength(0);
  });

  it('skips self when editing', () => {
    const existing = [makeScale({ id: 'scale-1' })];
    const result = checkScaleOverlap(existing, {
      id: 'scale-1',
      locationId: 'loc-1',
      specialtyId: 'spec-1',
      date: '2026-03-15',
      startTime: '07:00',
      endTime: '19:00',
    });
    expect(result).toHaveLength(0);
  });
});

describe('checkDoctorScheduleConflict', () => {
  it('detects time conflict on same date', () => {
    const doctorScales = [makeScale()];
    const result = checkDoctorScheduleConflict(doctorScales, {
      date: '2026-03-15',
      startTime: '10:00',
      endTime: '22:00',
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('doctor_schedule_conflict');
  });

  it('no conflict on different date', () => {
    const doctorScales = [makeScale()];
    const result = checkDoctorScheduleConflict(doctorScales, {
      date: '2026-03-16',
      startTime: '07:00',
      endTime: '19:00',
    });
    expect(result).toHaveLength(0);
  });
});

describe('formatDistance', () => {
  it('formats meters under 1000', () => {
    expect(formatDistance(500)).toBe('500m');
    expect(formatDistance(99)).toBe('99m');
  });

  it('formats kilometers', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(10000)).toBe('10.0km');
  });
});

describe('getGoogleMapsUrl', () => {
  it('generates correct URL', () => {
    const url = getGoogleMapsUrl(-23.55, -46.63);
    expect(url).toContain('-23.55');
    expect(url).toContain('-46.63');
    expect(url).toContain('google.com/maps');
  });
});
