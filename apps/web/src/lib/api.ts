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

// Prompt API helpers

export async function generatePrompt(projectId: string) {
  return apiFetch<{ promptDraft: unknown }>(`/api/projects/${projectId}/prompt/generate`, {
    method: 'POST',
  });
}

export async function fetchPromptDraft(projectId: string) {
  return apiFetch<{ promptDraft: unknown; revisions: unknown[] }>(
    `/api/projects/${projectId}/prompt`
  );
}

export async function editPrompt(projectId: string, promptText: string) {
  return apiFetch(`/api/projects/${projectId}/prompt/edit`, {
    method: 'PUT',
    body: JSON.stringify({ promptText }),
  });
}

export async function revisePrompt(projectId: string, instruction: string) {
  return apiFetch(`/api/projects/${projectId}/prompt/revise`, {
    method: 'POST',
    body: JSON.stringify({ instruction }),
  });
}

export async function approvePrompt(projectId: string) {
  return apiFetch(`/api/projects/${projectId}/prompt/approve`, {
    method: 'POST',
  });
}
