import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const CRITERIA = [
  { key: 'punctuality', label: 'Pontualidade' },
  { key: 'cordiality', label: 'Cordialidade' },
  { key: 'quality', label: 'Qualidade Técnica' },
  { key: 'professionalism', label: 'Profissionalismo' },
];

interface DoctorRatingFormProps {
  doctorName: string;
  scaleTitle: string;
  onSubmit: (data: {
    punctualityScore: number;
    qualityScore: number;
    professionalismScore: number;
    overallScore: number;
    comment: string;
  }) => void;
  onCancel?: () => void;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5"
        >
          <Star className={cn('h-5 w-5 transition-colors', (hover || value) >= s ? 'fill-warning text-warning' : 'text-muted-foreground/30')} />
        </button>
      ))}
    </div>
  );
}

export function DoctorRatingForm({ doctorName, scaleTitle, onSubmit, onCancel }: DoctorRatingFormProps) {
  const [scores, setScores] = useState<Record<string, number>>({ punctuality: 0, cordiality: 0, quality: 0, professionalism: 0 });
  const [comment, setComment] = useState('');

  const handleScore = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length);
  const canSubmit = Object.values(scores).every((s) => s > 0);

  const handleSubmit = () => {
    onSubmit({
      punctualityScore: scores.punctuality,
      qualityScore: scores.quality,
      professionalismScore: scores.professionalism,
      overallScore,
      comment,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Avaliar Profissional</CardTitle>
        <p className="text-sm text-muted-foreground">{doctorName} · {scaleTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {CRITERIA.map((c) => (
          <div key={c.key} className="flex items-center justify-between">
            <span className="text-sm font-medium">{c.label}</span>
            <StarRating value={scores[c.key]} onChange={(v) => handleScore(c.key, v)} />
          </div>
        ))}

        {canSubmit && (
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-3">
            <span className="text-sm font-medium">Nota Geral</span>
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-warning text-warning" />
              <span className="text-lg font-bold">{overallScore}</span>
            </div>
          </div>
        )}

        <Textarea
          placeholder="Comentários (opcional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        <div className="flex gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>}
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">Enviar Avaliação</Button>
        </div>
      </CardContent>
    </Card>
  );
}
