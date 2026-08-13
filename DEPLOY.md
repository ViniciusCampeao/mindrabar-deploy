# Deploy Mindrabar na VPS pk

## O que mudou

- `FrontComanda/src/api/endpoints.ts` → agora l\u00ea `VITE_API_URL` do .env, com fallback pro dom\u00ednio antigo.
- `FrontComanda/Dockerfile` → aceita `ARG VITE_API_URL` no build.
- `FrontComanda/nginx.conf` → removido o `location /api/` (n\u00e3o precisa mais fazer proxy).
- `docker-compose.yml` (novo) → orquestra back + front, apontando o back pro Postgres/RabbitMQ de um servidor de terceiros via env vars.

## Antes de subir: testar conectividade do banco

Da sua VPS `vpspk`, confirma que o Postgres/RabbitMQ de um servidor de terceiros est\u00e3o acess\u00edveis:

```bash
ssh vinicius@vpspk
timeout 5 bash -c "echo > /dev/tcp/IP_DO_SERVIDOR_REMOTO/5432" && echo "Postgres OK" || echo "Postgres BLOQUEADO"
timeout 5 bash -c "echo > /dev/tcp/IP_DO_SERVIDOR_REMOTO/5672" && echo "RabbitMQ OK" || echo "RabbitMQ BLOQUEADO"
```

- **Se OS DOIS derem OK** → segue o plano abaixo. Dados do cliente preservados.
- **Se algum der BLOQUEADO** → precisa pedir para o responsável pelo servidor remoto liberar essas portas no firewall da Hostinger pro IP da sua VPS. Alternativa: subir Postgres + RabbitMQ na sua VPS tamb\u00e9m (mas cliente perde dados).

## Deploy

### 1. Copiar os arquivos pra VPS

Da sua m\u00e1quina local:

```bash
scp -r /caminho/pra/mindrabar-deploy vinicius@vpspk:~/
```

Ou clona os repos direto na VPS e substitui os arquivos alterados.

### 2. Subir os containers

```bash
ssh vinicius@vpspk
cd ~/mindrabar-deploy
docker compose build
docker compose up -d
docker compose logs -f mindrabar-api
```

Espera aparecer algo tipo `Started MindrabarApiApplication in X.XXX seconds`. Se der erro de Flyway ou de conex\u00e3o com o banco, a mensagem vai estar aqui.

### 3. Testar localmente

```bash
# back respondendo?
curl -v http://127.0.0.1:8002/
# front servindo?
curl -v http://127.0.0.1:8003/
```

O back vai dar provavelmente 401/403 na raiz (Spring Security), o que \u00e9 sinal de vida. O front deve devolver HTML.

### 4. Cloudflare Tunnel

Voc\u00ea j\u00e1 tem o tunnel `ID_DO_TUNNEL` rodando com dom\u00ednio `kernel-cloud.online`. Adiciona duas rotas no `config.yml` do cloudflared (ou pelo painel do Zero Trust):

```yaml
ingress:
  - hostname: mindrabar.kernel-cloud.online
    service: http://localhost:8003
  - hostname: api-mindrabar.kernel-cloud.online
    service: http://localhost:8002
  # ... suas outras rotas ...
  - service: http_status:404
```

E adiciona os CNAMEs no DNS da Cloudflare apontando pro tunnel (ou usa `cloudflared tunnel route dns`).

Restart do cloudflared:

```bash
sudo systemctl restart cloudflared
```

### 5. Testar do lado do cliente

```bash
curl -v https://api-mindrabar.kernel-cloud.online/
curl -v https://mindrabar.kernel-cloud.online/
```

Se a API responder e o front carregar, manda o link `https://mindrabar.kernel-cloud.online` pro cliente.

## Credenciais de teste

Foram fornecidas:
- Usu\u00e1rio: `test`
- Senha: `REDACTED`
- (havia menciona\u00e7\u00e3o de `REDACTED` tamb\u00e9m \u2014 se `REDACTED` falhar, tenta essa)

## CORS \u2014 se falhar login/chamadas de API

O Spring provavelmente est\u00e1 configurado pra aceitar s\u00f3 `https://menu.mindra.me`. Se o browser bloquear com erro de CORS ao chamar `api-mindrabar.kernel-cloud.online` a partir de `mindrabar.kernel-cloud.online`, tem duas sa\u00eddas:

1. **Servir tudo pelo mesmo dom\u00ednio** \u2014 troca o nginx do front pra fazer proxy `/api/` pro back local (mesma-origem, sem CORS). Reintroduz aquele `location /api/` que a gente removeu, mas apontando pra `http://mindrabar-api:8002/`.

2. **Ajustar o CORS no back** \u2014 requer mexer no c\u00f3digo Java (pesquisa `CorsConfiguration` ou `@CrossOrigin` no repo), rebuildar. Mais trabalho.

Come\u00e7a testando sem mexer. Se der CORS, me chama que ajusto.

## Rollback

```bash
docker compose down
```

Sem efeitos colaterais na VPS do responsável pelo servidor remoto (voc\u00ea s\u00f3 est\u00e1 lendo o banco dele).
