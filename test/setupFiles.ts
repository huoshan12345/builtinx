import { setupVitestCanvasMock } from 'vitest-canvas-mock';

beforeEach(() => {
  vi.resetAllMocks();
  setupVitestCanvasMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});
