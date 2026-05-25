'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Toast } from '@/components/shared/Toast';
import { useApi } from '@/hooks/useApi';
import { MEAL_ELIGIBLE_STATUSES, ATTENDANCE_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/lib/attendance-utils';
import { AttendanceStatus } from '@/types';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Senin', TUESDAY: 'Selasa', WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis', FRIDAY: 'Jumat', SATURDAY: 'Sabtu', SUNDAY: 'Minggu',
};
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const sectionStyle = { background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const sectionTitleStyle = { fontSize: 15, fontWeight: 700 as const, color: '#0F172A', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #F1F5F9' };
const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14, flexWrap: 'wrap' as const };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500 as const, color: '#475569', marginBottom: 5 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const };

export default function PengaturanPage() {
  const { get, put } = useApi();
  const [form, setForm] = useState({
    companyName: '',
    normalCheckIn: '08:00',
    lateToleranceMinutes: '15',
    defaultMealAllowance: '40000',
    workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    deductOnAlpha: 'true',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await get('/api/settings');
      setForm((prev) => ({
        ...prev,
        companyName: data.companyName ?? '',
        normalCheckIn: data.normalCheckIn ?? '08:00',
        lateToleranceMinutes: data.lateToleranceMinutes ?? '15',
        defaultMealAllowance: data.defaultMealAllowance ?? '40000',
        workDays: data.workDays ? JSON.parse(data.workDays) : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        deductOnAlpha: data.deductOnAlpha ?? 'true',
      }));
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [get]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (key: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const toggleDay = (day: string) => {
    setForm((prev) => {
      const next = prev.workDays.includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day];
      return { ...prev, workDays: next };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await put('/api/settings', {
        ...form,
        workDays: JSON.stringify(form.workDays),
      });
      setSaved(true);
      setToast({ message: 'Pengaturan berhasil disimpan', type: 'success' });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setToast({ message: 'Gagal menyimpan pengaturan', type: 'error' });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Memuat pengaturan...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Pengaturan</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>Konfigurasi perusahaan dan aturan kehadiran</p>
        </div>
        <button
          onClick={handleSave}
          style={{ background: saved ? '#10B981' : '#4F46E5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {saved && <Check size={14} />}
          {saved ? 'Tersimpan' : 'Simpan Pengaturan'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Company */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Informasi Perusahaan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Perusahaan</label>
              <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="HR Admin Tool" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Tarif Makan Default (Rp/hari)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748B', pointerEvents: 'none' }}>Rp</span>
                <input type="number" value={form.defaultMealAllowance} onChange={(e) => set('defaultMealAllowance', e.target.value)} min={0} step={1000} style={{ ...inputStyle, paddingLeft: 36 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance rules */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Aturan Kehadiran</h2>
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>Jam Masuk Normal</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Waktu check-in yang dianggap tepat waktu</div>
            </div>
            <input type="time" value={form.normalCheckIn} onChange={(e) => set('normalCheckIn', e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 130 }} />
          </div>
          <div style={rowStyle}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>Toleransi Keterlambatan</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Menit setelah jam masuk yang masih tepat waktu</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={form.lateToleranceMinutes} min={0} max={60} step={5} onChange={(e) => set('lateToleranceMinutes', e.target.value)} style={{ ...inputStyle, width: 80, textAlign: 'center' }} />
              <span style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>menit</span>
            </div>
          </div>
        </div>

        {/* Work days */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Hari Kerja</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>Pilih hari yang dihitung sebagai hari kerja.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAY_ORDER.map((day) => {
              const isOn = form.workDays.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)} style={{ padding: '8px 18px', borderRadius: 8, border: '2px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s', background: isOn ? '#4F46E5' : 'white', color: isOn ? 'white' : '#475569', borderColor: isOn ? '#4F46E5' : '#E2E8F0' }}>
                  {DAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal allowance rules */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Status yang Berhak Uang Makan</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Status kehadiran yang otomatis mendapat uang makan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 16 }}>
            {ATTENDANCE_STATUSES.map((s) => {
              const eligible = MEAL_ELIGIBLE_STATUSES.includes(s as AttendanceStatus);
              const cfg = STATUS_COLORS[s as AttendanceStatus];
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: eligible ? cfg.bg : '#F8FAFC', border: `1px solid ${eligible ? cfg.color + '40' : '#E2E8F0'}` }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: eligible ? cfg.color : '#CBD5E1', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: eligible ? cfg.color : '#94A3B8' }}>{STATUS_LABELS[s as AttendanceStatus]}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: eligible ? cfg.color : '#CBD5E1' }}>{eligible ? '✓ Dapat' : '✗ Tidak'}</span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 13, color: '#92400E' }}>
            Aturan uang makan dapat diubah di konfigurasi aplikasi. Saat ini: Hadir, Terlambat, WFH, Dinas Luar, Sidang, Pendampingan.
          </div>
        </div>

        {/* Deduction */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Aturan Potongan</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5' }}>
            <input type="checkbox" id="potong-alpha" checked={form.deductOnAlpha === 'true'} onChange={(e) => set('deductOnAlpha', e.target.checked ? 'true' : 'false')} style={{ width: 16, height: 16, accentColor: '#EF4444', cursor: 'pointer', flexShrink: 0 }} />
            <div>
              <label htmlFor="potong-alpha" style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>Potong uang makan untuk status <strong>Alpha</strong></label>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Karyawan yang Alpha tidak hadir tanpa keterangan akan dipotong uang makan.</div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
