import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'from-primary/10 to-primary/5 text-primary',
  success: 'from-success/10 to-success/5 text-success',
  warning: 'from-warning/10 to-warning/5 text-warning',
  info: 'from-info/10 to-info/5 text-info',
  destructive: 'from-destructive/10 to-destructive/5 text-destructive',
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn('group', className)}
    >
      <Card className="glass-card overflow-hidden transition-shadow duration-300 hover:shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold tracking-tight"
              >
                {value}
              </motion.p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="text-muted-foreground">vs último mês</span>
                </div>
              )}
            </div>
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={cn(
                'rounded-xl bg-gradient-to-br p-3',
                variantStyles[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
