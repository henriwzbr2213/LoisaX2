# LoisaX2 FeatherPanel Integration

Backend TypeScript modular + frontend robusto em **React/TSX** (sem páginas de UI escritas manualmente em HTML).

## Recursos implementados

- Service layer em TypeScript para API application/client do FeatherPanel.
- Criação de usuários e provisionamento de servidores.
- Controle de energia (start/stop/restart).
- Console websocket em tempo real.
- Separação de painéis: `/admin` e `/client`.
- Validação de ownership para operações de cliente.
- Retry exponencial + tratamento estruturado de erro/rate limit.
- Frontend robusto em TSX (`frontend/src`) com rotas:
  - `/login`
  - `/register`
  - `/panel`
  - `/console/:identifier`
- Regra de acesso: **primeiro cadastro = admin**, demais = client.

## Fluxo de uso rápido

1. Suba o backend (`npm run dev` no root).
2. Suba o frontend TSX (`cd frontend && npm install && npm run dev`).
3. Faça cadastro/login.
4. No painel, clique em servidor para abrir console realtime via websocket FeatherPanel.

## Endpoints de Auth

- `POST /auth/register`
- `POST /auth/login`

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
