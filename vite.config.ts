import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import handler from './api/hero-chat.js';
import widgetHandler from './api/widget-chat.js';
import widgetConfigHandler from './api/widget-config.js';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];
        if (
          pathname === '/api/hero-chat' ||
          pathname === '/api/widget-chat' ||
          pathname === '/api/widget-config'
        ) {
          const routeHandler =
            pathname === '/api/hero-chat'
              ? handler
              : pathname === '/api/widget-chat'
              ? widgetHandler
              : widgetConfigHandler;

          const parsedUrl = new URL(rawUrl, 'http://localhost:3000');
          const query = Object.fromEntries(parsedUrl.searchParams.entries());

          const executeHandler = async (body: any = {}) => {
            try {
              const customReq = {
                method: req.method,
                body,
                query,
                headers: req.headers,
              };
              const customRes = {
                setHeader: (key: string, val: any) => res.setHeader(key, val),
                status: (code: number) => {
                  res.statusCode = code;
                  return customRes;
                },
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: () => res.end(),
              };
              await routeHandler(customReq, customRes);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Server middleware error' }));
            }
          };

          if (req.method === 'GET' || req.method === 'OPTIONS') {
            await executeHandler({});
            return;
          }

          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            await executeHandler(body);
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
