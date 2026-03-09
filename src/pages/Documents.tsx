import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, File, X, Download, Users, Filter,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { initializeStorage, STORAGE_KEYS, getAll, create, update, softDelete } from '@/lib/mocks/storage';
import type { Document, UserProfile } from '@/lib/mocks/types';
import { documentSchema, type DocumentFormData } from '@/lib/validations';

const statusLabels: Record<string, string> = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };
const statusColors: Record<string, string> = { pendente: 'bg-warning/15 text-warning border-warning/30', aprovado: 'bg-success/15 text-success border-success/30', rejeitado: 'bg-destructive/15 text-destructive border-destructive/30' };
const statusIcons: Record<string, React.ElementType> = { pendente: Clock, aprovado: CheckCircle, rejeitado: XCircle };
const categoryLabels: Record<string, string> = { identidade: 'Identidade', crm: 'CRM', diploma: 'Diploma', comprovante: 'Comprovante', contrato: 'Contrato', outro: 'Outro' };

export default function Documents() {
  const { user: currentUser } = useAuth();
  const userRole = currentUser?.role;
  const isAdmin = userRole === 'admin' || userRole === 'developer';
  const isEscalista = userRole === 'escalista';
  const isDoctor = userRole === 'medico';
  const canEdit = isAdmin;
  const canApprove = isAdmin;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', category: 'outro', userId: '', expirationDate: '', reviewNotes: '' },
  });

  useEffect(() => { initializeStorage(); loadData(); }, []);

  const loadData = () => {
    let docs = getAll<Document>(STORAGE_KEYS.DOCUMENTS);
    const allUsers = getAll<UserProfile>(STORAGE_KEYS.USERS);
    setUsers(allUsers);

    // Role-based filtering
    if (isDoctor && currentUser) {
      docs = docs.filter(d => d.userId === currentUser.id);
    } else if (isEscalista) {
      // Escalista sees only doctor documents (read-only)
      const doctorIds = allUsers.filter(u => u.role === 'medico').map(u => u.id);
      docs = docs.filter(d => doctorIds.includes(d.userId));
    }
    // Admin/developer sees all

    setDocuments(docs);
  };

  useEffect(() => {
    let result = documents;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(term) || getUserName(d.userId).toLowerCase().includes(term));
    }
    if (doctorFilter !== 'all') {
      result = result.filter(d => d.userId === doctorFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    setFilteredDocs(result);
  }, [searchTerm, doctorFilter, statusFilter, documents]);

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'N/A';
  const getUser = (id: string) => users.find((u) => u.id === id);
  const doctorUsers = users.filter(u => u.role === 'medico');

  // Group documents by doctor for escalista view
  const doctorDocSummary = doctorUsers.map(doctor => {
    const docs = documents.filter(d => d.userId === doctor.id);
    const approved = docs.filter(d => d.status === 'aprovado').length;
    const pending = docs.filter(d => d.status === 'pendente').length;
    const rejected = docs.filter(d => d.status === 'rejeitado').length;
    return { doctor, total: docs.length, approved, pending, rejected };
  });

  const handleFileSelect = (file: globalThis.File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFile({ name: file.name, dataUrl: reader.result as string });
      if (!form.getValues('name')) {
        form.setValue('name', file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const openDialog = (doc?: Document) => {
    setUploadedFile(null);
    if (doc) {
      setEditingDoc(doc);
      form.reset({ name: doc.name, category: doc.category, userId: doc.userId, expirationDate: doc.expirationDate || '', reviewNotes: doc.reviewNotes || '' });
      if (doc.fileUrl && doc.fileUrl !== '#mock-file') {
        setUploadedFile({ name: doc.name, dataUrl: doc.fileUrl });
      }
    } else {
      setEditingDoc(null);
      const defaults: DocumentFormData = { name: '', category: 'outro', userId: isDoctor && currentUser ? currentUser.id : '', expirationDate: '', reviewNotes: '' };
      form.reset(defaults);
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: DocumentFormData) => {
    const docData: Record<string, unknown> = {
      name: data.name, category: data.category, userId: data.userId,
      fileUrl: uploadedFile?.dataUrl || '#mock-file',
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
    update(STORAGE_KEYS.DOCUMENTS, doc.id, { status, reviewedAt: new Date().toISOString(), reviewedBy: currentUser?.id });
    loadData();
    toast({ title: `Documento ${status}`, description: `${doc.name} foi ${status}.` });
  };

  const handleDelete = (doc: Document) => { setDocToDelete(doc); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (docToDelete) { softDelete(STORAGE_KEYS.DOCUMENTS, docToDelete.id); loadData(); toast({ title: 'Documento excluído', description: `${docToDelete.name} foi removido.` }); }
    setDeleteDialogOpen(false); setDocToDelete(null);
  };

  const handlePreview = (doc: Document) => { setPreviewDoc(doc); setPreviewOpen(true); };

  const handleDownload = (doc: Document) => {
    if (!doc.fileUrl || doc.fileUrl === '#mock-file') {
      toast({ title: 'Sem arquivo', description: 'Este documento não possui arquivo anexado.', variant: 'destructive' });
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.name || 'documento';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImageFile = (url: string) => /^data:image\//i.test(url);
  const isPdfFile = (url: string) => /^data:application\/pdf/i.test(url);

  const pendingCount = documents.filter((d) => d.status === 'pendente').length;
  const approvedCount = documents.filter((d) => d.status === 'aprovado').length;
  const expiringSoon = documents.filter((d) => d.expirationDate && new Date(d.expirationDate) <= new Date(Date.now() + 30 * 86400000)).length;

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground">
              {isDoctor ? 'Seus documentos enviados' : isEscalista ? 'Documentos dos médicos' : 'Gerencie documentos e validações'}
            </p>
          </div>
          {(isAdmin || isDoctor) && (
            <Button onClick={() => openDialog()} className="w-full sm:w-auto"><Upload className="mr-2 h-4 w-4" />Enviar Documento</Button>
          )}
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

        {/* Doctor summary cards for escalista */}
        {isEscalista && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Médicos e Documentos</CardTitle>
              <CardDescription>Visão geral dos documentos por médico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {doctorDocSummary.map(({ doctor, total, approved, pending, rejected }) => (
                  <div
                    key={doctor.id}
                    onClick={() => setDoctorFilter(doctorFilter === doctor.id ? 'all' : doctor.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${doctorFilter === doctor.id ? 'ring-2 ring-primary border-primary' : ''}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={doctor.avatarUrl} />
                      <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doctor.name}</p>
                      <div className="flex gap-2 mt-1">
                        {total === 0 ? (
                          <span className="text-xs text-muted-foreground">Nenhum documento</span>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-xs bg-success/15 text-success border-success/30">{approved} ✓</Badge>
                            {pending > 0 && <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30">{pending} ⏳</Badge>}
                            {rejected > 0 && <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/30">{rejected} ✗</Badge>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar documentos ou médico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          {!isDoctor && (
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-full sm:w-[200px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Médico" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os médicos</SelectItem>
                {doctorUsers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Documentos ({filteredDocs.length})</CardTitle></CardHeader>
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
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {isDoctor ? 'Você ainda não enviou documentos.' : 'Nenhum documento encontrado.'}
                  </TableCell></TableRow>
                ) : filteredDocs.map((doc) => {
                  const StatusIcon = statusIcons[doc.status];
                  return (
                    <TableRow key={doc.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {doc.fileUrl && doc.fileUrl !== '#mock-file' && isImageFile(doc.fileUrl) ? (
                            <div className="h-10 w-10 shrink-0 rounded-md border overflow-hidden bg-muted">
                              <img src={doc.fileUrl} alt={doc.name} className="h-full w-full object-cover" />
                            </div>
                          ) : doc.fileUrl && doc.fileUrl !== '#mock-file' && isPdfFile(doc.fileUrl) ? (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-destructive/5">
                              <FileText className="h-5 w-5 text-destructive" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                              <File className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{doc.name}</span>
                            {doc.fileUrl && doc.fileUrl !== '#mock-file' && <p className="text-xs text-muted-foreground">Arquivo anexado</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => { const u = getUser(doc.userId); return u ? (
                            <><Avatar className="h-6 w-6"><AvatarImage src={u.avatarUrl} /><AvatarFallback className="text-xs">{u.name.charAt(0)}</AvatarFallback></Avatar>
                            <span className="text-sm">{u.name}</span></>
                          ) : <span className="text-sm text-muted-foreground">N/A</span>; })()}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{categoryLabels[doc.category]}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={statusColors[doc.status]}><StatusIcon className="mr-1 h-3 w-3" />{statusLabels[doc.status]}</Badge></TableCell>
                      <TableCell>{doc.expirationDate || '—'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(doc)}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}><Download className="mr-2 h-4 w-4" />Baixar</DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => openDialog(doc)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            )}
                            {canApprove && doc.status === 'pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(doc, 'aprovado')}><CheckCircle className="mr-2 h-4 w-4" />Aprovar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(doc, 'rejeitado')}><XCircle className="mr-2 h-4 w-4" />Rejeitar</DropdownMenuItem>
                              </>
                            )}
                            {canEdit && (
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                            )}
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
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDoc ? 'Editar Documento' : 'Enviar Documento'}</DialogTitle>
              <DialogDescription>Preencha as informações e faça upload do arquivo.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* File Upload Drop Zone */}
                <div className="space-y-2">
                  <FormLabel>Arquivo</FormLabel>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">Clique para substituir</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="ml-2 h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground/60" />
                        <p className="mt-2 text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Ex: CRM - Dr. João" /></FormControl><FormMessage /></FormItem>
                )} />
                {isDoctor ? (
                  <input type="hidden" {...form.register('userId')} />
                ) : (
                  <FormField control={form.control} name="userId" render={({ field }) => (
                    <FormItem><FormLabel>Usuário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                )}
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

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {previewDoc?.name}
              </DialogTitle>
              <DialogDescription>
                {categoryLabels[previewDoc?.category || 'outro']} • {getUserName(previewDoc?.userId || '')}
                {previewDoc?.expirationDate && ` • Validade: ${previewDoc.expirationDate}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {previewDoc?.fileUrl && previewDoc.fileUrl !== '#mock-file' ? (
                <div className="rounded-lg border overflow-hidden">
                  {isImageFile(previewDoc.fileUrl) ? (
                    <img src={previewDoc.fileUrl} alt={previewDoc.name} className="w-full max-h-[60vh] object-contain bg-muted" />
                  ) : isPdfFile(previewDoc.fileUrl) ? (
                    <iframe src={previewDoc.fileUrl} className="w-full h-[60vh]" title={previewDoc.name} />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-12 text-muted-foreground">
                      <File className="h-16 w-16" />
                      <p className="text-sm">Pré-visualização não disponível para este tipo de arquivo.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border p-12 text-muted-foreground">
                  <FileText className="h-16 w-16" />
                  <p className="text-sm">Nenhum arquivo anexado a este documento.</p>
                </div>
              )}

              <div className="grid gap-2 rounded-lg border p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={statusColors[previewDoc?.status || 'pendente']}>{statusLabels[previewDoc?.status || 'pendente']}</Badge></div>
                {previewDoc?.reviewNotes && <div className="flex justify-between"><span className="text-muted-foreground">Observações</span><span className="text-right max-w-[60%]">{previewDoc.reviewNotes}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span>{previewDoc?.createdAt ? new Date(previewDoc.createdAt).toLocaleDateString('pt-BR') : '—'}</span></div>
              </div>
            </div>
            <DialogFooter>
              {canApprove && previewDoc?.status === 'pendente' && (
                <div className="flex gap-2 mr-auto">
                  <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10" onClick={() => { handleStatusChange(previewDoc, 'aprovado'); setPreviewOpen(false); }}>
                    <CheckCircle className="h-4 w-4" />Aprovar
                  </Button>
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { handleStatusChange(previewDoc, 'rejeitado'); setPreviewOpen(false); }}>
                    <XCircle className="h-4 w-4" />Rejeitar
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
              {previewDoc && <Button onClick={() => handleDownload(previewDoc)} className="gap-2"><Download className="h-4 w-4" />Baixar</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}