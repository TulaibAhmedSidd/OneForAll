// Wordmark: a ticket with a notch and the numeral 1.
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M6 4h28a2 2 0 0 1 2 2v9a5 5 0 0 0 0 10v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a5 5 0 0 0 0-10V6a2 2 0 0 1 2-2Z" fill="#E8B64C" />
      <path d="M21.6 11v18h-3.7V15.6l-3.3 1.2v-3.2l6.4-2.6h.6Z" fill="#0A2B22" />
      <path d="M8 20h3M29 20h3" stroke="#0A2B22" strokeWidth="1.6" strokeDasharray="1.6 1.6" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-[19px] font-extrabold leading-none tracking-tight ${light ? 'text-white' : 'text-forest'}`}>
        One<span className="text-gold-deep">for</span>All
      </span>
    </span>
  );
}
