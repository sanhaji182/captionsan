const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || `Request failed (${res.status})`, status: res.status };
    }

    return { data, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { error: message, status: 0 };
  }
}
