'use client';

import { getAvatarColor, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  id: string;
  size?: number;
}

export function Avatar({ name, id, size = 36 }: AvatarProps) {
  const color = getAvatarColor(id);
  const initials = getInitials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color + '18',
        color,
        fontWeight: 700,
        fontSize: Math.floor(size * 0.36),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `2px solid ${color}30`,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  );
}
