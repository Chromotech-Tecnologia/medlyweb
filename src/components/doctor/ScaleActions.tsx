import { useState } from 'react';
import { AlertTriangle, ArrowRight, XCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { calculateCancellationPenalty, canTransferScale } from '@/lib/scaleUtils';
import type { Scale } from '@/lib/mocks/types';

interface ScaleActionsProps {
  scale: Scale;
  onCancel: (scaleId: string, penaltyAmount: number) => void;
  onTransfer: (scaleId: string) => void;
}

export function ScaleActions({ scale, onCancel, onTransfer }: ScaleActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const penalty = calculateCancellationPenalty(scale);
  const transfer = canTransferScale(scale);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <>
      <Card className="glass-card">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Ações do Plantão</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Desistir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => setTransferDialogOpen(true)}
              disabled={!transfer.allowed}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Repassar
            </Button>
          </div>
          {!transfer.allowed && (
            <p className="text-xs text-muted-foreground">
              Repasse indisponível — prazo expirado ({scale.transferDeadlineDays} dias antes)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Desistência
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desistir de <strong>{scale.title}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dias até o plantão</span>
              <span className="font-medium">{penalty.daysUntilScale} dias</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prazo de desistência</span>
              <span className="font-medium">{scale.cancellationDeadlineDays} dias antes</span>
            </div>

            {!penalty.withinDeadline ? (
              <div className="rounded-lg bg-destructive/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <DollarSign className="h-4 w-4" />
                  Multa por desistência tardia
                </div>
                <p className="text-sm text-muted-foreground">
                  Como o prazo de {scale.cancellationDeadlineDays} dias já passou, será aplicada
                  uma multa de <strong>50%</strong> do valor do plantão.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-destructive/20">
                  <span className="text-sm">Valor da multa</span>
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    {formatCurrency(penalty.penaltyAmount)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                Sem multa — dentro do prazo de desistência
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCancel(scale.id, penalty.penaltyAmount);
                setCancelDialogOpen(false);
              }}
            >
              {penalty.withinDeadline ? 'Confirmar Desistência' : `Desistir e Pagar ${formatCurrency(penalty.penaltyAmount)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repassar Plantão</DialogTitle>
            <DialogDescription>
              Ao repassar, o plantão <strong>{scale.title}</strong> voltará a ficar disponível
              para outros médicos se candidatarem.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p>• O repasse é permitido até {scale.transferDeadlineDays} dias antes do plantão</p>
            <p>• Não haverá penalidade financeira</p>
            <p>• A escala voltará ao status "publicada"</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                onTransfer(scale.id);
                setTransferDialogOpen(false);
              }}
            >
              Confirmar Repasse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
