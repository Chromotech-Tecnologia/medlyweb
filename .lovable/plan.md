

# 🏥 Medly Web - Plano de Implementação

## Visão Geral
Plataforma central de gerenciamento de escalas médicas com design moderno verde médico, glassmorphism e UX intuitiva. MVP funcional com dados mockados, preparado para migração futura para Supabase.

---

## Fase 1: Fundação e Sistema de Design
**Objetivo:** Criar a base visual e estrutural da aplicação

### Design System
- **Tema verde médico** (#A8E6CF primário, degradês para #E0F7FA)
- Glassmorphism com `backdrop-filter: blur(10px)` e transparências
- Bordas arredondadas (12px), sombras suaves, efeito glow 3D
- Componentes base: Botões, Inputs, Cards, Modais, Toasts
- Animações com Framer Motion (fade-in, slide-up, hover scale)
- Ícones animados Lordicon (heartbeat, location-pin)

### Layout Principal
- **Header fixo** com logo "Medly" animado, user menu, notificações
- **Sidebar colapsável** com navegação por ícones animados
- **Grid responsivo** mobile-first (stack < 768px)
- Suporte a dark mode

### Infraestrutura de Dados
- Estrutura de mocks em `/lib/mocks` com JSON inicial
- Persistência via localStorage com soft delete (`deletedAt`)
- Utilitários para simular latência de API
- Sistema de logs de auditoria local

---

## Fase 2: Autenticação e Usuários
**Objetivo:** Sistema completo de login e gestão de identidade

### Telas de Autenticação
- **Login** com email/senha e botão Google OAuth (mock)
- **Registro** com campos: nome, email, telefone, CPF, senha
- Integração **ViaCEP** para auto-preenchimento de endereço
- **Esqueci senha** com modal e toast de confirmação
- Validação completa com React Hook Form + Zod

### Sistema de Perfis e Roles
- **4 tipos:** Admin, Gestor, Escalista, Médico
- CRUD de perfis com permissões granulares por módulo
- Checkbox tree para permissões (ver/editar/criar/excluir)
- HOC `withAuth` para proteção de rotas

### Gestão de Usuários
- CRUD completo com filtros e busca
- Campos condicionais: CRM e especialidades (se Médico)
- Hierarquia de gestão com tree view (React Arborist)
- Cards de perfil com foto, status, métricas

---

## Fase 3: Cadastros Base
**Objetivo:** CRUDs de entidades fundamentais

### Locais
- Nome, endereço (ViaCEP), tipo (UPA, UBS, Hospital, etc.)
- Coordenadas geográficas (manual ou auto via Geolocation API)
- Mapa embed com Leaflet.js

### Tipos de Escala
- Nome e descrição
- Configurações padrão (duração, turno)

### Especialidades Médicas
- Nome e descrição
- Vinculação a tipos de escala

---

## Fase 4: Sistema de Escalas (Core)
**Objetivo:** Fluxo completo de criação e gestão de escalas

### CRUD de Escalas
- **Formulário stepper** progressivo:
  1. Local e tipo
  2. Especialidade requerida
  3. Data, horário, turno
  4. Regras de desistência/repasse (dias limite)
  5. Pagamento (valor, data prevista)
  6. Pacientes (min/max) e intervalo refeição
  7. Documentos requeridos

### Visualizações
- **Calendário** com FullCalendar (visão mensal/semanal)
- **Tabela** com filtros avançados (local, especialidade, data, turno)
- Status visual: Rascunho, Publicada, Em andamento, Concluída

### Fluxo de Candidatura (Médico)
- Botões: "Tenho Interesse" / "Não tenho Interesse"
- Lista de escalas disponíveis com match de especialidade
- Histórico de candidaturas

### Gestão de Candidatos (Escalista/Gestor)
- Lista de candidatos por escala
- Ações: Aceitar, Negar, Aguardar
- Stepper pós-aceite: Infos → Aceite Empresa → Docs → Validação → Aprovado → NF

### Validações Inteligentes
- Alerta de sobreposição horário/local
- Bloqueio configurável por regras

---

## Fase 5: Geolocalização e Check-in/out
**Objetivo:** Controle de presença com localização

### Geolocalização
- Hook custom `useGeolocation` com Geolocation API
- Fallback para coordenadas mock com slider simulador
- Mapa interativo mostrando posição vs local da escala

### Check-in
- Botão na escala ativa
- Validação de raio (100m do local)
- Registro de timestamp e coordenadas

### Checkout
- Formulário: pacientes atendidos, avaliação (1-5), observações
- Cálculo de horas trabalhadas
- Bloqueio se fora do raio permitido

### Verificação Periódica
- Interval hook (5min) durante escala ativa
- Toast de confirmação ou alerta
- Log de verificações

---

## Fase 6: Avaliações e Pagamentos
**Objetivo:** Métricas de qualidade e gestão financeira

### Avaliações
- **Profissional avalia Local:** estrelas + campos específicos
- **Local avalia Profissional:** pontualidade, qualidade, etc.
- Cálculo de média agregada
- Impacto de desistências na nota (% drop)

### Gestão de Pagamentos
- Tabela de escalas com status (Pendente/Pago)
- Formulário de baixa: data, observação, upload comprovante
- Lembretes automáticos (mock com setTimeout)
- Modal de confirmação de recebimento

---

## Fase 7: Documentos e Validações
**Objetivo:** Gestão de documentação e aprovações

### Upload de Documentos
- Drag-drop zone (react-dropzone)
- Metadados: nome, categoria, validade
- Lista por usuário com preview

### Validação CRM
- Input com consulta API mock
- Retorno: válido/inválido, status (Ativo/Inativo)
- Indicador visual no perfil do médico

### Fluxo de Aprovação
- Tabela Admin com documentos pendentes
- Botões: Aprovar / Rejeitar
- Status visível para Escalista/Médico

---

## Fase 8: Dashboards Personalizados
**Objetivo:** Visões analíticas por role

### Dashboard Admin
- **4 Cards KPI:** Total usuários, escalas ativas, pendências, taxa ocupação
- **Gráficos Recharts:**
  - Pie: Usuários por perfil
  - Line: Escalas por mês (tendência)
  - Bar: Notas médias por local
- **Tabelas:** Ações recentes, Alertas ativos

### Dashboard Gestor/Escalista
- Métricas filtradas por área de gestão
- Escalas da equipe
- Pendências de aprovação

### Dashboard Médico
- Próximas escalas
- Histórico de avaliações
- Ganhos do período

---

## Fase 9: Funcionalidades Complementares
**Objetivo:** Features de suporte e segurança

### Exportação de Dados
- Menu dropdown em tabelas
- Export CSV/JSON (papaparse)
- Filtros aplicados na exportação

### Auditoria de Sistema
- Log automático de todas ações
- Tabela filtrável: quem, o quê, quando
- Persistência em localStorage

### Segurança
- Bloqueio de screenshot (overlay no print event)
- Session timeout com aviso

### Suporte e Treinamento
- Página `/ajuda` com vídeos placeholder
- Chat widget mock
- Tooltips de onboarding

---

## Fase 10: Qualidade e Deploy
**Objetivo:** Preparar para produção

### Responsividade
- Teste em todos breakpoints Tailwind
- Navegação mobile otimizada
- Touch-friendly em ações principais

### Testes
- Jest + React Testing Library (unitários)
- Ambiente `/test-env` com dados sample
- Cypress para E2E (opcional)

### Monitoramento
- Integração Sentry mock para erros
- Console logs estruturados

---

## Resultado Final
Uma aplicação web moderna, visualmente impactante e totalmente funcional com:
- ✅ 4 tipos de usuário com permissões granulares
- ✅ Sistema completo de escalas médicas
- ✅ Geolocalização e check-in/out
- ✅ Avaliações bidirecionais
- ✅ Gestão de documentos e pagamentos
- ✅ Dashboards analíticos por role
- ✅ Design responsivo mobile-first
- ✅ Arquitetura pronta para migração Supabase

