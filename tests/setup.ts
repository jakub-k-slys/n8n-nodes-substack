// Global test setup
import { SubstackHttpServer } from './mocks/substackHttpServer';

// Start MSW server before all tests
beforeAll(() => {
	SubstackHttpServer.start();
});

// Reset handlers between tests to ensure test isolation
beforeEach(() => {
	SubstackHttpServer.reset();
});

// Cleanup after each test
afterEach(() => {
	SubstackHttpServer.cleanup();
});

// Stop MSW server after all tests
afterAll(() => {
	SubstackHttpServer.stop();
});