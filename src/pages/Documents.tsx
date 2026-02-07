import { motion } from 'framer-motion';
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock documents data
const mockDocuments = [
  {
    id: '1',
    name: 'CRM - Dr. João Silva',
    category: 'crm',
    status: 'aprovado',
    uploadedAt: '2024-01-15',
    expirationDate: '2025-01-15',
  },
  {
    id: '2',
    name: 'Diploma de Medicina',
    category: 'diploma',
    status: 'pendente',
    uploadedAt: '2024-01-20',
    expirationDate: null,
  },
  {
    id: '3',
    name: 'Comprovante de Residência',
    category: 'comprovante',
    status: 'rejeitado',
    uploadedAt: '2024-01-18',
    expirationDate: null,
  },
];

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-warning/15 text-warning border-warning/30',
  aprovado: 'bg-success/15 text-success border-success/30',
  rejeitado: 'bg-destructive/15 text-destructive border-destructive/30',
};

const statusIcons: Record<string, React.ElementType> = {
  pendente: Clock,
  aprovado: CheckCircle,
  rejeitado: XCircle,
};

const categoryLabels: Record<string, string> = {
  identidade: 'Identidade',
  crm: 'CRM',
  diploma: 'Diploma',
  comprovante: 'Comprovante',
  contrato: 'Contrato',
  outro: 'Outro',
};

export default function Documents() {
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
            <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground">Gerencie seus documentos e validações</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Enviar Documento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">A vencer</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Meus Documentos</CardTitle>
            <CardDescription>Lista de documentos enviados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDocuments.map((doc) => {
                  const StatusIcon = statusIcons[doc.status];
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{categoryLabels[doc.category]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[doc.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusLabels[doc.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.uploadedAt}</TableCell>
                      <TableCell>{doc.expirationDate || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
