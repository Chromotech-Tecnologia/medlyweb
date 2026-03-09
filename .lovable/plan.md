

# Plano: Dashboards por Perfil, Fluxo de Aceite, Avaliações, Exportação e Auditoria

Este plano cobre todas as funcionalidades listadas no backlog.

---

## 1. Dashboard Admin (6 cards, 3 graficos, 2 tabelas)

**Modificar:** `src/components/dashboard/DashboardContent.tsx`

- Renomear para dashboard admin com role check
- **6 Cards:** Total Usuarios, Escalas Ativas, Pendencias, Taxa Ocupacao, Pagamentos Pendentes, Documentos Pendentes
- **3 Graficos:** PieChart usuarios por perfil, LineChart escalas/mes, BarChart notas por local (ja existem, manter)
- **2 Tabelas:** Tabela de ultimas escalas criadas + Tabela de pagamentos pendentes

## 2. Dashboard Gestor/Escalista (4 cards, 5 graficos, 2 tabelas)

**Criar:** `src/components/dashboard/DashboardGestor.tsx`

- **4 Cards:** Medicos Ativos, Escalas da Semana, Candidaturas Pendentes, Taxa Presenca
- **5 Graficos:** Escalas por status (Pie), Escalas por mes (Line), Medicos por especialidade (Bar), Check-ins por dia (Area), Avaliacoes media (Bar horizontal)
- **2 Tabelas:** Proximas escalas + Medicos com documentos pendentes

**Modificar:** `src/pages/Index.tsx` para renderizar dashboard correto por role

## 3. Tela Profissional (Medico) - Aprimorar DoctorArea

**Modificar:** `src/pages/DoctorArea.tsx` (tab "inicio")

- Cards resumo: Proximos plantoes, Horas do mes, Ganhos do mes, Avaliacao media
- Proximas escalas com status do workflow
- Historico de pagamentos recentes

## 4. Fluxo de Aceite de Vaga (6 etapas)

**Criar:** `src/components/doctor/WorkflowTracker.tsx`

Componente visual de stepper com 6 etapas:
1. Envio das Informacoes (medico envia candidatura)
2. Aceite da Empresa (escalista/gestor aprova)
3. Envio de Documentos Assinados (medico envia docs)
4. Validacao do Documento (admin valida)
5. Plantao Aprovado (confirmacao final)
6. Envio da NF pela empresa

**Modificar:** `src/pages/DoctorArea.tsx` - integrar tracker no detalhe da escala
**Modificar:** `src/pages/Scales.tsx` - permitir escalista avancar etapas do workflow

O tipo `Candidature.workflowStep` ja existe (1-6).

## 5. Pagamento com Baixa pelo Profissional

**Modificar:** `src/pages/Payments.tsx`

- Adicionar botao "Confirmar Recebimento" para medicos (usa `confirmedByDoctor` ja existente no tipo Payment)
- Badge visual de confirmacao do medico
- View diferenciada por role: medico ve apenas seus pagamentos

## 6. Avaliacao do Profissional

**Criar:** `src/components/ratings/DoctorRatingForm.tsx`

- Formulario com criterios: Pontualidade, Cordialidade, Qualidade Tecnica, Profissionalismo
- Escala 1-5 estrelas por criterio + comentario
- Rating type: `location_to_doctor`
- Acessivel pelo escalista/gestor apos conclusao da escala

## 7. Avaliacao do Local

**Criar:** `src/components/ratings/LocationRatingForm.tsx`

- Formulario com criterios: Limpeza, Sistema/Infraestrutura, Organizacao, Seguranca
- Escala 1-5 estrelas + comentario
- Rating type: `doctor_to_location`
- Integrado no checkout do medico (ja parcialmente existe em CheckInOut)

## 8. Exportacao de Dados

**Criar:** `src/components/export/ExportMenu.tsx`

- Menu dropdown com opcao de exportar cada tabela (usuarios, escalas, locais, pagamentos, documentos, avaliacoes, auditoria)
- Formato CSV
- Funcao utilitaria `exportToCsv(data, filename)` em `src/lib/exportUtils.ts`
- Botao de exportacao no header de cada pagina de listagem

## 9. Auditoria Completa do Sistema

**Criar:** `src/pages/AuditLog.tsx`

- Tabela com todos os logs de auditoria (ja persistidos via `logAudit`)
- Filtros: usuario, acao, entidade, periodo
- Detalhes expandiveis por registro
- Exportacao CSV

**Modificar:** `src/App.tsx` - adicionar rota `/auditoria`
**Modificar:** `src/components/layout/Sidebar.tsx` - adicionar link no menu

---

## Arquivos a criar/modificar

| Arquivo | Acao |
|---------|------|
| `src/components/dashboard/DashboardGestor.tsx` | **Criar** - Dashboard gestor/escalista |
| `src/components/dashboard/DashboardContent.tsx` | **Modificar** - Expandir para 6 cards + 2 tabelas |
| `src/components/doctor/WorkflowTracker.tsx` | **Criar** - Stepper 6 etapas |
| `src/components/ratings/DoctorRatingForm.tsx` | **Criar** - Avaliacao do profissional |
| `src/components/ratings/LocationRatingForm.tsx` | **Criar** - Avaliacao do local |
| `src/components/export/ExportMenu.tsx` | **Criar** - Menu exportacao |
| `src/lib/exportUtils.ts` | **Criar** - Utilitario CSV |
| `src/pages/AuditLog.tsx` | **Criar** - Tela auditoria completa |
| `src/pages/Index.tsx` | **Modificar** - Roteamento dashboard por role |
| `src/pages/DoctorArea.tsx` | **Modificar** - Integrar workflow tracker |
| `src/pages/Scales.tsx` | **Modificar** - Gestao workflow candidaturas |
| `src/pages/Payments.tsx` | **Modificar** - Confirmacao pelo medico |
| `src/App.tsx` | **Modificar** - Rota auditoria |
| `src/components/layout/Sidebar.tsx` | **Modificar** - Link auditoria |

