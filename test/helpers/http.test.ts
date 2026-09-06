import { HttpError } from '@/utils/http-error.js';

// Mock the extension methods on Blob and Response prototypes
const blobDownloadMock = vi.fn(() => Promise.resolve());
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
    it('should create a text/plain blob and await its download method', async () => {
      const text = 'hello world';
      const filename = 'hello.txt';

      await expect(BuiltinX.Http.downloadText(text, filename)).resolves.toBeUndefined();

      expect(blobDownloadMock).toHaveBeenCalledWith(filename);
      expect(blobDownloadMock).toHaveBeenCalledTimes(1);
      expect((blobDownloadMock.mock.contexts[0] as Blob).type).toBe('text/plain');
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

  describe('request', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      fetchMock.mockReset();
    });

    it('should return parsed JSON for a successful JSON response', async () => {
      const mockData = { id: 1, name: 'test' };
      const mockResponse = new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      fetchMock.mockResolvedValue(mockResponse);

      const data = await BuiltinX.Http.request('https://api.example.com/data');
      expect(data).toEqual(mockData);
    });

    it('should return text for a successful non-JSON response', async () => {
      const mockText = '<h1>Hello</h1>';
      const mockResponse = new Response(mockText, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
      fetchMock.mockResolvedValue(mockResponse);

      const data = await BuiltinX.Http.request('https://api.example.com/page');
      expect(data).toBe(mockText);
    });

    it('should return null for a 204 No Content response', async () => {
      const mockResponse = new Response(null, { status: 204 });
      fetchMock.mockResolvedValue(mockResponse);

      const data = await BuiltinX.Http.request('https://api.example.com/delete');
      expect(data).toBeNull();
    });

    it('should throw HttpError for a non-ok response with a JSON body', async () => {
      const errorData = { message: 'Not Found' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchMock.mockResolvedValue(mockResponse);

      try {
        await BuiltinX.Http.request('https://api.example.com/invalid');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        const err = e as HttpError;
        expect(err.status).toBe(404);
        expect(err.data).toEqual(errorData);
        expect(err.response).toBe(mockResponse);
        expect(err.message).toBe('HTTP 404: Not Found');
      }
    });

    it('should throw HttpError for a non-ok response with a text body', async () => {
      const errorText = 'Internal Server Error';
      const mockResponse = new Response(errorText, {
        status: 500,
        statusText: 'Server Error',
        headers: { 'Content-Type': 'text/plain' },
      });
      fetchMock.mockResolvedValue(mockResponse);

      try {
        await BuiltinX.Http.request('https://api.example.com/error');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        const err = e as HttpError;
        expect(err.status).toBe(500);
        expect(err.data).toBe(errorText);
      }
    });

    it('should return null as data if JSON content-type is present but body is empty', async () => {
      const mockResponse = new Response('', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      fetchMock.mockResolvedValue(mockResponse);

      const data = await BuiltinX.Http.request('https://api.example.com/empty-json');
      expect(data).toBeNull();
    });

    it('should propagate network errors from fetch', async () => {
      const networkError = new TypeError('Failed to fetch');
      fetchMock.mockRejectedValue(networkError);

      await expect(BuiltinX.Http.request('https://api.example.com/network-error'))
        .rejects.toThrow(networkError);
    });
  });
});
