# LoisaX2 FeatherPanel Integration

Backend TypeScript modular para integração estilo Pterodactyl com FeatherPanel + frontend de operação.

## Recursos implementados

- Service layer em TypeScript para API application/client do FeatherPanel.
- Criação de usuários e provisionamento de servidores.
- Controle de energia (start/stop/restart).
- Obtenção de credenciais websocket de console em tempo real.
- Separação de painéis: `/admin` e `/client`.
- Validação de ownership para operações de cliente.
- Retry exponencial + tratamento estruturado de erro e rate limit.
- Frontend simples em `src/public/index.html` com login e ações admin/client.
- Auditoria e arquitetura preparada para produção (módulos, logs, validação, env).

## Fluxo de uso rápido

1. Acesse `GET /` para o frontend.
2. Faça login via UI (usa `POST /auth/login`).
3. Use os botões de Client/Admin panel sem precisar enviar `x-user-id` manualmente.

## Fluxo de provisionamento

1. Usuário compra plano (endpoint admin `/admin/provision`).
2. Backend cria usuário no FeatherPanel.
3. Backend cria servidor no FeatherPanel.
4. Backend salva entidade local (usuário/servidor).
5. Cliente acessa `/client/servers` e `/client/servers/:identifier/console`.
6. Admin acompanha tudo em `/admin/servers` e `/admin/audit`.

## Variáveis de ambiente

```bash
FEATHERPANEL_URL=https://panel.example.com
FEATHERPANEL_API_KEY=ptla_...
FEATHERPANEL_CLIENT_API_KEY=ptlc_...
PORT=3000
REQUEST_TIMEOUT_MS=10000
RETRY_ATTEMPTS=3
RETRY_BASE_DELAY_MS=250
```

## Desenvolvimento

```bash
npm install
npm run check
npm run build
npm run dev
```
