const makeBabelConfig = require('@dhis2/cli-app-scripts/config/makeBabelConfig.js')

return makeBabelConfig(
    'es',
    process.env.BABEL_ENV || process.env.NODE_ENV || 'development'
)
