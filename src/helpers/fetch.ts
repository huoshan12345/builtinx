export namespace Fetch {
  export async function request<T = unknown>(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(input, init);

    let data: unknown;
    const contentType = res.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
      const anyError = error as any;
      anyError.status = res.status;
      anyError.data = data;
      anyError.response = res;
      throw error;
    }

    return data as T;
  }
}