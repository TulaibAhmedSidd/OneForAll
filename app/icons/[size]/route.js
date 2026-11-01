import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// App icons drawn at request time (cached by the CDN), so there are no binary files to maintain.
export async function GET(req, { params }) {
  const size = [180, 192, 512].includes(Number(params.size)) ? Number(params.size) : 192;
  const maskable = new URL(req.url).searchParams.has('maskable');
  const pad = maskable ? size * 0.2 : size * 0.12;
  const t = size - pad * 2;

  return new ImageResponse(
    (
      <div style={{ width: size, height: size, background: '#0E3B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: maskable ? 0 : size * 0.22 }}>
        <div style={{ width: t, height: t * 0.72, background: '#E8B64C', borderRadius: t * 0.08, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', left: -t * 0.07, top: t * 0.29, width: t * 0.14, height: t * 0.14, borderRadius: t, background: '#0E3B2E' }} />
          <div style={{ position: 'absolute', right: -t * 0.07, top: t * 0.29, width: t * 0.14, height: t * 0.14, borderRadius: t, background: '#0E3B2E' }} />
          <div style={{ fontSize: t * 0.56, fontWeight: 900, color: '#0A2B22', lineHeight: 1 }}>1</div>
        </div>
      </div>
    ),
    { width: size, height: size, headers: { 'Cache-Control': 'public, max-age=86400, immutable' } }
  );
}
