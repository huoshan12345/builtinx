import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We assume a test setup where the 'builtinx' library is loaded,
// making the 'BuiltinX' object globally available.

describe('BuiltinX.Clipboard', () => {
  // Create a mock function for writeText
  const writeTextMock = vi.fn();

  beforeEach(() => {
    // Before each test, stub the global navigator.clipboard object
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMock.mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    // Restore all stubbed globals and clear mocks after each test
    vi.unstubAllGlobals();
    writeTextMock.mockClear();
  });

  describe('copy', () => {
    it('should call navigator.clipboard.writeText with the provided string', async () => {
      const testString = 'Hello, BuiltinX!';
      await BuiltinX.Clipboard.copy(testString);
      expect(writeTextMock).toHaveBeenCalledWith(testString);
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    it('should reject the promise if writeText fails', async () => {
      const testError = new Error('Clipboard write failed');
      writeTextMock.mockRejectedValue(testError);

      const testString = 'This will fail';
      // We expect the promise to be rejected with the same error
      await expect(BuiltinX.Clipboard.copy(testString)).rejects.toThrow(testError);
    });
  });
});