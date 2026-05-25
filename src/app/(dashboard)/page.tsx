'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, User, DollarSign } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApi } from '@/hooks/useApi';
import { Employee, Attendance, AttendanceStatus } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { MEAL_ELIGIBLE_STATUSES } from '@/lib/attendance-utils';

const MONTH_NAMES_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
const DAY_NAMES_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function SummaryCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: '4px 0 2px', fontSize: 24, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: 12, color: '#94A3B8' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { get } = useApi();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    try {
      const [emps, atts] = await Promise.all([
        get('/api/employees'),
        get(`/api/attendance?month=${monthStr}`),
      ]);
      setEmployees(emps);
      setAttendances(atts);
    } catch {
      // not logged in — middleware will redirect
    } finally {
      setLoading(false);
    }
  }, [get, monthStr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeEmployees = employees.filter((e) => e.isActive);

  // Today's attendance
  const todayAttendances = attendances.filter((a) => a.date.startsWith(todayStr));
  const todayMap = new Map(todayAttendances.map((a) => [a.employeeId, a]));
  const presentToday = todayAttendances.filter((a) =>
    ['HADIR', 'TERLAMBAT', 'WFH', 'DINAS_LUAR', 'SIDANG', 'PENDAMPINGAN'].includes(a.status)
  ).length;

  // Total meal this month
  const totalMeal = employees.reduce((sum, emp) => {
    const empAtts = attendances.filter((a) => a.employeeId === emp.id);
    const eligible = empAtts.filter((a) => MEAL_ELIGIBLE_STATUSES.includes(a.status as AttendanceStatus)).length;
    return sum + eligible * emp.mealAllowance;
  }, 0);

  const dayName = DAY_NAMES_ID[now.getDay()];
  const dateLabel = `${dayName}, ${now.getDate()} ${MONTH_NAMES_ID[now.getMonth()]} ${now.getFullYear()}`;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px 28px', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ height: 24, width: 200, background: '#F1F5F9', borderRadius: 6 }} />
        </div>
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: 1, height: 100, background: '#F1F5F9', borderRadius: 14 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px', background: 'white', borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Dashboard</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>{dateLabel}</p>
        </div>
        <button
          onClick={() => router.push('/absensi')}
          style={{
            background: '#4F46E5', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
          }}
        >
          + Input Absensi
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <SummaryCard
            label="Hadir Hari Ini"
            value={`${presentToday}/${activeEmployees.length}`}
            sub={todayStr}
            icon={<Users size={20} />}
            color="#4F46E5"
          />
          <SummaryCard
            label="Karyawan Aktif"
            value={activeEmployees.length}
            sub={`dari ${employees.length} total`}
            icon={<User size={16} />}
            color="#10B981"
          />
          <SummaryCard
            label="Uang Makan Bulan Ini"
            value={formatRupiah(totalMeal)}
            sub={`Estimasi s/d ${MONTH_NAMES_ID[now.getMonth()]} ${now.getFullYear()}`}
            icon={<DollarSign size={16} />}
            color="#F59E0B"
          />
        </div>

        {/* Today's attendance quick view */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                Absensi Hari Ini — {dateLabel}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>
                {presentToday} dari {activeEmployees.length} karyawan sudah diinput
              </p>
            </div>
            <button
              onClick={() => router.push('/absensi')}
              style={{
                background: 'white', color: '#475569', border: '1px solid #E2E8F0',
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              }}
            >
              Lihat Semua
            </button>
          </div>
          <div>
            {activeEmployees.map((emp, i) => {
              const att = todayMap.get(emp.id);
              return (
                <div key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  background: i % 2 === 0 ? 'white' : '#FAFAFA',
                  borderBottom: i < activeEmployees.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}>
                  <Avatar name={emp.name} id={emp.id} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{emp.position ?? '-'}</div>
                  </div>
                  {att ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <StatusBadge status={att.status as AttendanceStatus} />
                      {att.checkIn && (
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                          {att.checkIn} – {att.checkOut ?? '--:--'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#CBD5E1' }}>Belum diinput</span>
                  )}
                </div>
              );
            })}
            {activeEmployees.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                Belum ada karyawan aktif.{' '}
                <button onClick={() => router.push('/karyawan')} style={{ color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Tambah karyawan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
