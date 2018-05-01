module.exports = {
  setupTestFrameworkScriptFile: '<rootDir>/config/setup.js',
  collectCoverageFrom: ['src/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!d2-ui).+\\.js$',
  ],
};


/*
module.exports = {
    // setupTestFrameworkScriptFile: '<rootDir>/config/setup.js',
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: false,
    transform: {
        '^.+\\.jsx$': 'babel-jest',
        '^.+\\.js$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx'],
    // moduleDirectories: ['node_modules'],
};
*/
