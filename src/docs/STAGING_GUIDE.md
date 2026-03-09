# Guia de Homologação — Medly

## Objetivo
Validar todas as funcionalidades da plataforma em ambiente de staging antes do go-live.

## Ambiente
- **URL**: https://medlyweb.lovable.app
- **Credenciais de teste**:
  - Admin: `admin@medly.com` (qualquer senha)
  - Gestor: `gestor@medly.com`
  - Escalista: `escalista@medly.com`
  - Médico: `medico@medly.com`

## Checklist de Testes

### 1. Autenticação
- [ ] Login com cada perfil
- [ ] Logout
- [ ] Tela de recuperação de senha
- [ ] Cadastro de novo médico

### 2. Dashboard
- [ ] Dashboard Admin: 6 cards, 3 gráficos, 2 tabelas
- [ ] Dashboard Gestor: 4 cards, 5 gráficos, 2 tabelas
- [ ] Dados exibidos corretamente

### 3. Usuários (CRUD)
- [ ] Listar, buscar, filtrar
- [ ] Criar novo usuário
- [ ] Editar usuário existente
- [ ] Ativar/desativar
- [ ] Excluir (soft delete)

### 4. Escalas
- [ ] Criar escala com validação de sobreposição
- [ ] Publicar escala
- [ ] Visualizar calendário e lista
- [ ] Filtros avançados

### 5. Documentos
- [ ] Upload de documento (drag & drop)
- [ ] Aprovação/rejeição (admin)
- [ ] Visualização por médico

### 6. Pagamentos
- [ ] Criar pagamento
- [ ] Marcar como pago
- [ ] Confirmação pelo médico
- [ ] Filtro por perfil

### 7. Avaliações
- [ ] Avaliação do profissional
- [ ] Avaliação do local

### 8. Exportação
- [ ] Exportar CSV de cada tabela
- [ ] Verificar encoding (acentos)

### 9. Auditoria
- [ ] Visualizar logs
- [ ] Filtros funcionando
- [ ] Expandir detalhes
- [ ] Exportar CSV

### 10. Responsividade
- [ ] Todas as telas em mobile (375px)
- [ ] Todas as telas em tablet (768px)
- [ ] Menu lateral mobile funcional

## Como Reportar Bugs
1. Descreva o passo-a-passo para reproduzir
2. Informe o perfil utilizado (admin, gestor, etc.)
3. Anexe screenshot ou gravação de tela
4. Classifique: **Crítico**, **Alto**, **Médio**, **Baixo**
