import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCsv } from '@/lib/exportUtils';
import { STORAGE_KEYS, getAll } from '@/lib/mocks/storage';
import { getFromStorage } from '@/lib/mocks/storage';
import type { UserProfile, Scale, Location, Payment, Rating, AuditLog } from '@/lib/mocks/types';
import { useToast } from '@/hooks/use-toast';

export function ExportMenu() {
  const { toast } = useToast();

  const doExport = (type: string) => {
    try {
      switch (type) {
        case 'users':
          exportToCsv(getAll<UserProfile>(STORAGE_KEYS.USERS), 'usuarios', [
            { key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' }, { key: 'cpf', label: 'CPF' },
            { key: 'role', label: 'Perfil' }, { key: 'status', label: 'Status' },
          ]);
          break;
        case 'scales':
          exportToCsv(getAll<Scale>(STORAGE_KEYS.SCALES), 'escalas', [
            { key: 'title', label: 'Título' }, { key: 'date', label: 'Data' },
            { key: 'startTime', label: 'Início' }, { key: 'endTime', label: 'Término' },
            { key: 'shift', label: 'Turno' }, { key: 'status', label: 'Status' },
            { key: 'paymentValue', label: 'Valor' },
          ]);
          break;
        case 'locations':
          exportToCsv(getAll<Location>(STORAGE_KEYS.LOCATIONS), 'locais', [
            { key: 'name', label: 'Nome' }, { key: 'type', label: 'Tipo' },
            { key: 'averageRating', label: 'Nota Média' },
          ]);
          break;
        case 'payments':
          exportToCsv(getAll<Payment>(STORAGE_KEYS.PAYMENTS), 'pagamentos', [
            { key: 'doctorId', label: 'Médico ID' }, { key: 'amount', label: 'Valor' },
            { key: 'dueDate', label: 'Vencimento' }, { key: 'status', label: 'Status' },
            { key: 'confirmedByDoctor', label: 'Confirmado pelo Médico' },
          ]);
          break;
        case 'ratings':
          exportToCsv(getAll<Rating>(STORAGE_KEYS.RATINGS), 'avaliacoes', [
            { key: 'type', label: 'Tipo' }, { key: 'overallScore', label: 'Nota' },
            { key: 'comment', label: 'Comentário' },
          ]);
          break;
        case 'audit':
          exportToCsv(getFromStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS), 'auditoria', [
            { key: 'timestamp', label: 'Data/Hora' }, { key: 'userName', label: 'Usuário' },
            { key: 'action', label: 'Ação' }, { key: 'entity', label: 'Entidade' },
            { key: 'entityId', label: 'ID Entidade' },
          ]);
          break;
      }
      toast({ title: 'Exportação concluída', description: `Arquivo CSV gerado com sucesso.` });
    } catch {
      toast({ title: 'Erro na exportação', variant: 'destructive' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => doExport('users')}>Usuários</DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport('scales')}>Escalas</DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport('locations')}>Locais</DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport('payments')}>Pagamentos</DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport('ratings')}>Avaliações</DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport('audit')}>Auditoria</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
