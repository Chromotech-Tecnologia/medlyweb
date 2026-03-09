import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, CheckCircle2, Clock, AlertTriangle,
  Loader2, Star, MessageSquare, Users, LogOut, ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance, getGoogleMapsUrl } from '@/lib/scaleUtils';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations';
import type { CheckRecord } from '@/lib/mocks/types';

interface CheckInOutProps {
  scaleId: string;
  locationName: string;
  locationCoordinates: { lat: number; lng: number };
  radiusMeters?: number;
  checkIn?: CheckRecord;
  checkOut?: CheckRecord;
  onCheckIn: (coordinates: { lat: number; lng: number }) => void;
  onCheckOut: (data: CheckoutFormData, coordinates: { lat: number; lng: number }) => void;
  // Periodic verification
  isVerifying?: boolean;
  lastVerification?: Date | null;
  isWithinRadiusNow?: boolean;
}

export function CheckInOut({
  locationName,
  locationCoordinates,
  radiusMeters = 100,
  checkIn,
  checkOut,
  onCheckIn,
  onCheckOut,
  isVerifying,
  lastVerification,
  isWithinRadiusNow,
}: CheckInOutProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const geo = useGeolocation();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { patientsAttended: 0, overallScore: 5, observations: '' },
  });

  const distance = geo.coordinates
    ? geo.calculateDistance(locationCoordinates.lat, locationCoordinates.lng)
    : null;

  const withinRadius = distance !== null && distance <= radiusMeters;

  const handleGetLocation = () => {
    geo.getCurrentPosition();
  };

  const handleCheckIn = () => {
    if (geo.coordinates && withinRadius) {
      onCheckIn(geo.coordinates);
    }
  };

  const handleCheckOut = (data: CheckoutFormData) => {
    if (geo.coordinates && withinRadius) {
      onCheckOut(data, geo.coordinates);
      setShowCheckoutForm(false);
    }
  };

  // Already checked out
  if (checkOut) {
    return (
      <Card className="glass-card border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Plantão Concluído</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Check-in: {new Date(checkIn!.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div>Check-out: {new Date(checkOut.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already checked in - show checkout option
  if (checkIn) {
    return (
      <Card className="glass-card border-primary/30">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Check-in Realizado</h3>
                <p className="text-xs text-muted-foreground">
                  às {new Date(checkIn.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">Em plantão</Badge>
          </div>

          {/* Periodic Verification Status */}
          {isVerifying && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <div className={cn(
                'h-2 w-2 rounded-full animate-pulse',
                isWithinRadiusNow ? 'bg-primary' : 'bg-destructive'
              )} />
              <span className="text-xs text-muted-foreground">
                Verificação periódica ativa
                {lastVerification && ` • Última: ${lastVerification.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
              {!isWithinRadiusNow && (
                <Badge variant="destructive" className="text-xs ml-auto">Fora do raio</Badge>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showCheckoutForm ? (
              <motion.div key="checkout-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  className="w-full gap-2"
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    handleGetLocation();
                    setShowCheckoutForm(true);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Fazer Check-out
                </Button>
              </motion.div>
            ) : (
              <motion.div key="checkout-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Location status for checkout */}
                {geo.isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Obtendo localização...
                  </div>
                )}
                {geo.coordinates && !withinRadius && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Você está a {formatDistance(distance!)} do local. Aproxime-se para fazer check-out.
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCheckOut)} className="space-y-3">
                    <FormField control={form.control} name="patientsAttended" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Pacientes atendidos</FormLabel>
                        <FormControl><Input {...field} type="number" min={0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="overallScore" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />Avaliação do local</FormLabel>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => field.onChange(score)}
                              className="focus:outline-none"
                            >
                              <Star className={cn(
                                'h-7 w-7 transition-colors',
                                score <= field.value ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                              )} />
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="observations" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Observações (opcional)</FormLabel>
                        <FormControl><Textarea {...field} rows={2} placeholder="Como foi o plantão?" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCheckoutForm(false)}>Cancelar</Button>
                      <Button type="submit" variant="destructive" className="flex-1" disabled={!withinRadius && !geo.isLoading}>
                        Confirmar Check-out
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  // No check-in yet
  return (
    <Card className="glass-card">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-semibold">Check-in</h3>

        {/* Location Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{locationName}</span>
          </div>
          <a
            href={getGoogleMapsUrl(locationCoordinates.lat, locationCoordinates.lng)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Mapa
            </Button>
          </a>
        </div>

        {/* Distance Indicator */}
        {geo.coordinates && distance !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex items-center gap-2 rounded-lg p-3 text-sm',
              withinRadius
                ? 'bg-primary/10 text-primary'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <Navigation className="h-4 w-4" />
            <span>
              Distância: <strong>{formatDistance(distance)}</strong>
              {withinRadius
                ? ' — Dentro do raio permitido'
                : ` — Fora do raio (${radiusMeters}m)`
              }
            </span>
          </motion.div>
        )}

        {geo.error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {geo.error}
          </div>
        )}

        {/* Action Buttons */}
        {!geo.coordinates ? (
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleGetLocation}
            disabled={geo.isLoading}
          >
            {geo.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Obter Localização
          </Button>
        ) : (
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleCheckIn}
            disabled={!withinRadius}
          >
            <CheckCircle2 className="h-4 w-4" />
            {withinRadius ? 'Fazer Check-in' : 'Aproxime-se do local'}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Raio permitido: {radiusMeters}m do local
        </p>
      </CardContent>
    </Card>
  );
}
