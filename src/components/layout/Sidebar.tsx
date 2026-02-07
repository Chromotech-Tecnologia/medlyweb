import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Usuários', href: '/usuarios' },
  { icon: Calendar, label: 'Escalas', href: '/escalas' },
  { icon: MapPin, label: 'Locais', href: '/locais' },
  { icon: Stethoscope, label: 'Especialidades', href: '/especialidades' },
  { icon: ClipboardList, label: 'Tipos de Escala', href: '/tipos-escala' },
  { icon: FileText, label: 'Documentos', href: '/documentos' },
  { icon: CreditCard, label: 'Pagamentos', href: '/pagamentos' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar',
        'flex flex-col overflow-hidden'
      )}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!collapsed)}
          className="h-8 w-8 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          const linkContent = (
            <Link
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-sidebar-foreground/50"
            >
              © 2024 Medly
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
