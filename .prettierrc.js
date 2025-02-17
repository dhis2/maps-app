const { config } = require('@dhis2/cli-style')

module.exports = {
    ...require(config.prettier),
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 2,
            },
        },
    ],
}
