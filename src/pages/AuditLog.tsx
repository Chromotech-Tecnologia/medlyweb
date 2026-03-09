import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { STORAGE_KEYS, getFromStorage } from '@/lib/mocks/storage';
import { exportToCsv } from '@/lib/exportUtils';
import type { AuditLog as AuditLogType } from '@/lib/mocks/types';

const actionColors: Record<string, string> = {
  CREATE: 'bg-success/15 text-success border-success/30',
  LOGIN: 'bg-info/15 text-info border-info/30',
  LOGOUT: 'bg-muted text-muted-foreground',
  UPDATE: 'bg-warning/15 text-warning border-warning/30',
  DELETE: 'bg-destructive/15 text-destructive border-destructive/30',
  APPLY: 'bg-primary/15 text-primary border-primary/30',
  REGISTER: 'bg-success/15 text-success border-success/30',
  FORGOT_PASSWORD: 'bg-warning/15 text-warning border-warning/30',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getFromStorage<AuditLogType>(STORAGE_KEYS.AUDIT_LOGS));
  }, []);

  const actions = useMemo(() => [...new Set(logs.map(l => l.action))].sort(), [logs]);
  const entities = useMemo(() => [...new Set(logs.map(l => l.entity))].sort(), [logs]);

  const filtered = useMemo(() => {
    let result = logs;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(l => l.userName.toLowerCase().includes(term) || l.action.toLowerCase().includes(term) || l.entity.toLowerCase().includes(term));
    }
    if (actionFilter !== 'all') result = result.filter(l => l.action === actionFilter);
    if (entityFilter !== 'all') result = result.filter(l => l.entity === entityFilter);
    if (dateFrom) result = result.filter(l => l.timestamp >= dateFrom);
    if (dateTo) result = result.filter(l => l.timestamp <= dateTo + 'T23:59:59');
    return result;
  }, [logs, search, actionFilter, entityFilter, dateFrom, dateTo]);

  const handleExport = () => {
    exportToCsv(filtered as unknown as Record<string, unknown>[], 'auditoria', [
      { key: 'timestamp', label: 'Data/Hora' },
      { key: 'userName', label: 'Usuário' },
      { key: 'action', label: 'Ação' },
      { key: 'entity', label: 'Entidade' },
      { key: 'entityId', label: 'ID Entidade' },
    ]);
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Auditoria do Sistema
            </h1>
            <p className="text-muted-foreground">Histórico completo de operações</p>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger><SelectValue placeholder="Ação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger><SelectValue placeholder="Entidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="De" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="Até" />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</TableCell></TableRow>
                ) : filtered.map((log) => (
                  <>
                    <TableRow key={log.id} className="group cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-medium text-sm">{log.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={actionColors[log.action] || 'bg-muted text-muted-foreground'}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.entity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {log.details && (expandedId === log.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
                      </TableCell>
                    </TableRow>
                    {expandedId === log.id && log.details && (
                      <TableRow key={`${log.id}-details`}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono p-2">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
