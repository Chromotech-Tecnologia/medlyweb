import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências do sistema</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Settings */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Perfil</CardTitle>
              </div>
              <CardDescription>Configurações da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exibir email publicamente</Label>
                  <p className="text-sm text-muted-foreground">Outros usuários podem ver seu email</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exibir telefone publicamente</Label>
                  <p className="text-sm text-muted-foreground">Outros usuários podem ver seu telefone</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Notificações</CardTitle>
              </div>
              <CardDescription>Configure suas notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Novas escalas</Label>
                  <p className="text-sm text-muted-foreground">Receber notificação de novas escalas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lembretes de escala</Label>
                  <p className="text-sm text-muted-foreground">Lembrete antes do início da escala</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Atualizações de pagamento</Label>
                  <p className="text-sm text-muted-foreground">Notificar sobre pagamentos</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Segurança</CardTitle>
              </div>
              <CardDescription>Configurações de segurança da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação em dois fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sessão ativa única</Label>
                  <p className="text-sm text-muted-foreground">Permitir apenas uma sessão por vez</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Aparência</CardTitle>
              </div>
              <CardDescription>Personalize a interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo escuro</Label>
                  <p className="text-sm text-muted-foreground">Usar tema escuro no sistema</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Animações</Label>
                  <p className="text-sm text-muted-foreground">Ativar animações na interface</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sidebar compacta</Label>
                  <p className="text-sm text-muted-foreground">Manter sidebar sempre minimizada</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Data Settings */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Dados</CardTitle>
              </div>
              <CardDescription>Gerencie seus dados do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button variant="outline" className="flex-1">
                  Exportar meus dados
                </Button>
                <Button variant="outline" className="flex-1">
                  Limpar cache local
                </Button>
                <Button variant="destructive" className="flex-1">
                  Excluir minha conta
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
}
