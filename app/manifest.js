export default function manifest() {
  return {
    name: 'One For All',
    short_name: 'OneForAll',
    description: 'Rs 1, 5 and 10 tickets for real prizes, with draws anyone can check.',
    start_url: '/play',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2F6F3',
    theme_color: '#0E3B2E',
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png' },
      { src: '/icons/512?maskable=1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
