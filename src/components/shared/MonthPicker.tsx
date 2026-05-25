'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface MonthPickerProps {
  value: string; // "YYYY-MM"
  onChange: (month: string) => void;
  maxMonth?: string;
}

export function MonthPicker({ value, onChange, maxMonth }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number);
  const label = `${MONTH_NAMES_ID[month - 1]} ${year}`;

  const prev = () => {
    const d = new Date(year, month - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const next = () => {
    const d = new Date(year, month, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!maxMonth || next <= maxMonth) onChange(next);
  };

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isMax = maxMonth ? value >= maxMonth : value >= currentMonth;

  const btnStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    color: '#64748B',
  } as const;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        padding: '0 4px',
      }}
    >
      <button onClick={prev} style={btnStyle} title="Bulan sebelumnya">
        <ChevronLeft size={16} />
      </button>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#0F172A',
          padding: '6px 8px',
          minWidth: 140,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      <button
        onClick={next}
        style={{ ...btnStyle, opacity: isMax ? 0.35 : 1, cursor: isMax ? 'not-allowed' : 'pointer' }}
        title={isMax ? 'Sudah bulan terbaru' : 'Bulan berikutnya'}
        disabled={isMax}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
