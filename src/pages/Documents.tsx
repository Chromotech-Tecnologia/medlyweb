import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Search, MoreHorizontal, Pencil, Trash2, Eye,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { initializeStorage, STORAGE_KEYS, getAll, create, update, softDelete } from '@/lib/mocks/storage';
import type { Document, UserProfile } from '@/lib/mocks/types';
import { documentSchema, type DocumentFormData } from '@/lib/validations';

const statusLabels: Record<string, string> = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };
const statusColors: Record<string, string> = { pendente: 'bg-warning/15 text-warning border-warning/30', aprovado: 'bg-success/15 text-success border-success/30', rejeitado: 'bg-destructive/15 text-destructive border-destructive/30' };
const statusIcons: Record<string, React.ElementType> = { pendente: Clock, aprovado: CheckCircle, rejeitado: XCircle };
const categoryLabels: Record<string, string> = { identidade: 'Identidade', crm: 'CRM', diploma: 'Diploma', comprovante: 'Comprovante', contrato: 'Contrato', outro: 'Outro' };

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const { toast } = useToast();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', category: 'outro', userId: '', expirationDate: '', reviewNotes: '' },
  });

  useEffect(() => { initializeStorage(); loadData(); }, []);

  const loadData = () => {
    setDocuments(getAll<Document>(STORAGE_KEYS.DOCUMENTS));
    setUsers(getAll<UserProfile>(STORAGE_KEYS.USERS));
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredDocs(documents.filter((d) => d.name.toLowerCase().includes(term)));
    } else {
      setFilteredDocs(documents);
    }
  }, [searchTerm, documents]);

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'N/A';

  const openDialog = (doc?: Document) => {
    if (doc) {
      setEditingDoc(doc);
      form.reset({ name: doc.name, category: doc.category, userId: doc.userId, expirationDate: doc.expirationDate || '', reviewNotes: doc.reviewNotes || '' });
    } else {
      setEditingDoc(null);
      form.reset({ name: '', category: 'outro', userId: '', expirationDate: '', reviewNotes: '' });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: DocumentFormData) => {
    const docData: Record<string, unknown> = {
      name: data.name,
      category: data.category,
      userId: data.userId,
      fileUrl: '#mock-file',
      status: 'pendente',
      expirationDate: data.expirationDate || undefined,
      reviewNotes: data.reviewNotes || undefined,
    };

    if (editingDoc) {
      update(STORAGE_KEYS.DOCUMENTS, editingDoc.id, docData);
      toast({ title: 'Documento atualizado!', description: `${data.name} foi atualizado.` });
    } else {
      create(STORAGE_KEYS.DOCUMENTS, docData);
      toast({ title: 'Documento enviado!', description: `${data.name} foi adicionado.` });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleStatusChange = (doc: Document, status: 'aprovado' | 'rejeitado') => {
    update(STORAGE_KEYS.DOCUMENTS, doc.id, { status, reviewedAt: new Date().toISOString() });
    loadData();
    toast({ title: `Documento ${status}`, description: `${doc.name} foi ${status}.` });
  };

  const handleDelete = (doc: Document) => { setDocToDelete(doc); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (docToDelete) { softDelete(STORAGE_KEYS.DOCUMENTS, docToDelete.id); loadData(); toast({ title: 'Documento excluído', description: `${docToDelete.name} foi removido.` }); }
    setDeleteDialogOpen(false); setDocToDelete(null);
  };

  const pendingCount = documents.filter((d) => d.status === 'pendente').length;
  const approvedCount = documents.filter((d) => d.status === 'aprovado').length;
  const expiringSoon = documents.filter((d) => d.expirationDate && new Date(d.expirationDate) <= new Date(Date.now() + 30 * 86400000)).length;

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground">Gerencie documentos e validações</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />Enviar Documento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10"><Clock className="h-6 w-6 text-warning" /></div>
              <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-sm text-muted-foreground">Pendentes</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10"><CheckCircle className="h-6 w-6 text-success" /></div>
              <div><p className="text-2xl font-bold">{approvedCount}</p><p className="text-sm text-muted-foreground">Aprovados</p></div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10"><AlertCircle className="h-6 w-6 text-destructive" /></div>
              <div><p className="text-2xl font-bold">{expiringSoon}</p><p className="text-sm text-muted-foreground">A vencer</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar documentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Documentos ({filteredDocs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum documento encontrado. Envie o primeiro!</TableCell></TableRow>
                ) : filteredDocs.map((doc) => {
                  const StatusIcon = statusIcons[doc.status];
                  return (
                    <TableRow key={doc.id} className="group">
                      <TableCell><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{doc.name}</span></div></TableCell>
                      <TableCell className="text-sm">{getUserName(doc.userId)}</TableCell>
                      <TableCell><Badge variant="secondary">{categoryLabels[doc.category]}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={statusColors[doc.status]}><StatusIcon className="mr-1 h-3 w-3" />{statusLabels[doc.status]}</Badge></TableCell>
                      <TableCell>{doc.expirationDate || '—'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDialog(doc)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            {doc.status === 'pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(doc, 'aprovado')}><CheckCircle className="mr-2 h-4 w-4" />Aprovar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(doc, 'rejeitado')}><XCircle className="mr-2 h-4 w-4" />Rejeitar</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDoc ? 'Editar Documento' : 'Enviar Documento'}</DialogTitle>
              <DialogDescription>Preencha as informações do documento.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Ex: CRM - Dr. João" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="userId" render={({ field }) => (
                  <FormItem><FormLabel>Usuário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                      <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="identidade">Identidade</SelectItem>
                        <SelectItem value="crm">CRM</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="comprovante">Comprovante</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expirationDate" render={({ field }) => (
                  <FormItem><FormLabel>Data de Validade (opcional)</FormLabel><FormControl><Input {...field} type="date" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="reviewNotes" render={({ field }) => (
                  <FormItem><FormLabel>Observações (opcional)</FormLabel><FormControl><Textarea {...field} placeholder="Notas sobre o documento..." rows={2} /></FormControl><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingDoc ? 'Salvar' : 'Enviar'}</Button>
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
              <DialogDescription>Tem certeza que deseja excluir <strong>{docToDelete?.name}</strong>?</DialogDescription>
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
