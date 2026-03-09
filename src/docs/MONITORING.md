# Guia de Monitoramento — Medly

## Ferramentas Recomendadas

### 1. Performance e Erros
- **Sentry** (https://sentry.io): Captura de erros em tempo real
  - Instalar `@sentry/react`
  - Configurar DSN no env
  - Captura automática de exceções JS

### 2. Uptime e Disponibilidade
- **UptimeRobot** (https://uptimerobot.com): Monitoramento gratuito
  - Configurar check a cada 5 min na URL de produção
  - Alertas via email/Slack/Telegram
  - Dashboard público opcional

### 3. Analytics
- **Vercel Analytics** (nativo): Métricas de performance (Web Vitals)
  - Core Web Vitals: LCP, FID, CLS
  - Ativação automática no deploy Vercel

### 4. Logs de Aplicação
- O sistema já possui auditoria interna (`/auditoria`)
- Logs são persistidos em localStorage (mock)
- Em produção, migrar para banco de dados via Lovable Cloud

## Métricas-Chave (KPIs)
| Métrica | Meta | Ferramenta |
|---------|------|------------|
| Uptime | > 99.5% | UptimeRobot |
| LCP | < 2.5s | Vercel Analytics |
| Taxa de Erro JS | < 0.1% | Sentry |
| Tempo de Resposta API | < 500ms | Sentry Performance |

## Alertas Recomendados
- Site fora do ar > 1 min
- Taxa de erro > 1% em 5 min
- LCP > 4s em 10% dos requests
