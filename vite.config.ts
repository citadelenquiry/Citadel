import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function adminApiPlugin(): Plugin {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/admin/verify', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { password } = JSON.parse(body || '{}');
              const correctPassword = process.env.ADMIN_PASSWORD || '#site@Admin';
              res.setHeader('Content-Type', 'application/json');
              if (password === correctPassword) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, authorized: true }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, message: 'Invalid Admin Password' }));
              }
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'Bad request' }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || './',
    plugins: [react(), tailwindcss(), adminApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
