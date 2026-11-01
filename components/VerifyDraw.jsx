'use client';

import { useState } from 'react';

// Re-runs the draw in the browser with the revealed secret, using the same steps as the server.
async function hmacHex(key, msg) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(msg) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function recomputeDraw(seed, gameId, total, count) {
  const n = BigInt(total);
  const space = 1n << 256n;
  const limit = space - (space % n);
  const picked = [];
  for (let i = 0; picked.length < Math.min(count, total); i++) {
    const v = BigInt(`0x${await hmacHex(seed, `${gameId}:${i}`)}`);
    if (v >= limit) continue;
    const t = Number(v % n) + 1;
    if (!picked.includes(t)) picked.push(t);
  }
  return picked;
}

export default function VerifyDraw({ game }) {
  const [result, setResult] = useState(null);

  async function check() {
    const hashOk = (await sha256Hex(game.seedRevealed)) === game.seedHash;
    const count = game.prizes.reduce((s, p) => s + p.quantity, 0);
    const picked = await recomputeDraw(game.seedRevealed, game.id, game.sold, count);
    const announced = game.prizes.flatMap((p) => p.winners.map((w) => w.ticketNo));
    setResult({ hashOk, picked, match: hashOk && picked.join() === announced.join() });
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-ink-mute">Revealed secret</p>
      <p className="break-all rounded-lg bg-paper p-3 font-mono text-xs">{game.seedRevealed}</p>
      <button onClick={check} className="btn-forest btn-sm w-full">Check this draw on my phone</button>
      {result && (
        <p className={`rounded-lg p-3 text-sm font-semibold ${result.match ? 'bg-jade-light text-jade' : 'bg-coral-pale text-coral'}`}>
          {result.match
            ? `✓ Fingerprint matches and the winning tickets are ${result.picked.map((t) => `#${t}`).join(', ')} — exactly what was announced.`
            : `✗ This draw does not match (fingerprint ${result.hashOk ? 'ok' : 'wrong'}). Please contact support.`}
        </p>
      )}
    </div>
  );
}
