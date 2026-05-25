'use client';

import { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, type === 'success' ? 3000 : 5000);
    return () => clearTimeout(t);
  }, [type, onClose]);

  const bg = type === 'success' ? '#10B981' : '#EF4444';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: bg,
        color: 'white',
        padding: '12px 16px',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
        fontWeight: 500,
        maxWidth: 340,
      }}
    >
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.25)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          borderRadius: 6,
          padding: '3px 6px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
