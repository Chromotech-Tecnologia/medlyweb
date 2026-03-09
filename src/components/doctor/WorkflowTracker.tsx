import { cn } from '@/lib/utils';
import { Check, Send, Building2, FileSignature, ShieldCheck, Award, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const WORKFLOW_STEPS = [
  { step: 1, label: 'Envio das Informações', description: 'Médico envia candidatura', icon: Send },
  { step: 2, label: 'Aceite da Empresa', description: 'Escalista/gestor aprova', icon: Building2 },
  { step: 3, label: 'Documentos Assinados', description: 'Médico envia documentos', icon: FileSignature },
  { step: 4, label: 'Validação do Documento', description: 'Admin valida documentação', icon: ShieldCheck },
  { step: 5, label: 'Plantão Aprovado', description: 'Confirmação final', icon: Award },
  { step: 6, label: 'Envio da NF', description: 'NF pela empresa', icon: Receipt },
];

interface WorkflowTrackerProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  compact?: boolean;
}

export function WorkflowTracker({ currentStep, className, compact = false }: WorkflowTrackerProps) {
  return (
    <Card className={cn('glass-card', className)}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {!compact && <h3 className="font-semibold mb-4 text-sm">Fluxo de Aceite de Vaga</h3>}
        <div className={compact ? 'flex items-center gap-1' : 'space-y-0'}>
          {WORKFLOW_STEPS.map((ws, i) => {
            const isDone = ws.step <= currentStep;
            const isCurrent = ws.step === currentStep;
            const Icon = ws.icon;

            if (compact) {
              return (
                <div key={ws.step} className="flex items-center">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
                      isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground',
                      isCurrent && 'ring-2 ring-primary/30'
                    )}
                    title={ws.label}
                  >
                    {isDone && ws.step < currentStep ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{ws.step}</span>
                    )}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn('h-0.5 w-4', isDone ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              );
            }

            return (
              <div key={ws.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                      isDone ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground',
                      isCurrent && 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                    )}
                  >
                    {isDone && ws.step < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn('w-0.5 h-6', isDone ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={cn('text-sm font-medium', isDone ? 'text-foreground' : 'text-muted-foreground')}>
                    {ws.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{ws.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { WORKFLOW_STEPS };
