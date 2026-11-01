'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuX } from 'react-icons/lu';

// Bottom sheet on phones, centered dialog on larger screens.
export default function Sheet({ open, onClose, title, children, wide = false }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-deep/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`max-h-[92dvh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} animate-rise overflow-y-auto rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-ink sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-ink-soft hover:bg-paper" aria-label="Close"><LuX size={20} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
