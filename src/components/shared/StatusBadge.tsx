'use client';

import { AttendanceStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/attendance-utils';

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = STATUS_COLORS[status];
  if (!cfg) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 6,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: status === 'ALPHA' ? 700 : 500,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
