'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
export default function Login() {
  const router = useRouter();
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (signup && !f.name.trim()) return setErr('Name is required');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters');
    setBusy(true);
    try {
      const d = await api(signup ? '/auth/signup' : '/auth/login', { method: 'POST', body: f });
      localStorage.setItem('token', d.token); router.replace('/');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <main style={{ maxWidth: 380 }}><form className="card" onSubmit={submit}>
      <h1>{signup ? 'Create account' : 'Log in'}</h1>
      <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {signup && <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
        <input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <div className="err">{err}</div>}
        <button disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Log in'}</button>
        <button type="button" className="ghost" onClick={() => setSignup(!signup)}>{signup ? 'Have an account? Log in' : 'New here? Sign up'}</button>
      </div></form></main>
  );
}
