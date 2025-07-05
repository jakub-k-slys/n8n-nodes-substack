module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests/unit'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	// Remove MSW setup - we don't need it for unit tests
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	setupFilesAfterEnv: [],
};