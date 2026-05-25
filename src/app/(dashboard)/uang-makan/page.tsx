'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { MonthPicker } from '@/components/shared/MonthPicker';
import { Toast } from '@/components/shared/Toast';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { MealAllowanceSummary, AttendanceStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/attendance-utils';
import { formatRupiah } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-utils';
import { Employee, Attendance } from '@/types';

export default function UangMakanPage() {
  const { get } = useApi();
  const { activeMonth, setActiveMonth } = useAppStore();
  const [summaries, setSummaries] = useState<MealAllowanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [year, month] = activeMonth.split('-').map(Number);
  const monthLabel = `${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][month - 1]} ${year}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get(`/api/meal-allowance?month=${activeMonth}`);
      setSummaries(data.summaries);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [get, activeMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const grandTotal = summaries.reduce((s, r) => s + r.totalAmount, 0);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const [emps, atts] = await Promise.all([
        get('/api/employees'),
        get(`/api/attendance?month=${activeMonth}`),
      ]);
      exportToExcel(emps as Employee[], atts as Attendance[], summaries, activeMonth);
      setToast({ message: 'Rekap berhasil diunduh', type: 'success' });
    } catch {
      setToast({ message: 'Gagal export', type: 'error' });
    }
    setExportLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Uang Makan</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Rekap tunjangan makan — {monthLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <MonthPicker value={activeMonth} onChange={setActiveMonth} />
          <button
            onClick={handleExport}
            disabled={exportLoading}
            style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} />
            {exportLoading ? 'Mengunduh...' : 'Export Excel'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Info banner */}
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4338CA' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Uang makan dihitung untuk status: <strong>Hadir, Terlambat, WFH, Dinas Luar, Sidang, Pendampingan</strong>.
            Status Alpha menyebabkan potongan.
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Memuat data...</div>
        ) : (
          <>
            {/* Main table */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 24 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Karyawan', 'Jabatan', 'Tarif/Hari', 'Hari Hadir', 'Total'].map((h, i) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: i >= 2 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map(({ employee: emp, presentDays, totalAmount }, i) => (
                      <tr
                        key={emp.id}
                        style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA', borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F9FF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#FAFAFA'; }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={emp.name} id={emp.id} size={34} />
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{emp.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>{emp.position ?? '-'}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: '#0F172A', fontWeight: 500 }}>{formatRupiah(emp.mealAllowance)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, borderRadius: 6, background: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: 13 }}>
                            {presentDays}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                          {formatRupiah(totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#0F172A' }}>
                      <td colSpan={4} style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                        Total Uang Makan — {summaries.length} karyawan aktif, {monthLabel}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, fontSize: 16, color: 'white' }}>
                        {formatRupiah(grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Per-employee breakdown cards */}
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Detail per Karyawan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {summaries.map(({ employee: emp, presentDays, totalAmount, statusBreakdown }) => (
                <div key={emp.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar name={emp.name} id={emp.id} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{emp.position ?? '-'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{formatRupiah(totalAmount)}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{presentDays} hari × {formatRupiah(emp.mealAllowance)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {Object.entries(statusBreakdown).map(([s, count]) => {
                      const cfg = STATUS_COLORS[s as AttendanceStatus];
                      if (!cfg) return null;
                      return (
                        <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}25`, fontWeight: 500 }}>
                          {STATUS_LABELS[s as AttendanceStatus]}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
