import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  isPermissionDenied: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Mock coordinates (São Paulo center)
const MOCK_COORDINATES = { lat: -23.5505, lng: -46.6333 };

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    isPermissionDenied: false,
  });

  const [useMock, setUseMock] = useState(false);
  const [mockOffset, setMockOffset] = useState({ lat: 0, lng: 0 });

  const getCurrentPosition = useCallback(() => {
    if (useMock) {
      setState((prev) => ({
        ...prev,
        coordinates: {
          lat: MOCK_COORDINATES.lat + mockOffset.lat,
          lng: MOCK_COORDINATES.lng + mockOffset.lng,
        },
        isLoading: false,
        error: null,
      }));
      return;
    }

    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não suportada neste navegador',
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isLoading: false,
          error: null,
          isPermissionDenied: false,
        }));
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tempo esgotado ao obter localização';
            break;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          isPermissionDenied: permissionDenied,
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      }
    );
  }, [useMock, mockOffset, state.isSupported, options]);

  // Calculate distance between two points in meters
  const calculateDistance = useCallback(
    (targetLat: number, targetLng: number): number | null => {
      if (!state.coordinates) return null;

      const R = 6371e3; // Earth's radius in meters
      const φ1 = (state.coordinates.lat * Math.PI) / 180;
      const φ2 = (targetLat * Math.PI) / 180;
      const Δφ = ((targetLat - state.coordinates.lat) * Math.PI) / 180;
      const Δλ = ((targetLng - state.coordinates.lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    },
    [state.coordinates]
  );

  // Check if within radius (in meters)
  const isWithinRadius = useCallback(
    (targetLat: number, targetLng: number, radiusMeters: number): boolean => {
      const distance = calculateDistance(targetLat, targetLng);
      return distance !== null && distance <= radiusMeters;
    },
    [calculateDistance]
  );

  // Enable mock mode with offset controls
  const enableMock = useCallback((offset?: { lat: number; lng: number }) => {
    setUseMock(true);
    if (offset) {
      setMockOffset(offset);
    }
    setState((prev) => ({
      ...prev,
      coordinates: {
        lat: MOCK_COORDINATES.lat + (offset?.lat ?? 0),
        lng: MOCK_COORDINATES.lng + (offset?.lng ?? 0),
      },
      error: null,
      isLoading: false,
    }));
  }, []);

  const disableMock = useCallback(() => {
    setUseMock(false);
    setMockOffset({ lat: 0, lng: 0 });
    setState((prev) => ({ ...prev, coordinates: null }));
  }, []);

  const updateMockOffset = useCallback((offset: { lat: number; lng: number }) => {
    setMockOffset(offset);
    if (useMock) {
      setState((prev) => ({
        ...prev,
        coordinates: {
          lat: MOCK_COORDINATES.lat + offset.lat,
          lng: MOCK_COORDINATES.lng + offset.lng,
        },
      }));
    }
  }, [useMock]);

  return {
    ...state,
    useMock,
    mockOffset,
    getCurrentPosition,
    calculateDistance,
    isWithinRadius,
    enableMock,
    disableMock,
    updateMockOffset,
    MOCK_COORDINATES,
  };
}

// Hook for periodic location verification
export function usePeriodicGeolocation(
  intervalMs: number = 5 * 60 * 1000, // 5 minutes default
  onVerification?: (success: boolean, coordinates: { lat: number; lng: number } | null) => void
) {
  const geolocation = useGeolocation();
  const [isActive, setIsActive] = useState(false);
  const [lastVerification, setLastVerification] = useState<Date | null>(null);
  const [verificationCount, setVerificationCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const verify = () => {
      geolocation.getCurrentPosition();
      setLastVerification(new Date());
      setVerificationCount((prev) => prev + 1);
    };

    // Initial verification
    verify();

    // Set up interval
    const interval = setInterval(verify, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, intervalMs]);

  // Notify on coordinate changes
  useEffect(() => {
    if (lastVerification && onVerification) {
      onVerification(!geolocation.error, geolocation.coordinates);
    }
  }, [geolocation.coordinates, geolocation.error, lastVerification, onVerification]);

  return {
    ...geolocation,
    isActive,
    startVerification: () => setIsActive(true),
    stopVerification: () => setIsActive(false),
    lastVerification,
    verificationCount,
  };
}
