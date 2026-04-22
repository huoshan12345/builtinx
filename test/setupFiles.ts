import { setupVitestCanvasMock } from 'vitest-canvas-mock';

// Import the module to be tested if the functions can work together.
await import('@/index');
await import('@/dom');

beforeEach(() => {
  vi.resetAllMocks();
  setupVitestCanvasMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});
