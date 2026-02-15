import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Loader2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  initializeStorage,
  STORAGE_KEYS,
  getAll,
  create,
  update,
  softDelete,
} from '@/lib/mocks/storage';
import type { UserProfile, Specialty } from '@/lib/mocks/types';
import { userSchema, type UserFormData } from '@/lib/validations';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  escalista: 'Escalista',
  medico: 'Médico',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pendente',
};

const statusColors: Record<string, string> = {
  ativo: 'bg-success/15 text-success border-success/30',
  inativo: 'bg-destructive/15 text-destructive border-destructive/30',
  pendente: 'bg-warning/15 text-warning border-warning/30',
};

// ViaCEP
async function fetchAddressByCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf };
  } catch {
    return null;
  }
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      role: 'medico',
      status: 'ativo',
      crm: '',
      crmState: '',
      specialties: [],
      managerId: '',
    },
  });

  const watchRole = form.watch('role');

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  const loadData = () => {
    const data = getAll<UserProfile>(STORAGE_KEYS.USERS);
    setUsers(data);
    setFilteredUsers(data);
    setSpecialties(getAll<Specialty>(STORAGE_KEYS.SPECIALTIES));
  };

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.cpf.includes(term)
      );
    }
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') result = result.filter((u) => u.status === statusFilter);
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const openDialog = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user);
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        status: user.status,
        crm: user.crm || '',
        crmState: user.crmState || '',
        specialties: user.specialties || [],
        managerId: user.managerId || '',
      });
    } else {
      setEditingUser(null);
      form.reset({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        role: 'medico',
        status: 'ativo',
        crm: '',
        crmState: '',
        specialties: [],
        managerId: '',
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    const userData: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      role: data.role,
      status: data.status,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name.replace(/\s/g, '')}`,
    };

    if (data.role === 'medico') {
      userData.crm = data.crm;
      userData.crmState = data.crmState;
      userData.specialties = data.specialties;
    }
    if (data.managerId) userData.managerId = data.managerId;

    if (editingUser) {
      update(STORAGE_KEYS.USERS, editingUser.id, userData);
      toast({ title: 'Usuário atualizado!', description: `${data.name} foi atualizado.` });
    } else {
      create(STORAGE_KEYS.USERS, userData);
      toast({ title: 'Usuário criado!', description: `${data.name} foi adicionado.` });
    }

    setDialogOpen(false);
    loadData();
  };

  const handleDelete = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      softDelete(STORAGE_KEYS.USERS, userToDelete.id);
      loadData();
      toast({ title: 'Usuário excluído', description: `${userToDelete.name} foi removido.` });
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const toggleStatus = (user: UserProfile) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
    update(STORAGE_KEYS.USERS, user.id, { status: newStatus });
    loadData();
    toast({ title: 'Status atualizado', description: `${user.name} agora está ${statusLabels[newStatus].toLowerCase()}.` });
  };

  const viewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const managers = users.filter((u) => u.role === 'admin' || u.role === 'gestor');

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nome, email ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os perfis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="escalista">Escalista</SelectItem>
                  <SelectItem value="medico">Médico</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Avaliação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{roleLabels[user.role]}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[user.status]}>{statusLabels[user.status]}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.averageRating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-warning">★</span>
                            <span>{user.averageRating.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => viewDetails(user)}><Eye className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDialog(user)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(user)}>
                              {user.status === 'ativo' ? <><UserX className="mr-2 h-4 w-4" />Desativar</> : <><UserCheck className="mr-2 h-4 w-4" />Ativar</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(user)}>
                              <Trash2 className="mr-2 h-4 w-4" />Excluir
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

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>Preencha as informações do usuário.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} placeholder="Nome completo" /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" placeholder="email@exemplo.com" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} placeholder="(11) 99999-9999" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="gestor">Gestor</SelectItem>
                          <SelectItem value="escalista">Escalista</SelectItem>
                          <SelectItem value="medico">Médico</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {watchRole === 'medico' && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="crm" render={({ field }) => (
                        <FormItem><FormLabel>CRM</FormLabel><FormControl><Input {...field} placeholder="123456" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="crmState" render={({ field }) => (
                        <FormItem><FormLabel>UF do CRM</FormLabel><FormControl><Input {...field} placeholder="SP" maxLength={2} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="specialties" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidades</FormLabel>
                        <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                          {specialties.map((spec) => (
                            <label key={spec.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={field.value?.includes(spec.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, spec.id]
                                      : current.filter((id) => id !== spec.id)
                                  );
                                }}
                              />
                              {spec.name}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </>
                )}

                <FormField control={form.control} name="managerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gestor (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione um gestor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name} ({roleLabels[m.role]})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingUser ? 'Salvar' : 'Criar'}</Button>
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
              <DialogDescription>Tem certeza que deseja excluir <strong>{userToDelete?.name}</strong>?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detalhes do Usuário</DialogTitle></DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback className="text-lg">{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg border p-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Perfil</span><Badge variant="secondary">{roleLabels[selectedUser.role]}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={statusColors[selectedUser.status]}>{statusLabels[selectedUser.status]}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{selectedUser.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{selectedUser.cpf}</span></div>
                  {selectedUser.crm && <div className="flex justify-between"><span className="text-muted-foreground">CRM</span><span>{selectedUser.crm}/{selectedUser.crmState}</span></div>}
                  {selectedUser.specialties && selectedUser.specialties.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Especialidades</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedUser.specialties.map((sId) => {
                          const spec = specialties.find((s) => s.id === sId);
                          return spec ? <Badge key={sId} variant="outline" className="text-xs">{spec.name}</Badge> : null;
                        })}
                      </div>
                    </div>
                  )}
                  {selectedUser.averageRating != null && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Avaliação</span><span className="flex items-center gap-1"><span className="text-warning">★</span>{selectedUser.averageRating.toFixed(1)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Escalas concluídas</span><span>{selectedUser.completedScales || 0}</span></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
