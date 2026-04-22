// HttpError is exported from the module, not attached to BuiltinX, so we import it.
import { HttpError } from '@/helpers/fetch';

describe('BuiltinX.Fetch', () => {
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

    const data = await BuiltinX.Fetch.request('https://api.example.com/data');
    expect(data).toEqual(mockData);
  });

  it('should return text for a successful non-JSON response', async () => {
    const mockText = '<h1>Hello</h1>';
    const mockResponse = new Response(mockText, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
    fetchMock.mockResolvedValue(mockResponse);

    const data = await BuiltinX.Fetch.request('https://api.example.com/page');
    expect(data).toBe(mockText);
  });

  it('should return null for a 204 No Content response', async () => {
    const mockResponse = new Response(null, { status: 204 });
    fetchMock.mockResolvedValue(mockResponse);

    const data = await BuiltinX.Fetch.request('https://api.example.com/delete');
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
      await BuiltinX.Fetch.request('https://api.example.com/invalid');
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
      await BuiltinX.Fetch.request('https://api.example.com/error');
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

    const data = await BuiltinX.Fetch.request('https://api.example.com/empty-json');
    expect(data).toBeNull();
  });

  it('should propagate network errors from fetch', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(networkError);

    await expect(BuiltinX.Fetch.request('https://api.example.com/network-error'))
      .rejects.toThrow(networkError);
  });
});