

## Plano: Simulação de API CRM, Área de Desenvolvedor e Configuração InfoSimples

O pedido envolve 4 entregas principais:

### 1. Simular API de Validação de CRM

Criar um serviço mock em `src/lib/mocks/crmApi.ts` que simule a consulta de CRM médico, retornando:
- Status do CRM (ativo, inativo, cancelado, suspenso)
- Nome do médico, UF, especialidades registradas
- Data de inscrição, situação
- Simular latência de rede (300-800ms)

Integrar essa validação no formulário de usuários (`Users.tsx`) quando o role for "medico" -- ao preencher CRM + UF, disparar a consulta mock e exibir o resultado (válido/inválido com detalhes).

### 2. Perfil Desenvolvedor (já existe parcialmente)

O usuário `developer@medly.com` (id '6') já existe nos mocks com role `developer` e permissões totais. Preciso:
- Garantir que o login funcione com credenciais fixas: `developer@medly.com` / `Medly@2026`
- Adicionar validação de senha no mock de login para esse usuário específico
- Ocultar o perfil developer da listagem para outros roles (já implementado parcialmente em `Users.tsx`)

**Credenciais do desenvolvedor:** `developer@medly.com` / `Medly@2026`

### 3. Menu/Página Exclusiva do Desenvolvedor

Criar uma nova página `src/pages/DevTools.tsx` acessível apenas pelo role `developer`:
- Adicionar item "Dev Tools" no Sidebar com ícone `Code` (lucide), visível apenas para developer
- A página conterá:
  - Painel de configuração de APIs (incluindo InfoSimples)
  - Logs de auditoria do sistema
  - Opção de resetar dados mock
  - Visualização de todas as entidades do storage

### 4. Configuração da API InfoSimples para Consulta de CRM

Dentro da página DevTools, criar uma seção "Integrações / APIs":
- Campo para configurar API Key da InfoSimples
- Campo para URL base da API
- Toggle para alternar entre modo mock e modo real (API InfoSimples)
- Salvar configurações no localStorage com prefixo `medly_`
- Quando modo real ativado, o serviço de CRM usará a API InfoSimples em vez do mock

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/mocks/crmApi.ts` | **Criar** - Serviço mock de validação CRM |
| `src/pages/DevTools.tsx` | **Criar** - Página exclusiva do desenvolvedor |
| `src/components/layout/Sidebar.tsx` | **Modificar** - Adicionar item DevTools visível só para developer |
| `src/hooks/useAuth.tsx` | **Modificar** - Validar senha do developer |
| `src/App.tsx` | **Modificar** - Adicionar rota `/dev-tools` |
| `src/pages/Users.tsx` | **Modificar** - Integrar validação CRM no formulário |

### Detalhes técnicos

- A senha será verificada apenas para o usuário developer (hardcoded no mock como hash simples). Os demais usuários continuam aceitando qualquer senha (mock).
- A configuração da API InfoSimples ficará em `localStorage` sob `medly_api_config`.
- O serviço CRM terá uma interface unificada que checa o modo (mock/real) e direciona para o handler correto.
- A API InfoSimples de consulta CRM usa endpoint `https://api.infosimples.com/api/v2/consultas/cfm/crm` com parâmetros `crm`, `uf` e `token`.

