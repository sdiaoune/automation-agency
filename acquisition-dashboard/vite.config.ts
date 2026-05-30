import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type ApiHandler = (request: unknown, response: unknown) => Promise<void> | void

function socialPostApiPlugin(): Plugin {
  return {
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      Object.assign(process.env, env)

      server.middlewares.use(async (request, response, next) => {
        if (request.url?.startsWith('/api/social-post')) {
          const modulePath = new URL('./api/social-post.js', import.meta.url).href
          const { default: handler } = (await import(modulePath)) as {
            default: ApiHandler
          }
          await handler(request, response)
          return
        }

        if (request.url?.startsWith('/api/meta/')) {
          const modulePath = new URL('./api/meta-auth.js', import.meta.url).href
          const { default: handler } = (await import(modulePath)) as {
            default: ApiHandler
          }
          await handler(request, response)
          return
        }

        if (
          request.url?.startsWith('/api/x/') ||
          request.url?.startsWith('/auth/callback')
        ) {
          const modulePath = new URL('./api/x-auth.js', import.meta.url).href
          const { default: handler } = (await import(modulePath)) as {
            default: ApiHandler
          }
          await handler(request, response)
          return
        }

        next()
      })
    },
    name: 'social-post-api',
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), socialPostApiPlugin()],
  server: {
    port: 9876,
  },
})
