import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Key, RefreshCw, Database, Shield, Activity, Eye, EyeOff, Save, Trash2, ExternalLink, Loader2, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { STORAGE_KEYS, getAll, resetStorage } from '@/lib/mocks/storage';
import { getApiConfig, setApiConfig, validateCrm, type ApiConfig, type CrmValidationResult } from '@/lib/mocks/crmApi';
import type { AuditLog, UserProfile } from '@/lib/mocks/types';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DevTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiConfig, setLocalApiConfig] = useState<ApiConfig>(getApiConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [entityCounts, setEntityCounts] = useState<Record<string, number>>({});

  const loadData = () => {
    const counts: Record<string, number> = {};
    const keys: Record<string, string> = {
      'Usuários': STORAGE_KEYS.USERS,
      'Escalas': STORAGE_KEYS.SCALES,
      'Locais': STORAGE_KEYS.LOCATIONS,
      'Especialidades': STORAGE_KEYS.SPECIALTIES,
      'Tipos de Escala': STORAGE_KEYS.SCALE_TYPES,
      'Candidaturas': STORAGE_KEYS.CANDIDATURES,
      'Documentos': STORAGE_KEYS.DOCUMENTS,
      'Pagamentos': STORAGE_KEYS.PAYMENTS,
      'Notificações': STORAGE_KEYS.NOTIFICATIONS,
    };
    Object.entries(keys).forEach(([label, key]) => {
      const data = localStorage.getItem(key);
      counts[label] = data ? JSON.parse(data).length : 0;
    });
    setEntityCounts(counts);

    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const logs: AuditLog[] = JSON.parse(raw);
      setAuditLogs(logs.slice(0, 100));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Redirect non-developers
  if (user?.role !== 'developer') {
    return <Navigate to="/" replace />;
  }

  const saveApiConfig = () => {
    setApiConfig(apiConfig);
    toast({ title: 'Configuração salva', description: 'As configurações da API foram atualizadas.' });
  };

  const handleResetStorage = () => {
    resetStorage();
    loadData();
    toast({ title: 'Dados resetados', description: 'Todos os dados mock foram reinicializados.' });
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dev Tools</h1>
            <p className="text-muted-foreground">Ferramentas exclusivas para desenvolvimento</p>
          </div>
          <Badge variant="destructive" className="ml-auto">DEVELOPER ONLY</Badge>
        </div>

        <Tabs defaultValue="apis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apis" className="gap-2"><Key className="h-4 w-4" />APIs</TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><Shield className="h-4 w-4" />Auditoria</TabsTrigger>
            <TabsTrigger value="storage" className="gap-2"><Database className="h-4 w-4" />Storage</TabsTrigger>
            <TabsTrigger value="system" className="gap-2"><Activity className="h-4 w-4" />Sistema</TabsTrigger>
          </TabsList>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  InfoSimples — Consulta CRM
                </CardTitle>
                <CardDescription>
                  Configure a integração com a API InfoSimples para validação de CRM médico junto ao CFM.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Modo Mock</p>
                    <p className="text-sm text-muted-foreground">
                      {apiConfig.infosimples.useMock
                        ? 'Usando dados simulados (sem chamada real à API)'
                        : 'Usando API real da InfoSimples'}
                    </p>
                  </div>
                  <Switch
                    checked={!apiConfig.infosimples.useMock}
                    onCheckedChange={(checked) =>
                      setLocalApiConfig((prev) => ({
                        ...prev,
                        infosimples: { ...prev.infosimples, useMock: !checked },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiConfig.infosimples.apiKey}
                      onChange={(e) =>
                        setLocalApiConfig((prev) => ({
                          ...prev,
                          infosimples: { ...prev.infosimples, apiKey: e.target.value },
                        }))
                      }
                      placeholder="Insira a API Key da InfoSimples"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Base</label>
                  <Input
                    value={apiConfig.infosimples.baseUrl}
                    onChange={(e) =>
                      setLocalApiConfig((prev) => ({
                        ...prev,
                        infosimples: { ...prev.infosimples, baseUrl: e.target.value },
                      }))
                    }
                    placeholder="https://api.infosimples.com/api/v2/consultas/cfm/crm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveApiConfig} className="gap-2">
                    <Save className="h-4 w-4" />Salvar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>Últimos 100 registros de ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Entidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-sm">{log.userName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.entity}</TableCell>
                        </TableRow>
                      ))}
                      {auditLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Nenhum log encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entidades no Storage</CardTitle>
                <CardDescription>Contagem de registros por entidade no localStorage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(entityCounts).map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{label}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações do Sistema</CardTitle>
                <CardDescription>Ferramentas de manutenção e debug</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
                  <div>
                    <p className="font-medium text-destructive">Resetar Dados Mock</p>
                    <p className="text-sm text-muted-foreground">
                      Remove todos os dados e reinicializa com dados padrão
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleResetStorage} className="gap-2">
                    <RefreshCw className="h-4 w-4" />Resetar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
