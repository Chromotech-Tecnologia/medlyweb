import { motion } from 'framer-motion';
import {
  Users, Calendar, Clock, CheckCircle, UserCheck, Stethoscope,
  MapPin, FileText, TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data
const scalesByStatus = [
  { name: 'Publicadas', value: 12, color: 'hsl(var(--chart-1))' },
  { name: 'Em Andamento', value: 5, color: 'hsl(var(--chart-2))' },
  { name: 'Concluídas', value: 28, color: 'hsl(var(--chart-3))' },
  { name: 'Rascunho', value: 3, color: 'hsl(var(--chart-4))' },
];

const scalesByMonth = [
  { month: 'Jan', escalas: 32 },
  { month: 'Fev', escalas: 38 },
  { month: 'Mar', escalas: 35 },
  { month: 'Abr', escalas: 42 },
  { month: 'Mai', escalas: 40 },
  { month: 'Jun', escalas: 48 },
];

const doctorsBySpecialty = [
  { specialty: 'Clínica Geral', count: 18 },
  { specialty: 'Pediatria', count: 12 },
  { specialty: 'Ortopedia', count: 8 },
  { specialty: 'Cardiologia', count: 7 },
];

const checkInsByDay = [
  { day: 'Seg', checkins: 8 },
  { day: 'Ter', checkins: 12 },
  { day: 'Qua', checkins: 10 },
  { day: 'Qui', checkins: 14 },
  { day: 'Sex', checkins: 11 },
  { day: 'Sáb', checkins: 6 },
  { day: 'Dom', checkins: 4 },
];

const avgRatings = [
  { location: 'UPA Zona Norte', rating: 4.2 },
  { location: 'Hospital Central', rating: 4.5 },
  { location: 'UBS Vila Mariana', rating: 4.0 },
];

const nextScales = [
  { id: '1', title: 'Plantão UPA - Clínica Geral', date: '15/03/2026', time: '19:00-07:00', doctor: 'Dra. Ana Costa', status: 'confirmado' },
  { id: '2', title: 'Plantão Hospital - Pediatria', date: '18/03/2026', time: '07:00-07:00', doctor: 'Dr. Pedro Mendes', status: 'confirmado' },
  { id: '3', title: 'Ambulatório - Ortopedia', date: '22/03/2026', time: '08:00-14:00', doctor: '—', status: 'aberta' },
  { id: '4', title: 'Plantão PS - Cardiologia', date: '25/03/2026', time: '19:00-07:00', doctor: '—', status: 'aberta' },
];

const doctorsWithPendingDocs = [
  { id: '1', name: 'Dra. Ana Costa', doc: 'CRM', expiry: '20/04/2026', status: 'expirando' },
  { id: '2', name: 'Dr. Pedro Mendes', doc: 'Diploma', expiry: '—', status: 'pendente' },
  { id: '3', name: 'Dr. Lucas Ferreira', doc: 'Comprovante', expiry: '—', status: 'pendente' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

export function DashboardGestor() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Gestão de escalas e equipes médicas</p>
      </motion.div>

      {/* 4 Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Médicos Ativos" value={45} description="3 novos este mês" icon={Users} trend={{ value: 7, isPositive: true }} variant="default" />
        <StatsCard title="Escalas da Semana" value={8} description="5 confirmadas" icon={Calendar} variant="success" />
        <StatsCard title="Candidaturas Pendentes" value={12} description="Aguardando aprovação" icon={UserCheck} variant="warning" />
        <StatsCard title="Taxa de Presença" value="96%" description="Últimos 30 dias" icon={TrendingUp} trend={{ value: 2, isPositive: true }} variant="info" />
      </motion.div>

      {/* 5 Charts - Row 1 (3) */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Scales by Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Escalas por Status</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scalesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {scalesByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {scalesByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scales by Month */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Escalas por Mês</CardTitle>
            <CardDescription>Tendência semestral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scalesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="escalas" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Doctors by Specialty */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Médicos por Especialidade</CardTitle>
            <CardDescription>Distribuição ativa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorsBySpecialty}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="specialty" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 5 Charts - Row 2 (2) */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Check-ins by Day */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Check-ins por Dia</CardTitle>
            <CardDescription>Última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={checkInsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="checkins" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Ratings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Avaliações Médias</CardTitle>
            <CardDescription>Por local</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgRatings} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="location" stroke="hsl(var(--muted-foreground))" fontSize={10} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="rating" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2 Tables */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Next Scales */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Próximas Escalas</CardTitle>
            <CardDescription>Escalas agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escala</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nextScales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.date} · {s.time}</p>
                    </TableCell>
                    <TableCell className="text-sm">{s.doctor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={s.status === 'confirmado' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning border-warning/30'}>
                        {s.status === 'confirmado' ? 'Confirmado' : 'Aberta'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Doctors with Pending Docs */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Documentos Pendentes</CardTitle>
            <CardDescription>Médicos com documentação incompleta</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médico</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorsWithPendingDocs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-sm">{d.name}</TableCell>
                    <TableCell>
                      <p className="text-sm">{d.doc}</p>
                      {d.expiry !== '—' && <p className="text-xs text-muted-foreground">Vence: {d.expiry}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.status === 'expirando' ? 'bg-warning/15 text-warning border-warning/30' : 'bg-muted text-muted-foreground'}>
                        {d.status === 'expirando' ? 'Expirando' : 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
