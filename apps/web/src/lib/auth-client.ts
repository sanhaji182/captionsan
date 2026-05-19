'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SessionData {
  user: User;
  session: { id: string; expiresAt: string };
}

// Simple session hook
export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/get-session`, { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => {
        if (json.user) {
          setData({ user: json.user, session: json.session });
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setIsPending(false));
  }, []);

  return { data, isPending };
}

export const signIn = {
  email: async (data: { email: string; password: string }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { error: { message: json.error || 'Login failed' } };
      }
      return { data: json };
    } catch {
      return { error: { message: 'Network error' } };
    }
  },
};

export const signUp = {
  email: async (data: { name: string; email: string; password: string }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { error: { message: json.error || 'Sign-up failed' } };
      }
      return { data: json };
    } catch {
      return { error: { message: 'Network error' } };
    }
  },
};

export async function signOut() {
  await fetch(`${API_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });
}
