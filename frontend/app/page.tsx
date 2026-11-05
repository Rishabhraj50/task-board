'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuthGuard } from '@/lib/api';
export default function Boards() {
  useAuthGuard();
  const [boards, setBoards] = useState<any[]>([]); const [name, setName] = useState('');
  const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  useEffect(() => { if (localStorage.getItem('token')) api('/boards').then(setBoards).catch((e) => setErr(e.message)).finally(() => setLoading(false)); }, []);
  async function create(e: React.FormEvent) {
    e.preventDefault(); if (!name.trim()) return setErr('Board name is required'); setErr('');
    try { const b = await api('/boards', { method: 'POST', body: { name } }); setBoards([b, ...boards]); setName(''); } catch (e: any) { setErr(e.message); }
  }
  return (<>
    <header><h1>My boards</h1><button className="ghost" onClick={() => { localStorage.removeItem('token'); location.href = '/login'; }}>Log out</button></header>
    <main>
      <form className="row" onSubmit={create}><input placeholder="New board name" value={name} onChange={(e) => setName(e.target.value)} /><button>Create board</button></form>
      {err && <div className="err">{err}</div>}
      {loading ? <p className="muted">Loading…</p> : boards.length === 0 ? <p className="muted">No boards yet. Create your first one above.</p> :
        <div className="grid">{boards.map((b) => <Link key={b._id} href={`/boards/${b._id}`} className="card"><b>{b.name}</b></Link>)}</div>}
    </main></>);
}
