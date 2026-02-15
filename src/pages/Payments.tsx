import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DollarSign, Clock, CheckCircle, AlertCircle, Download, Calendar,
  Plus, Search, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { initializeStorage, STORAGE_KEYS, getAll, create, update, softDelete } from '@/lib/mocks/storage';
import type { Payment, Scale, UserProfile } from '@/lib/mocks/types';
import { paymentSchema, type PaymentFormData } from '@/lib/validations';

const statusLabels: Record<string, string> = { pendente: 'Pendente', pago: 'Pago', atrasado: 'Atrasado' };
const statusColors: Record<string, string> = { pendente: 'bg-warning/15 text-warning border-warning/30', pago: 'bg-success/15 text-success border-success/30', atrasado: 'bg-destructive/15 text-destructive border-destructive/30' };
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { scaleId: '', doctorId: '', amount: 0, dueDate: '', notes: '' },
  });

  useEffect(() => { initializeStorage(); loadData(); }, []);

  const loadData = () => {
    setPayments(getAll<Payment>(STORAGE_KEYS.PAYMENTS));
    setScales(getAll<Scale>(STORAGE_KEYS.SCALES));
    setDoctors(getAll<UserProfile>(STORAGE_KEYS.USERS).filter((u) => u.role === 'medico'));
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredPayments(payments.filter((p) => {
        const scale = scales.find((s) => s.id === p.scaleId);
        const doctor = doctors.find((d) => d.id === p.doctorId);
        return scale?.title.toLowerCase().includes(term) || doctor?.name.toLowerCase().includes(term);
      }));
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments, scales, doctors]);

  const getScaleTitle = (id: string) => scales.find((s) => s.id === id)?.title || 'N/A';
  const getDoctorName = (id: string) => doctors.find((d) => d.id === id)?.name || 'N/A';

  const openDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      form.reset({ scaleId: payment.scaleId, doctorId: payment.doctorId, amount: payment.amount, dueDate: payment.dueDate, notes: payment.notes || '' });
    } else {
      setEditingPayment(null);
      form.reset({ scaleId: '', doctorId: '', amount: 0, dueDate: '', notes: '' });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: PaymentFormData) => {
    const paymentData: Record<string, unknown> = {
      scaleId: data.scaleId,
      doctorId: data.doctorId,
      amount: data.amount,
      dueDate: data.dueDate,
      status: 'pendente',
      notes: data.notes || undefined,
    };

    if (editingPayment) {
      update(STORAGE_KEYS.PAYMENTS, editingPayment.id, paymentData);
      toast({ title: 'Pagamento atualizado!', description: 'O pagamento foi atualizado.' });
    } else {
      create(STORAGE_KEYS.PAYMENTS, paymentData);
      toast({ title: 'Pagamento criado!', description: 'O pagamento foi registrado.' });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleMarkPaid = (payment: Payment) => {
    update(STORAGE_KEYS.PAYMENTS, payment.id, { status: 'pago', paidDate: new Date().toISOString().split('T')[0] });
    loadData();
    toast({ title: 'Pagamento confirmado!', description: 'O pagamento foi marcado como pago.' });
  };

  const handleDelete = (payment: Payment) => { setPaymentToDelete(payment); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (paymentToDelete) { softDelete(STORAGE_KEYS.PAYMENTS, paymentToDelete.id); loadData(); toast({ title: 'Pagamento excluído' }); }
    setDeleteDialogOpen(false); setPaymentToDelete(null);
  };

  const totalPending = payments.filter((p) => p.status === 'pendente' || p.status === 'atrasado').reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = payments.filter((p) => p.status === 'pago').reduce((acc, p) => acc + p.amount, 0);

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
            <p className="text-muted-foreground">Acompanhe e gerencie pagamentos</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />Novo Pagamento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><CheckCircle className="h-6 w-6 text-success" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p><p className="text-sm text-muted-foreground">Total Recebido</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10"><Clock className="h-6 w-6 text-warning" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalPending)}</p><p className="text-sm text-muted-foreground">A Receber</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-6 w-6 text-primary" /></div>
              <div><p className="text-2xl font-bold">{payments.length}</p><p className="text-sm text-muted-foreground">Total de Pagamentos</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar pagamentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Pagamentos ({filteredPayments.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escala</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum pagamento encontrado.</TableCell></TableRow>
                ) : filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="group">
                    <TableCell><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{getScaleTitle(payment.scaleId)}</span></div></TableCell>
                    <TableCell className="text-sm">{getDoctorName(payment.doctorId)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[payment.status]}>{statusLabels[payment.status]}</Badge></TableCell>
                    <TableCell>{payment.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(payment)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          {payment.status !== 'pago' && <DropdownMenuItem onClick={() => handleMarkPaid(payment)}><CheckCircle className="mr-2 h-4 w-4" />Marcar como Pago</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(payment)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {payments.some((p) => p.status === 'atrasado') && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div><p className="font-medium text-destructive">Pagamentos em atraso</p><p className="text-sm text-muted-foreground">Existem pagamentos que passaram da data de vencimento.</p></div>
            </CardContent>
          </Card>
        )}

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}</DialogTitle>
              <DialogDescription>Registre um pagamento de escala.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="scaleId" render={({ field }) => (
                  <FormItem><FormLabel>Escala</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{scales.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="doctorId" render={({ field }) => (
                  <FormItem><FormLabel>Médico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input {...field} type="number" min={0} step={0.01} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem><FormLabel>Data de Vencimento</FormLabel><FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem><FormLabel>Observações (opcional)</FormLabel><FormControl><Textarea {...field} placeholder="Notas..." rows={2} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingPayment ? 'Salvar' : 'Criar'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir este pagamento?</DialogDescription>
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
