const {defaults} = require('jest-config');

module.exports = {
    reporters: [
        'default',
        'jest-junit'
    ],
    coverageDirectory: 'artifacts/coverage',
    testEnvironment: 'jsdom',
    collectCoverageFrom: [
        'src/**/*.js'
    ]
}
