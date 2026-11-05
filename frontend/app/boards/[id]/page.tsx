'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, useAuthGuard } from '@/lib/api';

const empty = { title: '', description: '', assignee: '', dueDate: '', priority: 'Medium', labels: '' };
export default function BoardPage() {
  useAuthGuard();
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const [board, setBoard] = useState<any>(null); const [cols, setCols] = useState<any[]>([]); const [tasks, setTasks] = useState<any[]>([]);
  const [flt, setFlt] = useState({ assignee: '', priority: '', label: '', overdue: false, q: '' });
  const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  const [modal, setModal] = useState<{ colId: string; task?: any } | null>(null);
  const [drag, setDrag] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    const p = new URLSearchParams();
    if (flt.assignee) p.set('assignee', flt.assignee); if (flt.priority) p.set('priority', flt.priority);
    if (flt.label) p.set('label', flt.label); if (flt.overdue) p.set('overdue', 'true'); if (flt.q) p.set('q', flt.q);
    setTasks(await api(`/boards/${id}/tasks?${p}`)); // filtering runs on the backend
  }, [id, flt]);
  const loadBoard = useCallback(async () => { const d = await api(`/boards/${id}`); setBoard(d.board); setCols(d.columns); }, [id]);
  useEffect(() => { if (localStorage.getItem('token')) loadBoard().catch((e) => setErr(e.message)); }, [loadBoard]);
  useEffect(() => { if (localStorage.getItem('token')) loadTasks().catch((e) => setErr(e.message)).finally(() => setLoading(false)); }, [loadTasks]);
  const run = async (fn: () => Promise<any>) => { setErr(''); try { await fn(); } catch (e: any) { setErr(e.message); } };

  // Optimistic drag & drop: update UI first, roll back (reload) if API fails.
  async function drop(colId: string, beforeId: string | null) {
    if (!drag) return; const moving = tasks.find((t) => t._id === drag); setDrag(null); if (!moving || drag === beforeId) return;
    const prev = tasks;
    const target = tasks.filter((t) => t.column === colId && t._id !== moving._id).sort((a, b) => a.position - b.position);
    const i = beforeId ? target.findIndex((t) => t._id === beforeId) : -1;
    target.splice(i === -1 ? target.length : i, 0, { ...moving, column: colId });
    const pos = new Map(target.map((t, k) => [t._id, k]));
    setTasks(tasks.map((t) => (pos.has(t._id) ? { ...t, column: colId, position: pos.get(t._id) } : t)));
    try { await api(`/boards/${id}/tasks/${moving._id}/move`, { method: 'PATCH', body: { columnId: colId, beforeId } }); }
    catch (e: any) { setTasks(prev); setErr('Move failed, rolled back: ' + e.message); }
  }
  async function save(e: React.FormEvent<HTMLFormElement>, form: any) {
    e.preventDefault();
    if (!form.title.trim()) return setErr('Title is required');
    const body = { title: form.title, description: form.description, assignee: form.assignee || null, dueDate: form.dueDate || null, priority: form.priority,
      labels: form.labels.split(',').map((s: string) => s.trim()).filter(Boolean), ...(modal!.task ? {} : { column: modal!.colId }) };
    await run(async () => {
      await api(`/boards/${id}/tasks${modal!.task ? '/' + modal!.task._id : ''}`, { method: modal!.task ? 'PATCH' : 'POST', body });
      setModal(null); await loadTasks();
    });
  }
  if (loading && !board) return <main><p className="muted">{err || 'Loading…'}</p></main>;
  return (<>
    <header>
      <h1>{board?.name}</h1>
      <div className="row">
        <button className="ghost" onClick={() => router.push('/')}>All boards</button>
        <button className="ghost" onClick={() => { const n = prompt('Rename board', board.name); if (n?.trim()) run(async () => { await api(`/boards/${id}`, { method: 'PATCH', body: { name: n } }); loadBoard(); }); }}>Rename</button>
        <button className="ghost" onClick={() => { const email = prompt('Invite user by email'); if (email) run(async () => { await api(`/boards/${id}/invite`, { method: 'POST', body: { email } }); loadBoard(); }); }}>Invite</button>
        <button className="danger" onClick={() => { if (confirm('Delete this board?')) run(async () => { await api(`/boards/${id}`, { method: 'DELETE' }); router.push('/'); }); }}>Delete</button>
      </div>
    </header>
    <main>
      <div className="row">
        <input placeholder="Search title" value={flt.q} onChange={(e) => setFlt({ ...flt, q: e.target.value })} />
        <select value={flt.assignee} onChange={(e) => setFlt({ ...flt, assignee: e.target.value })}><option value="">Any assignee</option>{board?.members.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}</select>
        <select value={flt.priority} onChange={(e) => setFlt({ ...flt, priority: e.target.value })}><option value="">Any priority</option><option>Low</option><option>Medium</option><option>High</option></select>
        <input placeholder="Label" value={flt.label} onChange={(e) => setFlt({ ...flt, label: e.target.value })} style={{ width: 100 }} />
        <label><input type="checkbox" checked={flt.overdue} onChange={(e) => setFlt({ ...flt, overdue: e.target.checked })} /> Overdue</label>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="cols">
        {cols.map((c) => {
          const list = tasks.filter((t) => t.column === c._id).sort((a, b) => a.position - b.position);
          return (
            <div key={c._id} className="col" onDragOver={(e) => e.preventDefault()} onDrop={() => drop(c._id, null)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{c.name} <span className="muted">({list.length})</span></b>
                <span>
                  <button className="ghost" onClick={() => { const n = prompt('Rename column', c.name); if (n?.trim()) run(async () => { await api(`/boards/${id}/columns/${c._id}`, { method: 'PATCH', body: { name: n } }); loadBoard(); }); }}>✎</button>{' '}
                  <button className="ghost" onClick={() => { if (confirm('Delete column and its tasks?')) run(async () => { await api(`/boards/${id}/columns/${c._id}`, { method: 'DELETE' }); await loadBoard(); await loadTasks(); }); }}>🗑</button>
                </span>
              </div>
              {list.length === 0 && <p className="muted" style={{ fontSize: 13 }}>No tasks</p>}
              {list.map((t) => (
                <div key={t._id} className="task" draggable onDragStart={() => setDrag(t._id)} onDrop={(e) => { e.stopPropagation(); drop(c._id, t._id); }}>
                  <b>{t.title}</b>
                  <div><span className={`badge ${t.priority}`}>{t.priority}</span>{t.labels.map((l: string) => <span key={l} className="badge">{l}</span>)}</div>
                  <div className="muted">{t.assignee?.name || 'Unassigned'}{t.dueDate && <span style={{ color: new Date(t.dueDate) < new Date() ? '#d64545' : undefined }}> · due {t.dueDate.slice(0, 10)}</span>}</div>
                  <div className="row"><button className="ghost" onClick={() => setModal({ colId: c._id, task: t })}>Edit</button>
                    <button className="ghost" onClick={() => { if (confirm('Delete task?')) run(async () => { await api(`/boards/${id}/tasks/${t._id}`, { method: 'DELETE' }); loadTasks(); }); }}>Delete</button></div>
                </div>))}
              <button className="ghost" style={{ width: '100%' }} onClick={() => setModal({ colId: c._id })}>+ Add task</button>
            </div>);
        })}
        <div className="col"><button className="ghost" style={{ width: '100%' }} onClick={() => { const n = prompt('Column name'); if (n?.trim()) run(async () => { await api(`/boards/${id}/columns`, { method: 'POST', body: { name: n } }); loadBoard(); }); }}>+ Add column</button></div>
      </div>
    </main>
    {modal && <TaskForm members={board.members} task={modal.task} onSave={save} onClose={() => setModal(null)} />}
  </>);
}
function TaskForm({ members, task, onSave, onClose }: any) {
  const [f, setF] = useState(task ? { title: task.title, description: task.description, assignee: task.assignee?._id || '', dueDate: task.dueDate?.slice(0, 10) || '', priority: task.priority, labels: task.labels.join(', ') } : empty);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (<div className="modal" onClick={onClose}><form onClick={(e) => e.stopPropagation()} onSubmit={(e) => onSave(e, f)}>
    <h2>{task ? 'Edit task' : 'New task'}</h2>
    <input placeholder="Title *" value={f.title} onChange={set('title')} />
    <textarea placeholder="Description" rows={3} value={f.description} onChange={set('description')} />
    <select value={f.assignee} onChange={set('assignee')}><option value="">Unassigned</option>{members.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}</select>
    <input type="date" value={f.dueDate} onChange={set('dueDate')} />
    <select value={f.priority} onChange={set('priority')}><option>Low</option><option>Medium</option><option>High</option></select>
    <input placeholder="Labels, comma separated" value={f.labels} onChange={set('labels')} />
    {task?.activity && <div className="muted" style={{ fontSize: 12 }}>{task.activity.slice(-4).map((a: any, i: number) => <div key={i}>{a.text} · {new Date(a.at).toLocaleString()}</div>)}</div>}
    <div className="row"><button>Save</button><button type="button" className="ghost" onClick={onClose}>Cancel</button></div>
  </form></div>);
}
