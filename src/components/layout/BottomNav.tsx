'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, DollarSign, Users } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  href: '/',           Icon: LayoutDashboard },
  { id: 'absensi',    label: 'Absensi',    href: '/absensi',    Icon: Calendar },
  { id: 'uang-makan', label: 'Uang Makan', href: '/uang-makan', Icon: DollarSign },
  { id: 'karyawan',   label: 'Karyawan',   href: '/karyawan',   Icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ id, label, href, Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <button
            key={id}
            onClick={() => router.push(href)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: active ? '#4F46E5' : '#94A3B8',
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              transition: 'color 0.12s',
            }}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
