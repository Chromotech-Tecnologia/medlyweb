

# Plano: Geolocalização, Check-in/out, Escalas Avançadas e Regras de Negócio

Este plano aborda as funcionalidades listadas no backlog. Algumas já existem parcialmente (geolocalização, bloqueio de print) e precisam ser conectadas/aprimoradas.

---

## 1. Check-in com Validação de Geolocalização

**O que existe:** Hook `useGeolocation` com cálculo de distância e raio, mock de coordenadas, verificação periódica. Botão "Fazer Check-in" na Área do Médico (sem lógica real).

**O que fazer:**
- Criar componente `CheckInOut` reutilizável que:
  - Usa `useGeolocation` para obter posição atual
  - Compara com coordenadas do local da escala (já existem em `Location.coordinates`)
  - Valida raio de 100m (configurável) usando `isWithinRadius`
  - Exibe mapa visual simples (sem Google Maps por enquanto - usar representação visual com distância)
  - Grava `checkIn` na escala via storage (campo já existe em `Scale.checkIn`)
- Integrar na `DoctorArea > ScaleDetail` substituindo o botão estático

## 2. Checkout com Formulário

**O que fazer:**
- Após check-in realizado, botão muda para "Fazer Check-out"
- Check-out valida geolocalização (mesmo raio)
- Formulário de checkout: número de pacientes atendidos, avaliação do local (1-5 estrelas), observações
- Grava `checkOut` na escala e cria `Rating` no storage
- Schema `checkoutSchema` já existe em `validations.ts`

## 3. Verificação Periódica de Geolocalização

**O que existe:** Hook `usePeriodicGeolocation` já implementado com intervalo configurável.

**O que fazer:**
- Ativar verificação periódica (5 min) quando médico faz check-in
- Exibir indicador visual de status (última verificação, se está dentro do raio)
- Registrar log de verificações no storage
- Quando fora do raio, marcar período como "não validado" (Estratégia 1)

## 4. Desistência e Repasse de Plantão

**O que fazer no `DoctorArea`:**
- Adicionar botões "Desistir" e "Repassar" nas escalas confirmadas
- Regras de desistência:
  - Se antes do prazo (`cancellationDeadlineDays`): sem penalidade
  - Se após prazo: multa de 50% do valor (`paymentValue * 0.5`)
  - Exibir aviso claro com valor da multa antes de confirmar
- Repasse:
  - Antes do prazo (`transferDeadlineDays`): permitido
  - Escala volta ao status "publicada" para novos candidatos

## 5. Validação de Sobreposição de Escalas

**O que fazer em `Scales.tsx`:**
- Ao criar/editar escala, verificar se já existe escala no mesmo local + mesma especialidade + mesmo horário
- Exibir aviso (não bloqueio) para o escalista
- Para médicos candidatando-se: verificar se já tem escala no mesmo horário/data
- Função utilitária `checkScaleOverlap(scales, newScale)` que retorna conflitos

## 6. Filtros Avançados nas Escalas

**O que fazer em `Scales.tsx`:**
- Adicionar filtros por: local, especialidade, turno, faixa de data, faixa de valor
- Aplicar filtros tanto na view lista quanto calendário
- Painel de filtros em `Collapsible` ou `Popover`

## 7. Integração Google Maps (Preparação)

**O que fazer:**
- Na `ScaleDetail` (Área do Médico), botão "Mapa" abre link externo Google Maps com coordenadas do local
- No check-in, exibir distância calculada até o local
- Preparar para futura integração com embed do Google Maps (requer API key)

## 8. Bloqueio de Print (já existe)

Conforme memória do projeto, já foi implementada proteção global contra screenshots via overlay em eventos de print. Sem alterações necessárias.

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `src/components/doctor/CheckInOut.tsx` | **Criar** - Componente de check-in/checkout com geolocalização |
| `src/components/doctor/ScaleActions.tsx` | **Criar** - Desistência e repasse de plantão |
| `src/lib/scaleUtils.ts` | **Criar** - Funções de sobreposição e validações de escala |
| `src/pages/DoctorArea.tsx` | **Modificar** - Integrar check-in/out, desistência, repasse, verificação periódica |
| `src/pages/Scales.tsx` | **Modificar** - Filtros avançados + validação de sobreposição no formulário |
| `src/lib/mocks/storage.ts` | **Modificar** - Funções para gravar check-in/out e logs de verificação |

---

## Itens pendentes de confirmação do cliente

- **Sobreposição de escalas**: O plano implementa como aviso (warning) para o escalista, não como bloqueio. Se o cliente definir regras diferentes, ajustamos depois.
- **Google Maps embed**: Requer API key. Por agora, usaremos link externo para navegação.

