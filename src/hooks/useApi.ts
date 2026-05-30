'use client';

import { useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

export function useApi() {
  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }, []);

  const get = useCallback(async (url: string) => {
    const headers = await getHeaders();
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [getHeaders]);

  const post = useCallback(async (url: string, body: unknown) => {
    const headers = await getHeaders();
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [getHeaders]);

  const put = useCallback(async (url: string, body: unknown) => {
    const headers = await getHeaders();
    const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [getHeaders]);

  const del = useCallback(async (url: string) => {
    const headers = await getHeaders();
    const res = await fetch(url, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [getHeaders]);

  return { get, post, put, del };
}
