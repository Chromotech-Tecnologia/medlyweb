import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Search, MoreHorizontal, Pencil, Trash2, Eye,
  Check, X, LayoutDashboard, Users, Calendar, MapPin, CreditCard, FileText, BarChart3, Settings,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { initializeStorage, STORAGE_KEYS, getAll, create, update, softDelete } from '@/lib/mocks/storage';
import type { RoleProfile, Permission, DashboardPermission, ProfilePermissions, UserRole } from '@/lib/mocks/types';

const roleLabels: Record<string, string> = { admin: 'Administrador', gestor: 'Gestor', escalista: 'Escalista', medico: 'Médico' };
const roleColors: Record<string, string> = { admin: 'bg-destructive/15 text-destructive', gestor: 'bg-primary/15 text-primary', escalista: 'bg-warning/15 text-warning', medico: 'bg-success/15 text-success' };

const moduleLabels: Record<string, { label: string; icon: React.ElementType }> = {
  users: { label: 'Usuários', icon: Users },
  scales: { label: 'Escalas', icon: Calendar },
  locations: { label: 'Locais', icon: MapPin },
  payments: { label: 'Pagamentos', icon: CreditCard },
  documents: { label: 'Documentos', icon: FileText },
  reports: { label: 'Relatórios', icon: BarChart3 },
  settings: { label: 'Configurações', icon: Settings },
};

const permActions = ['view', 'create', 'edit', 'delete', 'viewAll'] as const;
const permLabels: Record<string, string> = { view: 'Ver', create: 'Criar', edit: 'Editar', delete: 'Excluir', viewAll: 'Ver Tudo' };

const cardLabels: Record<string, string> = { totalUsers: 'Total Usuários', activeScales: 'Escalas Ativas', pendingPayments: 'Pgtos Pendentes', occupancyRate: 'Taxa Ocupação' };
const chartLabels: Record<string, string> = { usersByRole: 'Usuários por Perfil', scalesTrend: 'Tendência de Escalas', locationRatings: 'Notas por Local' };

const emptyPermission = (): Permission => ({ view: false, create: false, edit: false, delete: false, viewAll: false });
const emptyDashboard = (): DashboardPermission => ({
  view: false, viewAll: false,
  cards: { totalUsers: false, activeScales: false, pendingPayments: false, occupancyRate: false },
  charts: { usersByRole: false, scalesTrend: false, locationRatings: false },
});

export default function Profiles() {
  const [profiles, setProfiles] = useState<RoleProfile[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RoleProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<RoleProfile | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<RoleProfile | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('medico');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<ProfilePermissions>({
    dashboard: emptyDashboard(),
    users: emptyPermission(), scales: emptyPermission(), locations: emptyPermission(),
    payments: emptyPermission(), documents: emptyPermission(), reports: emptyPermission(), settings: emptyPermission(),
  });

  const { toast } = useToast();

  useEffect(() => { initializeStorage(); loadData(); }, []);
  const loadData = () => {
    const data = getAll<RoleProfile>(STORAGE_KEYS.ROLE_PROFILES);
    // Ensure all profiles have complete dashboard permissions structure
    data.forEach(p => {
      if (!p.permissions) p.permissions = {} as ProfilePermissions;
      if (!p.permissions.dashboard) p.permissions.dashboard = emptyDashboard();
      if (!p.permissions.dashboard.cards) p.permissions.dashboard.cards = { totalUsers: false, activeScales: false, pendingPayments: false, occupancyRate: false };
      if (!p.permissions.dashboard.charts) p.permissions.dashboard.charts = { usersByRole: false, scalesTrend: false, locationRatings: false };
    });
    setProfiles(data);
  };

  const openDialog = (profile?: RoleProfile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormName(profile.name);
      setFormRole(profile.role);
      setFormDescription(profile.description);
      const perms = JSON.parse(JSON.stringify(profile.permissions));
      if (!perms.dashboard) perms.dashboard = emptyDashboard();
      if (!perms.dashboard.cards) perms.dashboard.cards = { totalUsers: false, activeScales: false, pendingPayments: false, occupancyRate: false };
      if (!perms.dashboard.charts) perms.dashboard.charts = { usersByRole: false, scalesTrend: false, locationRatings: false };
      setFormPermissions(perms);
    } else {
      setEditingProfile(null);
      setFormName('');
      setFormRole('medico');
      setFormDescription('');
      setFormPermissions({
        dashboard: emptyDashboard(),
        users: emptyPermission(), scales: emptyPermission(), locations: emptyPermission(),
        payments: emptyPermission(), documents: emptyPermission(), reports: emptyPermission(), settings: emptyPermission(),
      });
    }
    setDialogOpen(true);
  };

  const toggleModulePerm = (module: keyof Omit<ProfilePermissions, 'dashboard'>, action: keyof Permission) => {
    setFormPermissions(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !(prev[module] as Permission)[action] },
    }));
  };

  const toggleDashboard = (field: 'view' | 'viewAll') => {
    setFormPermissions(prev => ({ ...prev, dashboard: { ...prev.dashboard, [field]: !prev.dashboard[field] } }));
  };

  const toggleDashCard = (card: keyof DashboardPermission['cards']) => {
    setFormPermissions(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, cards: { ...prev.dashboard.cards, [card]: !prev.dashboard.cards[card] } },
    }));
  };

  const toggleDashChart = (chart: keyof DashboardPermission['charts']) => {
    setFormPermissions(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, charts: { ...prev.dashboard.charts, [chart]: !prev.dashboard.charts[chart] } },
    }));
  };

  const handleSave = () => {
    if (!formName.trim()) { toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' }); return; }

    const data: Record<string, unknown> = { name: formName, role: formRole, description: formDescription, permissions: formPermissions };

    if (editingProfile) {
      update(STORAGE_KEYS.ROLE_PROFILES, editingProfile.id, data);
      toast({ title: 'Perfil atualizado!', description: `${formName} foi atualizado.` });
    } else {
      create(STORAGE_KEYS.ROLE_PROFILES, data);
      toast({ title: 'Perfil criado!', description: `${formName} foi adicionado.` });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = (p: RoleProfile) => { setProfileToDelete(p); setDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (profileToDelete) { softDelete(STORAGE_KEYS.ROLE_PROFILES, profileToDelete.id); loadData(); toast({ title: 'Perfil excluído' }); }
    setDeleteDialogOpen(false); setProfileToDelete(null);
  };

  const viewDetails = (p: RoleProfile) => { setSelectedProfile(p); setDetailsDialogOpen(true); };

  const countPermissions = (p: RoleProfile) => {
    let total = 0;
    const modules = ['users', 'scales', 'locations', 'payments', 'documents', 'reports', 'settings'] as const;
    modules.forEach(m => { const perm = p.permissions?.[m] as Permission | undefined; if (perm) { permActions.forEach(a => { if (perm[a]) total++; }); } });
    if (p.permissions?.dashboard?.view) total++;
    if (p.permissions?.dashboard?.viewAll) total++;
    if (p.permissions?.dashboard?.cards) { Object.values(p.permissions.dashboard.cards).forEach(v => { if (v) total++; }); }
    if (p.permissions?.dashboard?.charts) { Object.values(p.permissions.dashboard.charts).forEach(v => { if (v) total++; }); }
    return total;
  };

  const PermBadge = ({ enabled }: { enabled: boolean }) => (
    enabled ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground/30" />
  );

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Perfis e Permissões</h1>
            <p className="text-muted-foreground">Gerencie perfis de acesso e permissões granulares</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Novo Perfil</Button>
        </div>

        {/* Profiles Table */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Perfis ({profiles.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(p => (
                  <TableRow key={p.id} className="group">
                    <TableCell><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /><span className="font-medium">{p.name}</span></div></TableCell>
                    <TableCell><Badge className={roleColors[p.role]}>{roleLabels[p.role]}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{p.description}</TableCell>
                    <TableCell><Badge variant="secondary">{countPermissions(p)} ativas</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewDetails(p)}><Eye className="mr-2 h-4 w-4" />Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(p)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p)}><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
              <DialogDescription>Configure as permissões granulares por módulo.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Perfil</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Gestor Regional" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Role</Label>
                  <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="escalista">Escalista</SelectItem>
                      <SelectItem value="medico">Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Descreva o perfil..." rows={2} />
              </div>

              <Separator />

              {/* Permissions Tabs */}
              <Tabs defaultValue="modules">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="modules">Módulos</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-3 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Ver Tudo:</strong> quando ativo, o usuário vê todos os dados do módulo. Quando inativo, vê apenas os dados relacionados ao seu login.
                  </p>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Módulo</TableHead>
                          {permActions.map(a => <TableHead key={a} className="text-center w-[80px]">{permLabels[a]}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Object.keys(moduleLabels) as (keyof typeof moduleLabels)[]).map(mod => {
                          const { label, icon: Icon } = moduleLabels[mod];
                          const perm = formPermissions[mod] as Permission;
                          return (
                            <TableRow key={mod}>
                              <TableCell><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{label}</span></div></TableCell>
                              {permActions.map(a => (
                                <TableCell key={a} className="text-center">
                                  <Checkbox checked={perm[a]} onCheckedChange={() => toggleModulePerm(mod as keyof Omit<ProfilePermissions, 'dashboard'>, a)} />
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Controle a visibilidade do dashboard, cards e gráficos.
                    <strong> Ver Tudo</strong> permite ver dados de todos os usuários, não apenas os próprios.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /><span className="font-medium">Visualizar Dashboard</span></div>
                      <Switch checked={formPermissions.dashboard.view} onCheckedChange={() => toggleDashboard('view')} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div><span className="font-medium">Ver Tudo no Dashboard</span><p className="text-xs text-muted-foreground">Ver dados de todos, não apenas os próprios</p></div>
                      <Switch checked={formPermissions.dashboard.viewAll} onCheckedChange={() => toggleDashboard('viewAll')} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Cards (KPIs)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(cardLabels) as (keyof typeof cardLabels)[]).map(card => (
                        <label key={card} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox checked={formPermissions.dashboard.cards[card as keyof DashboardPermission['cards']]} onCheckedChange={() => toggleDashCard(card as keyof DashboardPermission['cards'])} />
                          <span className="text-sm">{cardLabels[card]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Gráficos</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(chartLabels) as (keyof typeof chartLabels)[]).map(chart => (
                        <label key={chart} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox checked={formPermissions.dashboard.charts[chart as keyof DashboardPermission['charts']]} onCheckedChange={() => toggleDashChart(chart as keyof DashboardPermission['charts'])} />
                          <span className="text-sm">{chartLabels[chart]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingProfile ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir <strong>{profileToDelete?.name}</strong>?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>Detalhes do Perfil</DialogTitle></DialogHeader>
            {selectedProfile && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedProfile.description}</p>
                  </div>
                  <Badge className={`ml-auto ${roleColors[selectedProfile.role]}`}>{roleLabels[selectedProfile.role]}</Badge>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Permissões por Módulo</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Módulo</TableHead>
                          {permActions.map(a => <TableHead key={a} className="text-center">{permLabels[a]}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Object.keys(moduleLabels) as (keyof typeof moduleLabels)[]).map(mod => {
                          const perm = (selectedProfile.permissions?.[mod] ?? { view: false, create: false, edit: false, delete: false, viewAll: false }) as Permission;
                          return (
                            <TableRow key={mod}>
                              <TableCell className="font-medium">{moduleLabels[mod].label}</TableCell>
                              {permActions.map(a => <TableCell key={a} className="text-center"><PermBadge enabled={perm[a]} /></TableCell>)}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dashboard</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between border-b pb-1"><span>Visualizar</span><PermBadge enabled={selectedProfile.permissions?.dashboard?.view ?? false} /></div>
                    <div className="flex justify-between border-b pb-1"><span>Ver Tudo</span><PermBadge enabled={selectedProfile.permissions?.dashboard?.viewAll ?? false} /></div>
                    <h5 className="font-medium mt-2">Cards</h5>
                    {selectedProfile.permissions?.dashboard?.cards && Object.entries(selectedProfile.permissions.dashboard.cards).map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span>{cardLabels[k]}</span><PermBadge enabled={v} /></div>
                    ))}
                    <h5 className="font-medium mt-2">Gráficos</h5>
                    {selectedProfile.permissions?.dashboard?.charts && Object.entries(selectedProfile.permissions.dashboard.charts).map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span>{chartLabels[k]}</span><PermBadge enabled={v} /></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
