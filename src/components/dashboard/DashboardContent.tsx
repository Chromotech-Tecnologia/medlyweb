import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  Stethoscope,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for charts
const usersByRole = [
  { name: 'Médicos', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Escalistas', value: 12, color: 'hsl(var(--chart-2))' },
  { name: 'Gestores', value: 8, color: 'hsl(var(--chart-3))' },
  { name: 'Admins', value: 3, color: 'hsl(var(--chart-4))' },
];

const scalesByMonth = [
  { month: 'Jan', escalas: 45 },
  { month: 'Fev', escalas: 52 },
  { month: 'Mar', escalas: 48 },
  { month: 'Abr', escalas: 61 },
  { month: 'Mai', escalas: 55 },
  { month: 'Jun', escalas: 67 },
];

const ratingsByLocation = [
  { location: 'UPA Zona Norte', rating: 4.2 },
  { location: 'Hospital Central', rating: 4.5 },
  { location: 'UBS Vila Mariana', rating: 4.0 },
  { location: 'PS Lapa', rating: 3.8 },
];

const recentActions = [
  { id: 1, action: 'Nova escala criada', user: 'Carlos Silva', time: '5 min atrás', type: 'create' },
  { id: 2, action: 'Candidatura aceita', user: 'Maria Santos', time: '15 min atrás', type: 'approve' },
  { id: 3, action: 'Check-in realizado', user: 'Dra. Ana Costa', time: '30 min atrás', type: 'checkin' },
  { id: 4, action: 'Documento enviado', user: 'Dr. Pedro Mendes', time: '1 hora atrás', type: 'document' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de escalas médicas
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Total de Usuários"
          value={68}
          description="45 médicos ativos"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Escalas Ativas"
          value={23}
          description="8 para esta semana"
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Pendências"
          value={7}
          description="3 documentos, 4 aprovações"
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="Taxa de Ocupação"
          value="87%"
          description="Meta: 90%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          variant="info"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Users by Role Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Usuários por Perfil</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {usersByRole.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scales Trend Line Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Escalas por Mês</CardTitle>
            <CardDescription>Tendência dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scalesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="escalas"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Bar Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Notas por Local</CardTitle>
            <CardDescription>Avaliações médias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingsByLocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="location"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="rating" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Recent Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Ações Recentes</CardTitle>
            <CardDescription>Últimas atividades no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {action.type === 'create' && <Calendar className="h-5 w-5 text-primary" />}
                    {action.type === 'approve' && <CheckCircle className="h-5 w-5 text-success" />}
                    {action.type === 'checkin' && <MapPin className="h-5 w-5 text-info" />}
                    {action.type === 'document' && <Stethoscope className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground">{action.user}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {action.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats / Alerts */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Alertas Ativos</CardTitle>
            <CardDescription>Itens que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">3 documentos pendentes de aprovação</p>
                  <p className="text-xs text-muted-foreground">CRM, diplomas e certificados</p>
                </div>
                <Badge variant="outline" className="border-warning/30 text-warning">
                  Urgente
                </Badge>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-info/30 bg-info/5 p-4">
                <Clock className="h-5 w-5 text-info" />
                <div className="flex-1">
                  <p className="text-sm font-medium">5 escalas sem candidatos</p>
                  <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
                </div>
                <Badge variant="outline" className="border-info/30 text-info">
                  Atenção
                </Badge>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-success/30 bg-success/5 p-4">
                <CheckCircle className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">12 check-ins confirmados hoje</p>
                  <p className="text-xs text-muted-foreground">Taxa de presença: 98%</p>
                </div>
                <Badge variant="outline" className="border-success/30 text-success">
                  OK
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
