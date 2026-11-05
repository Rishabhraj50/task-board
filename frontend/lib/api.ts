'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export async function api(path: string, opts: { method?: string; body?: any } = {}) {
  const t = localStorage.getItem('token');
  const r = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (r.status === 401 && !path.startsWith('/auth')) { // expired/invalid token -> back to login
    localStorage.removeItem('token'); window.location.href = '/login'; throw new Error('Session expired');
  }
  const d = r.status === 204 ? {} : await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || 'Request failed');
  return d;
}
export function useAuthGuard() {
  const router = useRouter();
  useEffect(() => { if (!localStorage.getItem('token')) router.replace('/login'); }, [router]);
}
