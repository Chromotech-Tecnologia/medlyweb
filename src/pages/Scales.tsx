import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, Search, Filter, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight,
  Clock, MapPin, Users, DollarSign, MoreHorizontal, Eye, Pencil, Trash2,
  UserPlus, CheckCircle, XCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { initializeStorage, STORAGE_KEYS, getAll, create, update, softDelete } from '@/lib/mocks/storage';
import type { Scale, Location, Specialty, ScaleType } from '@/lib/mocks/types';
import { scaleSchema, type ScaleFormData } from '@/lib/validations';

const statusLabels: Record<string, string> = { rascunho: 'Rascunho', publicada: 'Publicada', em_andamento: 'Em Andamento', concluida: 'Concluída', cancelada: 'Cancelada' };
const statusColors: Record<string, string> = { rascunho: 'bg-muted text-muted-foreground', publicada: 'bg-success/15 text-success border-success/30', em_andamento: 'bg-info/15 text-info border-info/30', concluida: 'bg-primary/15 text-primary border-primary/30', cancelada: 'bg-destructive/15 text-destructive border-destructive/30' };
const shiftLabels: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite', plantao_12h: 'Plantão 12h', plantao_24h: 'Plantão 24h' };

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScale, setEditingScale] = useState<Scale | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<Scale | null>(null);
  const { toast } = useToast();

  const form = useForm<ScaleFormData>({
    resolver: zodResolver(scaleSchema),
    defaultValues: {
      locationId: '', scaleTypeId: '', specialtyId: '', title: '', description: '',
      date: '', startTime: '', endTime: '', shift: 'manha',
      cancellationDeadlineDays: 3, transferDeadlineDays: 2,
      paymentValue: 0, paymentDate: '', minPatients: 0, maxPatients: 0, mealBreakMinutes: 60,
    },
  });

  useEffect(() => { initializeStorage(); loadData(); }, []);

  const loadData = () => {
    setScales(getAll<Scale>(STORAGE_KEYS.SCALES));
    setLocations(getAll<Location>(STORAGE_KEYS.LOCATIONS));
    setSpecialties(getAll<Specialty>(STORAGE_KEYS.SPECIALTIES));
    setScaleTypes(getAll<ScaleType>(STORAGE_KEYS.SCALE_TYPES));
  };

  useEffect(() => {
    let result = scales;
    if (searchTerm) { const term = searchTerm.toLowerCase(); result = result.filter((s) => s.title.toLowerCase().includes(term)); }
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter);
    setFilteredScales(result);
  }, [searchTerm, statusFilter, scales]);

  const getLocationName = (id: string) => locations.find((l) => l.id === id)?.name || 'N/A';
  const getSpecialtyName = (id: string) => specialties.find((s) => s.id === id)?.name || 'N/A';
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const openDialog = (scale?: Scale) => {
    if (scale) {
      setEditingScale(scale);
      form.reset({
        locationId: scale.locationId, scaleTypeId: scale.scaleTypeId, specialtyId: scale.specialtyId,
        title: scale.title, description: scale.description || '', date: scale.date,
        startTime: scale.startTime, endTime: scale.endTime, shift: scale.shift,
        cancellationDeadlineDays: scale.cancellationDeadlineDays, transferDeadlineDays: scale.transferDeadlineDays,
        paymentValue: scale.paymentValue, paymentDate: scale.paymentDate || '',
        minPatients: scale.minPatients || 0, maxPatients: scale.maxPatients || 0,
        mealBreakMinutes: scale.mealBreakMinutes || 60,
      });
    } else {
      setEditingScale(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: ScaleFormData) => {
    const scaleData: Record<string, unknown> = {
      ...data,
      status: editingScale?.status || 'rascunho',
      paymentStatus: 'pendente',
    };

    if (editingScale) {
      update(STORAGE_KEYS.SCALES, editingScale.id, scaleData);
      toast({ title: 'Escala atualizada!', description: `${data.title} foi atualizada.` });
    } else {
      create(STORAGE_KEYS.SCALES, scaleData);
      toast({ title: 'Escala criada!', description: `${data.title} foi adicionada.` });
    }
    setDialogOpen(false);
    loadData();
  };

  const handlePublish = (scale: Scale) => {
    update(STORAGE_KEYS.SCALES, scale.id, { status: 'publicada' });
    loadData();
    toast({ title: 'Escala publicada!', description: 'A escala está disponível para candidaturas.' });
  };

  const handleDelete = (scale: Scale) => { setScaleToDelete(scale); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (scaleToDelete) { softDelete(STORAGE_KEYS.SCALES, scaleToDelete.id); loadData(); toast({ title: 'Escala excluída', description: `${scaleToDelete.title} foi removida.` }); }
    setDeleteDialogOpen(false); setScaleToDelete(null);
  };
  const viewDetails = (scale: Scale) => { setSelectedScale(scale); setDetailsOpen(true); };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const getScalesForDay = (date: Date) => filteredScales.filter((s) => isSameDay(parseISO(s.date), date));

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Escalas</h1>
            <p className="text-muted-foreground">Gerencie as escalas médicas</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />Nova Escala
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar escalas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Status" /></SelectTrigger>
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
                  <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />Lista</TabsTrigger>
                  <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Calendário</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* List View */}
        {viewMode === 'list' ? (
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">{filteredScales.length} escala{filteredScales.length !== 1 ? 's' : ''}</CardTitle></CardHeader>
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
                          <div><p className="font-medium">{scale.title}</p><p className="text-sm text-muted-foreground">{getSpecialtyName(scale.specialtyId)}</p></div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{getLocationName(scale.locationId)}</span></div></TableCell>
                        <TableCell>
                          <div><p className="font-medium">{format(parseISO(scale.date), 'dd/MM/yyyy')}</p><p className="text-sm text-muted-foreground">{scale.startTime} - {scale.endTime}</p></div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className={statusColors[scale.status]}>{statusLabels[scale.status]}</Badge></TableCell>
                        <TableCell className="font-medium">{formatCurrency(scale.paymentValue)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => viewDetails(scale)}><Eye className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog(scale)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                              {scale.status === 'rascunho' && <DropdownMenuItem onClick={() => handlePublish(scale)}><CheckCircle className="mr-2 h-4 w-4" />Publicar</DropdownMenuItem>}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(scale)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
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
          /* Calendar View */
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => <div key={day} className="p-2">{day}</div>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                {monthDays.map((day) => {
                  const dayScales = getScalesForDay(day);
                  return (
                    <motion.div key={day.toISOString()} whileHover={{ scale: 1.05 }} className={cn('aspect-square cursor-pointer rounded-lg border p-1 transition-colors', isToday(day) && 'border-primary bg-primary/5', dayScales.length > 0 && 'bg-success/5 border-success/30')}>
                      <div className={cn('text-sm font-medium', isToday(day) && 'text-primary')}>{format(day, 'd')}</div>
                      {dayScales.slice(0, 2).map((scale) => <div key={scale.id} onClick={() => viewDetails(scale)} className="mt-0.5 truncate rounded bg-primary/20 px-1 text-xs">{scale.startTime}</div>)}
                      {dayScales.length > 2 && <div className="text-xs text-muted-foreground">+{dayScales.length - 2}</div>}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingScale ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
              <DialogDescription>Preencha todas as informações da escala médica.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Ex: Plantão UPA - Clínica Geral" /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField control={form.control} name="locationId" render={({ field }) => (
                    <FormItem><FormLabel>Local</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="scaleTypeId" render={({ field }) => (
                    <FormItem><FormLabel>Tipo de Escala</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>{scaleTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="specialtyId" render={({ field }) => (
                    <FormItem><FormLabel>Especialidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>{specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição (opcional)</FormLabel><FormControl><Textarea {...field} placeholder="Descrição da escala..." rows={2} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Data</FormLabel><FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem><FormLabel>Início</FormLabel><FormControl><Input {...field} type="time" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem><FormLabel>Término</FormLabel><FormControl><Input {...field} type="time" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="shift" render={({ field }) => (
                    <FormItem><FormLabel>Turno</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="noite">Noite</SelectItem>
                          <SelectItem value="plantao_12h">Plantão 12h</SelectItem>
                          <SelectItem value="plantao_24h">Plantão 24h</SelectItem>
                        </SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="cancellationDeadlineDays" render={({ field }) => (
                    <FormItem><FormLabel>Prazo Desistência (dias)</FormLabel><FormControl><Input {...field} type="number" min={0} max={30} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transferDeadlineDays" render={({ field }) => (
                    <FormItem><FormLabel>Prazo Repasse (dias)</FormLabel><FormControl><Input {...field} type="number" min={0} max={30} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="paymentValue" render={({ field }) => (
                    <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input {...field} type="number" min={0} step={0.01} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="paymentDate" render={({ field }) => (
                    <FormItem><FormLabel>Data Pgto. (opcional)</FormLabel><FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField control={form.control} name="minPatients" render={({ field }) => (
                    <FormItem><FormLabel>Min. Pacientes</FormLabel><FormControl><Input {...field} type="number" min={0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="maxPatients" render={({ field }) => (
                    <FormItem><FormLabel>Max. Pacientes</FormLabel><FormControl><Input {...field} type="number" min={0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="mealBreakMinutes" render={({ field }) => (
                    <FormItem><FormLabel>Intervalo (min)</FormLabel><FormControl><Input {...field} type="number" min={0} max={180} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingScale ? 'Salvar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

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
                  <Badge variant="outline" className={statusColors[selectedScale.status]}>{statusLabels[selectedScale.status]}</Badge>
                  <Badge variant="secondary">{shiftLabels[selectedScale.shift]}</Badge>
                </div>
                <div className="grid gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" /><span>{format(parseISO(selectedScale.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span></div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{selectedScale.startTime} - {selectedScale.endTime}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{getLocationName(selectedScale.locationId)}</span></div>
                  <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{formatCurrency(selectedScale.paymentValue)}</span></div>
                  {selectedScale.minPatients != null && (
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{selectedScale.minPatients} - {selectedScale.maxPatients} pacientes</span></div>
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
              <DialogDescription>Tem certeza que deseja excluir <strong>{scaleToDelete?.title}</strong>?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
