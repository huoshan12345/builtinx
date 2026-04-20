import { beforeEach, vi, afterEach } from "vitest";
import { setupVitestCanvasMock } from 'vitest-canvas-mock';

beforeEach(() => {
  vi.resetAllMocks();
  setupVitestCanvasMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});
