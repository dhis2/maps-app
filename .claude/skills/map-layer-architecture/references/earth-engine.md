# Earth Engine layers

`src/constants/earthEngineLayers/*.js` declares Google Earth Engine dataset configs (heat, precipitation, vegetation, population, elevation, land cover, etc. — one file per dataset/period combination), aggregated via `src/constants/earthEngineLayers/index.js`.

## The Vite `optimizeDeps` workaround

`d2.config.js`'s `viteConfigExtensions.optimizeDeps.exclude: ['@dhis2/maps-gl']` exists so Vite serves `@dhis2/maps-gl` unbundled via `/@fs/...` with its full transform pipeline — this lets the Earth Engine worker's URL resolve to the actual source file rather than a `.vite/` cache path where bare imports aren't rewritten. Because `@dhis2/maps-gl` is excluded from the dep scanner, its CJS dependencies must be listed explicitly under `optimizeDeps.include` (maplibre-gl, turf packages, comlink, etc.) — if you add a new maps-gl dependency that needs bundling, it likely needs adding here too.

If you hit a dev-server error about the Earth Engine worker failing to load or resolve, check this config block before assuming the bug is in the worker code itself.
