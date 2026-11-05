# TechFix Assist

Assistente de compatibilidade de peças para técnicos de manutenção de celulares e tablets.
React + Vite + Tailwind no front, função serverless (`/api/consulta`) chamando o Gemini.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # coloque sua GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

O `npm run dev` já serve `/api/consulta` (plugin no `vite.config.ts`).

## Deploy na Vercel

1. Suba o projeto no GitHub.
2. Na Vercel: **Add New → Project** → importe o repositório (preset **Vite** é detectado sozinho).
3. Em **Settings → Environment Variables**, adicione `GEMINI_API_KEY` (e, se quiser, `GEMINI_MODEL`).
4. **Deploy**. Qualquer `git push` na `main` redeploya automaticamente.

> A chave do Gemini fica só no servidor. Não use prefixo `VITE_` nela.
