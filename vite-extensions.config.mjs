import fs from 'node:fs/promises'
import path from 'node:path'

const HOST_PAGE_ROUTE = '/plugin-host.html'
const HOST_PAGE_DIR = 'src/pluginHost'

// Dev-only /plugin-host.html (src/pluginHost). It is outside Vite's root
// (.d2/shell), so it is served by hand, and it is never built.
const servePluginHost = () => ({
    name: 'maps:serve-plugin-host',
    apply: 'serve',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            const [pathname] = (req.url ?? '').split('?')

            if (pathname !== HOST_PAGE_ROUTE) {
                next()
                return
            }

            const shellPath = path.resolve(HOST_PAGE_DIR, 'index.html')
            const entryPath = path.resolve(HOST_PAGE_DIR, 'main.jsx')

            fs.readFile(shellPath, 'utf8')
                .then((shell) =>
                    server.transformIndexHtml(
                        HOST_PAGE_ROUTE,
                        shell.replace('__ENTRY_MODULE__', `/@fs${entryPath}`)
                    )
                )
                .then((html) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'text/html')
                    res.end(html)
                })
                .catch(next)
        })
    },
})

export default {
    plugins: [servePluginHost()],
    optimizeDeps: {
        // Excluded so Vite serves maps-gl via /@fs/... with its full
        // transform pipeline, which lets the EE worker URL resolve to the
        // actual source file (rather than /.vite/earthengine/... where
        // bare imports are not rewritten).
        exclude: ['@dhis2/maps-gl'],
        // maps-gl's CJS deps must be listed explicitly; Vite's scanner
        // won't traverse an excluded package to discover them.
        include: [
            'maplibre-gl',
            'fetch-jsonp',
            'lodash.throttle',
            '@mapbox/sphericalmercator',
            '@turf/area',
            '@turf/bbox',
            '@turf/buffer',
            '@turf/center-of-mass',
            '@turf/centroid',
            '@turf/circle',
            '@turf/jsts',
            '@turf/length',
            'comlink',
            'concaveman',
            'polylabel',
            'pretty-bytes',
            'suggestions',
            'uuid',
        ],
        esbuildOptions: {
            target: 'es2022',
        },
    },
    build: {
        target: 'es2022',
        rollupOptions: {
            output: {
                manualChunks: {
                    'maps-gl': ['@dhis2/maps-gl'],
                },
            },
        },
    },
}
