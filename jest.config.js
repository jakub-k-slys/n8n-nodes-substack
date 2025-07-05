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
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
};