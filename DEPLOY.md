# Deploy Mindrabar

## O que mudou

- `FrontComanda/src/api/endpoints.ts` → agora lê `VITE_API_URL` do .env, com fallback pro domínio antigo.
- `FrontComanda/Dockerfile` → aceita `ARG VITE_API_URL` no build.
- `FrontComanda/nginx.conf` → removido o `location /api/` (não precisa mais fazer proxy).
- `docker-compose.yml` (novo) → orquestra back + front, apontando o back pro Postgres/RabbitMQ de um servidor remoto de terceiros via env vars.

## Antes de subir: testar conectividade do banco

Da VPS de deploy, confirma que o Postgres/RabbitMQ do servidor remoto estão acessíveis:

```bash
timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/5432" && echo "Postgres OK" || echo "Postgres BLOQUEADO"
timeout 5 bash -c "echo > /dev/tcp/$DB_HOST/5672" && echo "RabbitMQ OK" || echo "RabbitMQ BLOQUEADO"
```

- **Se OS DOIS derem OK** → segue o plano abaixo. Dados do cliente preservados.
- **Se algum der BLOQUEADO** → precisa pedir para o responsável pelo servidor remoto liberar essas portas no firewall pro IP da VPS de deploy. Alternativa: subir Postgres + RabbitMQ na própria VPS também (mas o cliente perde os dados existentes).

## Deploy

### 1. Copiar os arquivos pra VPS

```bash
scp -r /caminho/pra/mindrabar-deploy usuario@host:~/
```

Ou clona os repos direto na VPS e substitui os arquivos alterados.

### 2. Subir os containers

```bash
cd ~/mindrabar-deploy
docker compose build
docker compose up -d
docker compose logs -f mindrabar-api
```

Espera aparecer algo tipo `Started MindrabarApiApplication in X.XXX seconds`. Se der erro de Flyway ou de conexão com o banco, a mensagem vai estar aqui.

### 3. Testar localmente

```bash
# back respondendo?
curl -v http://127.0.0.1:8002/
# front servindo?
curl -v http://127.0.0.1:8003/
```

O back vai dar provavelmente 401/403 na raiz (Spring Security), o que é sinal de vida. O front deve devolver HTML.

### 4. Exposição pública (túnel / proxy reverso)

Publicação via túnel (Cloudflare Tunnel ou similar), roteando dois hostnames para os serviços locais:

```yaml
ingress:
  - hostname: mindrabar.<seu-dominio>
    service: http://localhost:8003
  - hostname: api-mindrabar.<seu-dominio>
    service: http://localhost:8002
  # ... outras rotas ...
  - service: http_status:404
```

Adiciona os CNAMEs no DNS apontando pro túnel, e reinicia o serviço do túnel.

### 5. Testar do lado do cliente

```bash
curl -v https://api-mindrabar.<seu-dominio>/
curl -v https://mindrabar.<seu-dominio>/
```

Se a API responder e o front carregar, manda o link pro cliente.

## Credenciais de teste

Um usuário de teste é fornecido separadamente (fora deste repositório) para validar o fluxo de login antes da entrega.

## CORS — se falhar login/chamadas de API

O Spring provavelmente está configurado pra aceitar só o domínio de produção do front. Se o browser bloquear com erro de CORS ao chamar a API a partir do front, tem duas saídas:

1. **Servir tudo pelo mesmo domínio** — troca o nginx do front pra fazer proxy `/api/` pro back local (mesma origem, sem CORS). Reintroduz aquele `location /api/` que foi removido, mas apontando pra `http://mindrabar-api:8002/`.

2. **Ajustar o CORS no back** — requer mexer no código Java (procurar `CorsConfiguration` ou `@CrossOrigin` no repo), rebuildar. Mais trabalho.

Começa testando sem mexer.

## Rollback

```bash
docker compose down
```

Sem efeitos colaterais no servidor remoto (o deploy só lê o banco de lá).
