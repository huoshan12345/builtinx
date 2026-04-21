// Mock the extension methods on Blob and Response prototypes
const blobDownloadMock = vi.fn();
const responseDownloadMock = vi.fn();
(globalThis.Blob.prototype as any).download = blobDownloadMock;
(globalThis.Response.prototype as any).download = responseDownloadMock;

describe('BuiltinX.Http', () => {
  beforeEach(() => {
    // Clear mocks before each test
    blobDownloadMock.mockClear();
    responseDownloadMock.mockClear();
    vi.unstubAllGlobals(); // Restore any global mocks like fetch
  });

  describe('downloadText', () => {
    it('should create a blob and call its download method', () => {
      const text = 'hello world';
      const filename = 'hello.txt';
      const type = 'text/plain';

      BuiltinX.Http.downloadText(text, filename, type);

      // We can't easily inspect the created Blob, but we can verify `download` was called.
      expect(blobDownloadMock).toHaveBeenCalledWith(filename);
      expect(blobDownloadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('download', () => {
    it('should fetch a URL and call download on the response', async () => {
      const url = 'https://example.com/file.zip';
      const filename = 'archive.zip';

      // Mock global fetch
      const mockResponse = new Response();
      const fetchMock = vi.fn().mockResolvedValue(mockResponse);
      vi.stubGlobal('fetch', fetchMock);

      await BuiltinX.Http.download(url, filename);

      expect(fetchMock).toHaveBeenCalledWith(url);
      expect(responseDownloadMock).toHaveBeenCalledWith(filename);
      expect(responseDownloadMock).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from fetch', async () => {
      const url = 'https://example.com/non-existent.zip';
      const filename = 'archive.zip';
      const fetchError = new Error('Network failed');

      const fetchMock = vi.fn().mockRejectedValue(fetchError);
      vi.stubGlobal('fetch', fetchMock);

      await expect(BuiltinX.Http.download(url, filename)).rejects.toThrow(fetchError);
      expect(responseDownloadMock).not.toHaveBeenCalled();
    });
  });
});