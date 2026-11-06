# TechFix Assist

Assistente de compatibilidade de peças para técnicos de manutenção de celulares e tablets.
React + Vite + Tailwind. **100% front-end**: cada usuário usa a própria chave do Gemini,
salva só no navegador dele. Não há backend.

## Rodar localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

Abra o app, clique na engrenagem e cole sua chave
(grátis em https://aistudio.google.com/apikey).

## Deploy no GitHub Pages

O workflow `.github/workflows/deploy.yml` faz build e publica a cada push na `main`.

Só uma vez: no repositório, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

O site fica em `https://<usuario>.github.io/TECH-FIX/`.

## Segurança da chave

- A chave nunca vai para o código nem para o repositório.
- Para reduzir risco, no Google AI Studio/Cloud restrinja a chave por **HTTP referrer**
  ao domínio do site (`https://<usuario>.github.io/*`).
- Em computador compartilhado, use "Remover chave" ao terminar.
