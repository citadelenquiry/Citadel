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

      server.middlewares.use('/api/sheets/test', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { webhookUrl } = JSON.parse(body || '{}');
              const targetUrl =
                webhookUrl ||
                process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
                'https://script.google.com/macros/s/AKfycbz8cRvGuCHxi6sr-T0S3laRAwM7jmuNbvv303AtC5YwmFOYBiNVOTeYbw8HateV8tzdoA/exec';

              const gRes = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                  formType: 'Admin Diagnostic Probe',
                  name: 'Citadel Operations Test',
                  phone: '+91 87799 75270',
                  email: 'test@thecitadelgroup.co',
                  projectOrRole: 'Connectivity Diagnostics',
                  details: 'Testing Google Apps Script authorization',
                  message: 'Automated diagnostic check from Citadel server',
                }),
                redirect: 'follow',
              });

              const text = await gRes.text();
              res.setHeader('Content-Type', 'application/json');

              if (
                gRes.status === 401 ||
                text.includes('accounts.google.com') ||
                text.includes('Page not found') ||
                text.includes('Sorry, unable to open the file at present')
              ) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: false,
                    statusCode: 401,
                    error:
                      "Google Apps Script returned HTTP 401 Unauthorized ('Sorry, unable to open the file at present'). In Google Apps Script, click Deploy > Manage deployments > Edit > ensure 'Execute as: Me' and 'Who has access: Anyone'.",
                  })
                );
                return;
              }

              if (gRes.ok || text.includes('success') || text.includes('Row added')) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    statusCode: gRes.status,
                    message: 'Connected successfully to Google Sheet! Row appended.',
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  statusCode: gRes.status,
                  error: `Google Apps Script returned HTTP ${gRes.status}: ${text.slice(0, 160)}`,
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Network error reaching Google Apps Script',
                })
              );
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      server.middlewares.use('/api/lead/submit', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const targetUrl =
                payload.webhookUrl ||
                process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
                'https://script.google.com/macros/s/AKfycbz8cRvGuCHxi6sr-T0S3laRAwM7jmuNbvv303AtC5YwmFOYBiNVOTeYbw8HateV8tzdoA/exec';

              const gRes = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                  formType: payload.formType || 'General Enquiry',
                  name: payload.name || '',
                  phone: payload.phone || '',
                  email: payload.email || '',
                  projectOrRole: payload.projectOrRole || '',
                  details: payload.details || '',
                  message: payload.message || '',
                }),
                redirect: 'follow',
              });

              const text = await gRes.text();
              res.setHeader('Content-Type', 'application/json');

              if (
                gRes.status === 401 ||
                text.includes('accounts.google.com') ||
                text.includes('Page not found') ||
                text.includes('Sorry, unable to open the file at present')
              ) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: false,
                    statusCode: 401,
                    error:
                      "Google Apps Script returned HTTP 401 Unauthorized ('Sorry, unable to open the file at present'). In Google Apps Script, click Deploy > Manage deployments > Edit > set 'Who has access: Anyone'.",
                  })
                );
                return;
              }

              if (gRes.ok || text.includes('success') || text.includes('Row added')) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    statusCode: gRes.status,
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  statusCode: gRes.status,
                  error: `Google Apps Script returned HTTP ${gRes.status}`,
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Network error reaching Google Apps Script',
                })
              );
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

function getBaseUrl(): string {
  // 1. If explicit VITE_BASE_PATH is provided and non-empty
  if (process.env.VITE_BASE_PATH && process.env.VITE_BASE_PATH.trim() !== '') {
    const custom = process.env.VITE_BASE_PATH.trim();
    // If VITE_BASE_PATH is '/' but running in GitHub Actions on a project repo, prefer repo subpath
    if (custom === '/' && process.env.GITHUB_REPOSITORY) {
      const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
      if (repo && !repo.toLowerCase().endsWith('.github.io')) {
        return `/${repo}/`;
      }
    }
    return custom.endsWith('/') ? custom : `${custom}/`;
  }

  // 2. If running inside GitHub Actions, automatically resolve repo subpath (e.g. /Citadel/)
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo && !repo.toLowerCase().endsWith('.github.io')) {
      return `/${repo}/`;
    }
    return '/';
  }

  // 3. Fallback for AI Studio preview and local dev
  return './';
}

export default defineConfig(() => {
  return {
    base: getBaseUrl(),
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
