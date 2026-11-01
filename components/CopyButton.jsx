'use client';

import { toast } from 'react-toastify';

export default function CopyButton({ text, label = 'Copy' }) {
  return (
    <button
      type="button"
      className="btn-forest btn-sm"
      onClick={() => navigator.clipboard?.writeText(text).then(() => toast.success('Copied'))}
    >
      {label}
    </button>
  );
}
