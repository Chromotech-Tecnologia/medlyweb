import type { Scale } from './mocks/types';
import { parseISO, differenceInDays, differenceInHours } from 'date-fns';

export interface ScaleOverlap {
  conflictingScale: Scale;
  type: 'same_location_specialty' | 'doctor_schedule_conflict';
  message: string;
}

/**
 * Check if two time ranges overlap on the same date
 */
function timeRangesOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  let s1 = toMinutes(start1), e1 = toMinutes(end1);
  let s2 = toMinutes(start2), e2 = toMinutes(end2);
  
  // Handle overnight shifts (end < start means next day)
  if (e1 <= s1) e1 += 24 * 60;
  if (e2 <= s2) e2 += 24 * 60;
  
  return s1 < e2 && s2 < e1;
}

/**
 * Check for scale overlaps when creating/editing a scale (escalista perspective)
 * Checks: same location + same specialty + overlapping time on same date
 */
export function checkScaleOverlap(
  existingScales: Scale[],
  newScale: { locationId: string; specialtyId: string; date: string; startTime: string; endTime: string; id?: string }
): ScaleOverlap[] {
  const overlaps: ScaleOverlap[] = [];

  for (const scale of existingScales) {
    if (scale.id === newScale.id) continue; // skip self when editing
    if (scale.status === 'cancelada') continue;
    if (scale.date !== newScale.date) continue;

    if (
      scale.locationId === newScale.locationId &&
      scale.specialtyId === newScale.specialtyId &&
      timeRangesOverlap(scale.startTime, scale.endTime, newScale.startTime, newScale.endTime)
    ) {
      overlaps.push({
        conflictingScale: scale,
        type: 'same_location_specialty',
        message: `Conflito: "${scale.title}" no mesmo local, especialidade e horário (${scale.startTime}-${scale.endTime})`,
      });
    }
  }

  return overlaps;
}

/**
 * Check if a doctor has schedule conflicts with existing assigned scales
 */
export function checkDoctorScheduleConflict(
  doctorScales: Scale[],
  newScale: { date: string; startTime: string; endTime: string; id?: string }
): ScaleOverlap[] {
  const overlaps: ScaleOverlap[] = [];

  for (const scale of doctorScales) {
    if (scale.id === newScale.id) continue;
    if (scale.status === 'cancelada') continue;
    if (scale.date !== newScale.date) continue;

    if (timeRangesOverlap(scale.startTime, scale.endTime, newScale.startTime, newScale.endTime)) {
      overlaps.push({
        conflictingScale: scale,
        type: 'doctor_schedule_conflict',
        message: `Você já tem "${scale.title}" neste horário (${scale.startTime}-${scale.endTime})`,
      });
    }
  }

  return overlaps;
}

/**
 * Calculate cancellation penalty based on deadline rules
 */
export function calculateCancellationPenalty(
  scale: Scale,
  now: Date = new Date()
): { withinDeadline: boolean; penaltyAmount: number; daysUntilScale: number } {
  const scaleDate = parseISO(scale.date);
  const daysUntilScale = differenceInDays(scaleDate, now);
  const withinDeadline = daysUntilScale >= scale.cancellationDeadlineDays;
  const penaltyAmount = withinDeadline ? 0 : scale.paymentValue * 0.5;

  return { withinDeadline, penaltyAmount, daysUntilScale };
}

/**
 * Check if transfer is allowed based on deadline
 */
export function canTransferScale(
  scale: Scale,
  now: Date = new Date()
): { allowed: boolean; daysUntilScale: number } {
  const scaleDate = parseISO(scale.date);
  const daysUntilScale = differenceInDays(scaleDate, now);
  return { allowed: daysUntilScale >= scale.transferDeadlineDays, daysUntilScale };
}

/**
 * Format distance in human-readable format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Generate Google Maps URL for navigation
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
