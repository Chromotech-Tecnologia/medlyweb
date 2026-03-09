

# Plano: Mobile Responsivo + Testes Automatizados

Este plano cobre as duas funcionalidades implementáveis: adaptação responsiva e testes automatizados. Os itens "Testes com Cliente", "Treinamento/Suporte" e "Monitoramento" são operacionais (não código) e serão documentados como guias.

---

## 1. Mobile Responsivo - Adaptação Fina

O projeto já usa Tailwind com breakpoints e o hook `useIsMobile`. A adaptação fina envolve:

### Problemas a corrigir:
- **Tabelas (Users, Scales, Payments, AuditLog, Documents)**: Em mobile, tabelas com muitas colunas ficam ilegíveis. Converter para card-based layout em telas pequenas (`< md`).
- **Dashboards (DashboardContent, DashboardGestor)**: Grids de 3-4 colunas precisam colapsar para 1-2 colunas. Gráficos precisam de altura reduzida em mobile.
- **Formulários (Dialogs)**: Dialogs com muitos campos precisam de scroll e padding adequado em mobile.
- **Header**: Verificar que o menu mobile e notificações funcionam bem em telas pequenas.
- **Filtros avançados (Scales.tsx)**: Grid de filtros precisa colapsar para 1 coluna em mobile.

### Arquivos a modificar:

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Users.tsx` | Tabela → cards em mobile (`hidden md:table` + cards visíveis em `md:hidden`) |
| `src/pages/Scales.tsx` | Tabela → cards em mobile, filtros em 1 coluna |
| `src/pages/Payments.tsx` | Tabela → cards em mobile |
| `src/pages/Documents.tsx` | Tabela → cards em mobile |
| `src/pages/AuditLog.tsx` | Tabela → cards em mobile |
| `src/pages/Locations.tsx` | Tabela → cards em mobile |
| `src/components/dashboard/DashboardContent.tsx` | Grid responsivo: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` para cards, gráficos com altura adaptativa |
| `src/components/dashboard/DashboardGestor.tsx` | Mesmo tratamento de grid responsivo |
| `src/components/layout/Header.tsx` | Ajustar espaçamento e ícones para mobile |
| `src/index.css` | Adicionar utilitários de scroll horizontal para tabelas que precisam manter formato |

### Padrão de implementação:
Para cada página com tabela, usar o padrão:
```
{/* Desktop table */}
<div className="hidden md:block"><Table>...</Table></div>
{/* Mobile cards */}
<div className="md:hidden space-y-3">{items.map(item => <Card>...</Card>)}</div>
```

---

## 2. Testes Automatizados

O setup de testes já existe (vitest, jsdom, testing-library). Criar testes unitários e de integração para os principais módulos.

### Testes a criar:

| Arquivo de teste | O que testa |
|-----------------|-------------|
| `src/lib/scaleUtils.test.ts` | `checkScaleOverlap`, `formatDistance`, `getGoogleMapsUrl` |
| `src/lib/exportUtils.test.ts` | `exportToCsv` geração de CSV |
| `src/lib/validations.test.ts` | Schemas zod (scaleSchema, userSchema, paymentSchema) |
| `src/lib/mocks/storage.test.ts` | CRUD operations (getAll, create, update, softDelete) |
| `src/hooks/useAuth.test.tsx` | Login, logout, role switching |
| `src/components/dashboard/StatsCard.test.tsx` | Renderização com props |
| `src/components/doctor/WorkflowTracker.test.tsx` | Steps rendering, step states |
| `src/components/doctor/CheckInOut.test.tsx` | Renderiza check-in/out states |

---

## 3. Documentação Operacional

**Criar:** `src/docs/STAGING_GUIDE.md` - Guia de homologação com cliente (checklist de testes, fluxos a validar, como reportar bugs).

**Criar:** `src/docs/MONITORING.md` - Recomendações de monitoramento (Vercel Analytics, Sentry para erros, UptimeRobot para disponibilidade).

---

## Resumo de arquivos

- **Modificar (responsivo):** 8 arquivos de páginas/componentes
- **Criar (testes):** 8 arquivos de teste
- **Criar (docs):** 2 arquivos markdown

