'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LuImagePlus } from 'react-icons/lu';
import { api } from '@/components/api';
import Sheet from '@/components/Sheet';
import { rs } from '@/lib/format';

const EMPTY = { prizeName: '', prizeImage: '', prizeWorth: '', type: 'item' };

export default function PrizesAdmin() {
  const [prizes, setPrizes] = useState(null);
  const [edit, setEdit] = useState(null); // null | { id?, ...form }
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => api('/api/admin/prizes').then((d) => setPrizes(d.prizes)).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const { url } = await api('/api/admin/upload', { method: 'POST', body: fd });
      setEdit((f) => ({ ...f, prizeImage: url }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { prizeName: edit.prizeName, prizeImage: edit.prizeImage, prizeWorth: Number(edit.prizeWorth), type: edit.type };
      if (edit.id) await api(`/api/admin/prizes/${edit.id}`, { method: 'PUT', body });
      else await api('/api/admin/prizes', { method: 'POST', body });
      toast.success('Prize saved');
      setEdit(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}" from the catalogue? Games that already use it are not affected.`)) return;
    try {
      await api(`/api/admin/prizes/${p.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Prize catalogue</h1>
          <p className="text-ink-soft">Prizes you can attach to games. Cash prizes are paid into the winner&apos;s wallet automatically.</p>
        </div>
        <button className="btn-gold" onClick={() => setEdit({ ...EMPTY })}>Add prize</button>
      </div>

      {prizes === null ? (
        <p className="mt-8 text-ink-soft">Loading…</p>
      ) : prizes.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-soft">No prizes yet. Add your first one to start creating games.</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prizes.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <img src={p.image} alt="" className="aspect-square w-full bg-paper object-cover" />
              <div className="p-4">
                <p className="font-display text-lg font-bold leading-tight">{p.name}</p>
                <p className="text-sm text-ink-soft">{rs(p.worth)} · {p.type === 'cash' ? 'Cash to wallet' : 'Item'}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-ghost btn-sm flex-1" onClick={() => setEdit({ id: p.id, prizeName: p.name, prizeImage: p.image, prizeWorth: p.worth, type: p.type })}>Edit</button>
                  <button className="btn-sm btn border border-coral/40 text-coral hover:bg-coral-pale" onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!edit} onClose={() => !busy && setEdit(null)} title={edit?.id ? 'Edit prize' : 'Add prize'}>
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper text-ink-soft hover:border-jade">
              {edit.prizeImage ? <img src={edit.prizeImage} alt="" className="h-full w-full object-cover" /> : <><LuImagePlus size={28} /><span className="mt-2 text-sm font-semibold">{uploading ? 'Uploading…' : 'Upload photo (JPG/PNG, under 4 MB)'}</span></>}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={upload} />
            </label>
            <div>
              <label className="label" htmlFor="pimg">…or paste an image link</label>
              <input id="pimg" className="field" value={edit.prizeImage} onChange={(e) => setEdit({ ...edit, prizeImage: e.target.value })} placeholder="https://" />
            </div>
            <div>
              <label className="label" htmlFor="pname">Prize name</label>
              <input id="pname" className="field" required value={edit.prizeName} onChange={(e) => setEdit({ ...edit, prizeName: e.target.value })} placeholder="Samsung Galaxy A15" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="pworth">Worth (Rs)</label>
                <input id="pworth" type="number" min={0} className="field" required value={edit.prizeWorth} onChange={(e) => setEdit({ ...edit, prizeWorth: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="ptype">Type</label>
                <select id="ptype" className="field" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                  <option value="item">Item (delivered)</option>
                  <option value="cash">Cash (to wallet)</option>
                </select>
              </div>
            </div>
            <button className="btn-gold w-full" disabled={busy || uploading || !edit.prizeImage}>{busy ? 'Saving…' : 'Save prize'}</button>
          </form>
        )}
      </Sheet>
    </div>
  );
}
