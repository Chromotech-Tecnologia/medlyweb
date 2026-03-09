import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar, Clock, MapPin, DollarSign, Star, TrendingUp, CreditCard,
  ChevronRight, Search, Filter, List, CalendarDays, ArrowLeft, Navigation,
  CheckCircle2, Bell, BellDot, CheckCheck, FileText, Send, User, Shield,
  Mail, Phone, Edit,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePeriodicGeolocation } from '@/hooks/useGeolocation';
import { CheckInOut } from '@/components/doctor/CheckInOut';
import { ScaleActions } from '@/components/doctor/ScaleActions';
import { getGoogleMapsUrl } from '@/lib/scaleUtils';
import { STORAGE_KEYS, getAll, update, getById } from '@/lib/mocks/storage';
import type { Scale, Location, CheckRecord } from '@/lib/mocks/types';
import type { CheckoutFormData } from '@/lib/validations';

// Types
type DoctorTab = 'inicio' | 'escalas' | 'alertas' | 'perfil';
type ScaleViewMode = 'list' | 'calendar';

interface DoctorScale {
  id: string;
  title: string;
  location: string;
  locationId: string;
  address: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  value: number;
  status: 'confirmado' | 'aguardando' | 'disponivel';
  specialty: string;
  workflowSteps?: { label: string; done: boolean }[];
  // Real scale data
  coordinates?: { lat: number; lng: number };
  checkIn?: CheckRecord;
  checkOut?: CheckRecord;
  cancellationDeadlineDays: number;
  transferDeadlineDays: number;
  paymentValue: number;
  realScaleId?: string;
}

interface DoctorNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: 'calendar' | 'payment' | 'document' | 'scale';
}

// Mock notifications
const mockNotifications: DoctorNotification[] = [
  { id: '1', title: 'Lembrete de Check-in', message: 'Seu plantão no Hospital São Lucas começa em 30 minutos. Não esqueça de fazer o check-in!', time: 'há cerca de 1 hora', read: false, icon: 'calendar' },
  { id: '2', title: 'Escala Confirmada', message: 'Sua candidatura para o Plantão PS na UPA Centro foi aceita!', time: 'há 1 dia', read: false, icon: 'scale' },
  { id: '3', title: 'Pagamento Pendente', message: 'O pagamento do plantão no Hospital Central está pendente há 3 dias.', time: 'há 1 dia', read: true, icon: 'payment' },
  { id: '4', title: 'Documento Expirando', message: 'Seu CRM vence em 30 dias. Atualize seus documentos.', time: 'há 7 dias', read: true, icon: 'document' },
  { id: '5', title: 'Nova Escala Disponível', message: 'Uma nova escala de Cardiologia foi publicada para a próxima semana.', time: 'há 7 dias', read: true, icon: 'scale' },
];

const statusColors: Record<string, string> = {
  confirmado: 'bg-primary/15 text-primary-foreground border-primary/30 text-emerald-700',
  aguardando: 'bg-warning/15 text-warning border-warning/30',
  disponivel: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  confirmado: 'Confirmado',
  aguardando: 'Aguardando',
  disponivel: 'Disponível',
};

// Build doctor scales from real storage data + fallback mock
function buildDoctorScales(): DoctorScale[] {
  const scales = getAll<Scale>(STORAGE_KEYS.SCALES);
  const locations = getAll<Location>(STORAGE_KEYS.LOCATIONS);

  const assignedScales: DoctorScale[] = scales
    .filter(s => s.assignedDoctorId === '4' && s.status !== 'cancelada')
    .map(s => {
      const loc = locations.find(l => l.id === s.locationId);
      return {
        id: s.id,
        realScaleId: s.id,
        title: s.title,
        location: loc?.name || 'N/A',
        locationId: s.locationId,
        address: loc ? `${loc.address.street}, ${loc.address.number}` : '',
        city: loc ? `${loc.address.city}, ${loc.address.state}` : '',
        date: new Date(s.date).toLocaleDateString('pt-BR'),
        startTime: s.startTime,
        endTime: s.endTime,
        duration: '12h',
        value: s.paymentValue,
        status: 'confirmado' as const,
        specialty: 'Especialidade',
        coordinates: loc?.coordinates,
        checkIn: s.checkIn,
        checkOut: s.checkOut,
        cancellationDeadlineDays: s.cancellationDeadlineDays,
        transferDeadlineDays: s.transferDeadlineDays,
        paymentValue: s.paymentValue,
        workflowSteps: [
          { label: 'Candidatura', done: true },
          { label: 'Aguardando Aceite', done: true },
          { label: 'Documentos', done: true },
          { label: 'Análise', done: true },
          { label: 'Aprovado', done: true },
          { label: 'NF Recebida', done: false },
        ],
      };
    });

  // Add mock data for demo
  const mockScales: DoctorScale[] = [
    {
      id: 'mock-1',
      title: 'Plantão UTI - Hospital São Lucas',
      location: 'Hospital São Lucas',
      locationId: '2',
      address: 'Rua das Flores, 123 - Centro',
      city: 'São Paulo, SP',
      date: '22/03/2026',
      startTime: '07:00',
      endTime: '19:00',
      duration: '12h',
      value: 1500,
      status: 'confirmado',
      specialty: 'Clínica Geral',
      coordinates: { lat: -23.5489, lng: -46.6558 },
      cancellationDeadlineDays: 3,
      transferDeadlineDays: 2,
      paymentValue: 1500,
      workflowSteps: [
        { label: 'Candidatura', done: true },
        { label: 'Aguardando Aceite', done: true },
        { label: 'Documentos', done: true },
        { label: 'Análise', done: true },
        { label: 'Aprovado', done: true },
        { label: 'NF Recebida', done: false },
      ],
    },
    {
      id: 'mock-2',
      title: 'Plantão PS - UPA Centro',
      location: 'UPA Centro',
      locationId: '1',
      address: 'Av. Central, 500',
      city: 'São Paulo, SP',
      date: '23/03/2026',
      startTime: '19:00',
      endTime: '07:00',
      duration: '12h',
      value: 1800,
      status: 'aguardando',
      specialty: 'Clínica Geral',
      coordinates: { lat: -23.5005, lng: -46.6275 },
      cancellationDeadlineDays: 3,
      transferDeadlineDays: 2,
      paymentValue: 1800,
      workflowSteps: [
        { label: 'Candidatura', done: true },
        { label: 'Aguardando Aceite', done: false },
      ],
    },
    {
      id: 'mock-3',
      title: 'Atendimento Ambulatorial',
      location: 'Clínica Saúde & Vida',
      locationId: '3',
      address: 'Rua da Saúde, 200',
      city: 'São Paulo, SP',
      date: '01/04/2026',
      startTime: '08:00',
      endTime: '14:00',
      duration: '6h',
      value: 900,
      status: 'disponivel',
      specialty: 'Cardiologia',
      coordinates: { lat: -23.5883, lng: -46.6358 },
      cancellationDeadlineDays: 2,
      transferDeadlineDays: 1,
      paymentValue: 900,
    },
  ];

  // Merge: real assigned scales first, then mock ones that don't conflict
  const realIds = new Set(assignedScales.map(s => s.id));
  return [...assignedScales, ...mockScales.filter(m => !realIds.has(m.id))];
}

// Sub-components
function DoctorHome({ onViewScale, onNavigate }: { onViewScale: (s: DoctorScale) => void; onNavigate: (tab: DoctorTab) => void }) {
  const { user } = useAuth();
  const doctorScales = buildDoctorScales();
  const nextScale = doctorScales.find(s => s.status === 'confirmado');
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-2xl font-bold text-foreground">Dr. {user?.name?.split(' ')[0] || 'Médico'}</h1>
      </div>

      {nextScale && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-medical p-5 cursor-pointer"
          onClick={() => onViewScale(nextScale)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
                <Clock className="h-3.5 w-3.5" />
                Próximo plantão
              </div>
              <p className="text-lg font-semibold text-primary-foreground">{nextScale.title}</p>
              <div className="flex items-center gap-1 text-sm text-primary-foreground/80">
                <MapPin className="h-3.5 w-3.5" />
                {nextScale.location}
              </div>
              <p className="text-sm font-medium text-destructive mt-2">
                {nextScale.startTime} - {nextScale.endTime}
              </p>
            </div>
            <Button size="sm" variant="outline" className="bg-background/90 hover:bg-background border-0 text-foreground font-medium">
              {nextScale.checkIn ? 'Ver Plantão' : 'Fazer Check-in'}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Calendar, value: String(doctorScales.filter(s => s.status === 'confirmado').length), label: 'Escalas Ativas', color: 'text-primary' },
          { icon: CreditCard, value: '2', label: 'Pagamentos pendentes', color: 'text-warning' },
          { icon: Star, value: '4.8', label: 'Sua Nota', color: 'text-primary' },
          { icon: TrendingUp, value: '48', label: 'Total Plantões', color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card hover:shadow-soft transition-shadow">
              <CardContent className="p-4">
                <stat.icon className={cn('h-6 w-6 mb-2', stat.color)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-primary mb-3">Ações Rápidas</h3>
        <div className="space-y-2">
          <Card className="glass-card cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onNavigate('escalas')}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Ver Escalas Disponíveis</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="glass-card cursor-pointer hover:shadow-soft transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Gerenciar Pagamentos</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Alertas Recentes</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => onNavigate('alertas')}>Ver todos</button>
        </div>
        <div className="space-y-2">
          {mockNotifications.filter(n => !n.read).slice(0, 2).map(n => (
            <Card key={n.id} className="glass-card">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScalesList({ onViewScale }: { onViewScale: (s: DoctorScale) => void }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ScaleViewMode>('list');
  const doctorScales = buildDoctorScales();

  const filtered = doctorScales.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escalas</h1>
          <p className="text-sm text-primary">{filtered.length} escalas encontradas</p>
        </div>
        <Button variant="ghost" size="icon"><Filter className="h-5 w-5" /></Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar escalas..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="rounded-none" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'calendar' ? 'default' : 'ghost'} size="icon" className="rounded-none" onClick={() => setViewMode('calendar')}>
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((scale, i) => (
          <motion.div key={scale.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onViewScale(scale)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <Badge className={cn('text-xs', statusColors[scale.status])}>{statusLabels[scale.status]}</Badge>
                    <Badge variant="outline" className="text-xs">{scale.specialty}</Badge>
                    {scale.checkIn && !scale.checkOut && (
                      <Badge className="text-xs bg-primary/15 text-primary border-primary/30">Em plantão</Badge>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-2">{scale.title}</p>
                <div className="grid grid-cols-2 gap-y-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />{scale.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{scale.startTime} - {scale.endTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />{scale.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <DollarSign className="h-3.5 w-3.5" />R$ {scale.value.toLocaleString('pt-BR')}
                  </div>
                </div>
                {scale.status === 'disponivel' && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" className="flex-1" size="sm">Não tenho interesse</Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90" size="sm">Candidatar-se</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScaleDetail({ scale, onBack, onScaleUpdate }: { scale: DoctorScale; onBack: () => void; onScaleUpdate: () => void }) {
  const { toast } = useToast();
  const [currentScale, setCurrentScale] = useState(scale);
  
  // Periodic geolocation for after check-in
  const periodicGeo = usePeriodicGeolocation(5 * 60 * 1000); // 5 min

  const locationCoords = currentScale.coordinates || { lat: -23.5505, lng: -46.6333 };

  // Start periodic verification after check-in
  useEffect(() => {
    if (currentScale.checkIn && !currentScale.checkOut) {
      periodicGeo.enableMock(); // Use mock for demo
      periodicGeo.startVerification();
    }
    return () => periodicGeo.stopVerification();
  }, [currentScale.checkIn, currentScale.checkOut]);

  const isWithinRadiusNow = periodicGeo.coordinates
    ? periodicGeo.isWithinRadius(locationCoords.lat, locationCoords.lng, 100)
    : undefined;

  const handleCheckIn = (coordinates: { lat: number; lng: number }) => {
    const checkInRecord: CheckRecord = {
      timestamp: new Date().toISOString(),
      coordinates,
      verified: true,
    };

    // Update real scale if it exists
    if (currentScale.realScaleId) {
      update(STORAGE_KEYS.SCALES, currentScale.realScaleId, { checkIn: checkInRecord, status: 'em_andamento' });
    }

    setCurrentScale(prev => ({ ...prev, checkIn: checkInRecord }));
    toast({ title: 'Check-in realizado!', description: `Check-in em ${currentScale.location} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` });
  };

  const handleCheckOut = (data: CheckoutFormData, coordinates: { lat: number; lng: number }) => {
    const checkOutRecord: CheckRecord = {
      timestamp: new Date().toISOString(),
      coordinates,
      verified: true,
    };

    if (currentScale.realScaleId) {
      update(STORAGE_KEYS.SCALES, currentScale.realScaleId, { checkOut: checkOutRecord, status: 'concluida' });
    }

    periodicGeo.stopVerification();
    setCurrentScale(prev => ({ ...prev, checkOut: checkOutRecord }));
    toast({ title: 'Check-out realizado!', description: `Plantão concluído. ${data.patientsAttended} pacientes atendidos. Nota: ${data.overallScore}/5` });
  };

  const handleCancel = (scaleId: string, penaltyAmount: number) => {
    if (currentScale.realScaleId) {
      update(STORAGE_KEYS.SCALES, currentScale.realScaleId, { status: 'cancelada', assignedDoctorId: null });
    }
    toast({
      title: 'Desistência confirmada',
      description: penaltyAmount > 0
        ? `Multa de R$ ${penaltyAmount.toLocaleString('pt-BR')} será aplicada.`
        : 'Sem penalidade — dentro do prazo.',
      variant: penaltyAmount > 0 ? 'destructive' : 'default',
    });
    onBack();
    onScaleUpdate();
  };

  const handleTransfer = (scaleId: string) => {
    if (currentScale.realScaleId) {
      update(STORAGE_KEYS.SCALES, currentScale.realScaleId, { status: 'publicada', assignedDoctorId: null });
    }
    toast({ title: 'Plantão repassado', description: 'A escala voltou a ficar disponível para outros médicos.' });
    onBack();
    onScaleUpdate();
  };

  // Build a minimal Scale object for ScaleActions
  const scaleForActions: Scale = {
    id: currentScale.realScaleId || currentScale.id,
    title: currentScale.title,
    date: (() => {
      // Parse dd/MM/yyyy to ISO
      const parts = currentScale.date.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return currentScale.date;
    })(),
    startTime: currentScale.startTime,
    endTime: currentScale.endTime,
    cancellationDeadlineDays: currentScale.cancellationDeadlineDays,
    transferDeadlineDays: currentScale.transferDeadlineDays,
    paymentValue: currentScale.paymentValue,
    locationId: currentScale.locationId,
    scaleTypeId: '',
    specialtyId: '',
    shift: 'plantao_12h',
    status: 'em_andamento',
    paymentStatus: 'pendente',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-bold">{currentScale.title}</h1>
      </div>

      <div className="flex gap-2">
        <Badge className={cn('text-xs', statusColors[currentScale.status])}>{statusLabels[currentScale.status]}</Badge>
        <Badge variant="outline" className="text-xs">{currentScale.specialty}</Badge>
      </div>

      {/* Location Card */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">{currentScale.location}</p>
                <p className="text-sm text-muted-foreground">{currentScale.address}</p>
                <p className="text-sm text-muted-foreground">{currentScale.city}</p>
              </div>
            </div>
            <a
              href={getGoogleMapsUrl(locationCoords.lat, locationCoords.lng)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Navigation className="h-3.5 w-3.5" />
                Mapa
              </Button>
            </a>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />{currentScale.date}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />{currentScale.startTime} - {currentScale.endTime} ({currentScale.duration})
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-sm text-primary">Valor do plantão</span>
            <span className="text-lg font-bold text-destructive">R$ {currentScale.value.toLocaleString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      {currentScale.workflowSteps && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Status da Escala</h3>
            <div className="space-y-0">
              {currentScale.workflowSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                      step.done ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'
                    )}>
                      {step.done ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    {i < currentScale.workflowSteps!.length - 1 && (
                      <div className={cn('w-0.5 h-6', step.done ? 'bg-primary' : 'bg-border')} />
                    )}
                  </div>
                  <p className={cn('text-sm pt-1.5', step.done ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in/out */}
      {currentScale.status === 'confirmado' && (
        <CheckInOut
          scaleId={currentScale.id}
          locationName={currentScale.location}
          locationCoordinates={locationCoords}
          checkIn={currentScale.checkIn}
          checkOut={currentScale.checkOut}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isVerifying={periodicGeo.isActive}
          lastVerification={periodicGeo.lastVerification}
          isWithinRadiusNow={isWithinRadiusNow}
        />
      )}

      {/* Scale Actions (cancel/transfer) - only for confirmed, not yet checked in */}
      {currentScale.status === 'confirmado' && !currentScale.checkIn && (
        <ScaleActions
          scale={scaleForActions}
          onCancel={handleCancel}
          onTransfer={handleTransfer}
        />
      )}

      {currentScale.status === 'disponivel' && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" size="lg">Não tenho interesse</Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" size="lg">Candidatar-se</Button>
        </div>
      )}
    </div>
  );
}

function NotificationsList() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

  const getIcon = (type: string) => {
    switch (type) {
      case 'calendar': return Calendar;
      case 'payment': return CreditCard;
      case 'document': return FileText;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && <p className="text-sm text-primary">{unreadCount} não lidas</p>}
        </div>
        {unreadCount > 0 && (
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />Marcar todas
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const Icon = getIcon(n.icon);
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={cn('glass-card', !n.read && 'border-primary/20 bg-primary/5')}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DoctorProfile() {
  const { user } = useAuth();
  const initials = (user?.name || 'DR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <Button variant="ghost" size="icon"><Edit className="h-5 w-5" /></Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="h-24 bg-gradient-medical" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col items-center -mt-12">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-3">Dr. {user?.name || 'Carlos Silva'}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />123456-SP</Badge>
              <Badge className="badge-success gap-1"><CheckCircle2 className="h-3 w-3" />Ativo</Badge>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={cn('h-4 w-4', s <= 4 ? 'fill-warning text-warning' : 'text-muted')} />
              ))}
              <span className="text-sm font-medium ml-1">4.8</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            {[
              { value: '48', label: 'Plantões' },
              { value: '3', label: 'Ativos' },
              { value: '2', label: 'Especialidades' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">Especialidades</h3>
        <div className="flex gap-2">
          <Badge variant="outline">Clínica Geral</Badge>
          <Badge variant="outline">Cardiologia</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-primary mb-3">Informações de Contato</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user?.email || 'medico@medly.com'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user?.phone || '(11) 99999-0004'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">São Paulo, SP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function DoctorArea() {
  const [activeTab, setActiveTab] = useState<DoctorTab>('inicio');
  const [selectedScale, setSelectedScale] = useState<DoctorScale | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewScale = (scale: DoctorScale) => {
    setSelectedScale(scale);
    setActiveTab('escalas');
  };

  const handleScaleUpdate = () => {
    setRefreshKey(k => k + 1);
    setSelectedScale(null);
  };

  const renderContent = () => {
    if (activeTab === 'escalas' && selectedScale) {
      return <ScaleDetail scale={selectedScale} onBack={() => setSelectedScale(null)} onScaleUpdate={handleScaleUpdate} />;
    }
    switch (activeTab) {
      case 'inicio': return <DoctorHome key={refreshKey} onViewScale={handleViewScale} onNavigate={setActiveTab} />;
      case 'escalas': return <ScalesList key={refreshKey} onViewScale={setSelectedScale} />;
      case 'alertas': return <NotificationsList />;
      case 'perfil': return <DoctorProfile />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedScale?.id || '') + refreshKey}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around py-2">
          {([
            { key: 'inicio' as DoctorTab, icon: Calendar, label: 'Início' },
            { key: 'escalas' as DoctorTab, icon: CalendarDays, label: 'Escalas' },
            { key: 'alertas' as DoctorTab, icon: Bell, label: 'Alertas', badge: 2 },
            { key: 'perfil' as DoctorTab, icon: User, label: 'Perfil' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedScale(null); }}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 relative',
                activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <tab.icon className="h-5 w-5" />
                {tab.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.key && <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
