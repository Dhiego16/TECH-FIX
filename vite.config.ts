import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Em dev, o Vite não serve a pasta /api (isso é coisa da Vercel).
 * Este plugin faz o `npm run dev` funcionar chamando o mesmo handler da produção.
 */
function devApi(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/consulta', async (req, res) => {
        Object.assign(process.env, env);
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const body = Buffer.concat(chunks);
        const mod = await server.ssrLoadModule('/api/consulta.ts');
        const request = new Request('http://localhost/api/consulta', {
          method: req.method,
          headers: { 'content-type': 'application/json' },
          body: req.method === 'POST' ? body : undefined,
        });
        const handler = (mod as any)[req.method ?? 'GET'];
        const response: Response = handler
          ? await handler(request)
          : new Response('Method Not Allowed', { status: 405 });
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), devApi(env)],
  };
});
