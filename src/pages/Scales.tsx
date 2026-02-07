import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  initializeStorage,
  STORAGE_KEYS,
  getAll,
  getById,
  update,
  softDelete,
} from '@/lib/mocks/storage';
import type { Scale, Location, Specialty, ScaleType } from '@/lib/mocks/types';

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  publicada: 'Publicada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const statusColors: Record<string, string> = {
  rascunho: 'bg-muted text-muted-foreground',
  publicada: 'bg-success/15 text-success border-success/30',
  em_andamento: 'bg-info/15 text-info border-info/30',
  concluida: 'bg-primary/15 text-primary border-primary/30',
  cancelada: 'bg-destructive/15 text-destructive border-destructive/30',
};

const shiftLabels: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  plantao_12h: 'Plantão 12h',
  plantao_24h: 'Plantão 24h',
};

export default function Scales() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [scaleTypes, setScaleTypes] = useState<ScaleType[]>([]);
  const [filteredScales, setFilteredScales] = useState<Scale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<Scale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  const loadData = () => {
    setScales(getAll<Scale>(STORAGE_KEYS.SCALES));
    setLocations(getAll<Location>(STORAGE_KEYS.LOCATIONS));
    setSpecialties(getAll<Specialty>(STORAGE_KEYS.SPECIALTIES));
    setScaleTypes(getAll<ScaleType>(STORAGE_KEYS.SCALE_TYPES));
  };

  useEffect(() => {
    let result = scales;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(term));
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    setFilteredScales(result);
  }, [searchTerm, statusFilter, scales]);

  const getLocationName = (id: string) => locations.find((l) => l.id === id)?.name || 'N/A';
  const getSpecialtyName = (id: string) => specialties.find((s) => s.id === id)?.name || 'N/A';
  const getScaleTypeName = (id: string) => scaleTypes.find((t) => t.id === id)?.name || 'N/A';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handlePublish = (scale: Scale) => {
    update(STORAGE_KEYS.SCALES, scale.id, { status: 'publicada' });
    loadData();
    toast({ title: 'Escala publicada!', description: 'A escala está disponível para candidaturas.' });
  };

  const handleDelete = (scale: Scale) => {
    setScaleToDelete(scale);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scaleToDelete) {
      softDelete(STORAGE_KEYS.SCALES, scaleToDelete.id);
      loadData();
      toast({ title: 'Escala excluída', description: `${scaleToDelete.title} foi removida.` });
    }
    setDeleteDialogOpen(false);
    setScaleToDelete(null);
  };

  const viewDetails = (scale: Scale) => {
    setSelectedScale(scale);
    setDetailsOpen(true);
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getScalesForDay = (date: Date) =>
    filteredScales.filter((s) => isSameDay(parseISO(s.date), date));

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Escalas</h1>
            <p className="text-muted-foreground">Gerencie as escalas médicas</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova Escala
          </Button>
        </div>

        {/* Filters & View Toggle */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar escalas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="publicada">Publicada</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="mr-2 h-4 w-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Calendário
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'list' ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">
                {filteredScales.length} escala{filteredScales.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Escala</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data/Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScales.map((scale) => (
                      <TableRow key={scale.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-medium">{scale.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {getSpecialtyName(scale.specialtyId)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{getLocationName(scale.locationId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {format(parseISO(scale.date), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {scale.startTime} - {scale.endTime}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[scale.status]}>
                            {statusLabels[scale.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(scale.paymentValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewDetails(scale)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {scale.status === 'rascunho' && (
                                <DropdownMenuItem onClick={() => handlePublish(scale)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Publicar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Ver candidatos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(scale)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {monthDays.map((day) => {
                  const dayScales = getScalesForDay(day);
                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'aspect-square cursor-pointer rounded-lg border p-1 transition-colors',
                        isToday(day) && 'border-primary bg-primary/5',
                        dayScales.length > 0 && 'bg-success/5 border-success/30'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-medium',
                          isToday(day) && 'text-primary'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                      {dayScales.slice(0, 2).map((scale) => (
                        <div
                          key={scale.id}
                          onClick={() => viewDetails(scale)}
                          className="mt-0.5 truncate rounded bg-primary/20 px-1 text-xs"
                        >
                          {scale.startTime}
                        </div>
                      ))}
                      {dayScales.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayScales.length - 2}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedScale?.title}</DialogTitle>
              <DialogDescription>Detalhes da escala</DialogDescription>
            </DialogHeader>
            {selectedScale && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[selectedScale.status]}>
                    {statusLabels[selectedScale.status]}
                  </Badge>
                  <Badge variant="secondary">{shiftLabels[selectedScale.shift]}</Badge>
                </div>

                <div className="grid gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(selectedScale.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedScale.startTime} - {selectedScale.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{getLocationName(selectedScale.locationId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{getSpecialtyName(selectedScale.specialtyId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatCurrency(selectedScale.paymentValue)}</span>
                  </div>
                </div>

                {selectedScale.description && (
                  <div>
                    <h4 className="mb-1 font-medium">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{selectedScale.description}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedScale.candidateIds && selectedScale.candidateIds.length > 0 && (
                    <Badge variant="secondary">
                      {selectedScale.candidateIds.length} candidato(s)
                    </Badge>
                  )}
                  {selectedScale.assignedDoctorId && (
                    <Badge className="badge-success">Médico atribuído</Badge>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a escala <strong>{scaleToDelete?.title}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
