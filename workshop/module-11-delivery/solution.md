# Solução de referência — (Delivery)

A automação de deploy já está pronta no repositório.

## Como funciona

O workflow [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)
dispara quando o workflow `CI` conclui com sucesso em `main` (ou manualmente via
`workflow_dispatch`):

1. **Build do app** com `VITE_BASE=/${{ github.event.repository.name }}/app/` —
   garante que os assets apontem para o subcaminho correto do Pages.
2. **Montagem do `_site`:**
   - `docs/*` → raiz (site do workshop),
   - `dist/*` → `/app/` (app buildado),
   - `workshop/*` → `/workshop/` (markdown que o site renderiza).
3. **Publicação** via `actions/upload-pages-artifact` + `actions/deploy-pages`.

## O `base` configurável

Em [`vite.config.ts`](../../vite.config.ts):

```ts
base: process.env.VITE_BASE ?? '/',
```

- **Local/dev:** `base = '/'`.
- **Pages:** `base = '/<repo>/app/'` (injetado pelo workflow).

Sem isso, os assets seriam buscados na raiz do domínio e dariam 404.

## Validação local

`pnpm preview` não entrega os assets quando `VITE_BASE` tem subcaminho, então
monte o site como o workflow e sirva de forma estática:

```bash
VITE_BASE=/<repo>/app/ pnpm build
rm -rf /tmp/pages-sim && mkdir -p /tmp/pages-sim/<repo>/app
cp -r docs/. /tmp/pages-sim/<repo>/ && cp -r dist/. /tmp/pages-sim/<repo>/app/
cp -r workshop /tmp/pages-sim/<repo>/workshop
cd /tmp/pages-sim && python3 -m http.server 8080
```

Acesse `http://localhost:8080/<repo>/app/`. Os arquivos `.js` devem responder
com `text/javascript`, sem 404 no console.

## Configuração do repositório (uma vez)

- **Settings → Pages → Source: GitHub Actions.**
- Permissões já declaradas no workflow (`pages: write`, `id-token: write`).

## URLs finais

- Workshop: `https://<user>.github.io/<repo>/`
- App: `https://<user>.github.io/<repo>/app/`

Ciclo SDD completo: **Brief → Spec → Plan → Tasks → Code → Test → Review →
Ship**. Após o merge em `main` e a habilitação do Pages, o Weather App estará no
ar nas URLs acima.
