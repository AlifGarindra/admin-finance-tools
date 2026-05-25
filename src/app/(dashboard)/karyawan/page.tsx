'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Toast } from '@/components/shared/Toast';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApi } from '@/hooks/useApi';
import { Employee } from '@/types';
import { formatRupiah, formatDate } from '@/lib/utils';

// Employee modal
function EmployeeModal({ isOpen, onClose, employee, onSave }: {
  isOpen: boolean; onClose: () => void;
  employee: Employee | null;
  onSave: (data: Partial<Employee>) => void;
}) {
  const isEdit = !!employee;
  const [form, setForm] = useState({
    name: '', position: '', department: '', joinDate: new Date().toISOString().slice(0, 10),
    mealAllowance: 40000, normalCheckIn: '08:00', lateToleranceMinutes: 15, isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        position: employee.position ?? '',
        department: employee.department ?? '',
        joinDate: employee.joinDate.slice(0, 10),
        mealAllowance: employee.mealAllowance,
        normalCheckIn: employee.normalCheckIn,
        lateToleranceMinutes: employee.lateToleranceMinutes,
        isActive: employee.isActive,
      });
    } else {
      setForm({ name: '', position: '', department: '', joinDate: new Date().toISOString().slice(0, 10), mealAllowance: 40000, normalCheckIn: '08:00', lateToleranceMinutes: 15, isActive: true });
    }
    setErrors({});
  }, [employee, isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key: string, val: unknown) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.position.trim()) errs.position = 'Jabatan wajib diisi';
    if (form.mealAllowance <= 0) errs.mealAllowance = 'Tarif harus lebih dari 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500 as const, color: '#475569', marginBottom: 5 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#0F172A' }}>{isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', color: '#64748B' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="cth. Budi Santoso" style={{ ...inputStyle, borderColor: errors.name ? '#EF4444' : '#E2E8F0', background: errors.name ? '#FEF2F2' : 'white' }} />
              {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{errors.name}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Jabatan *</label>
              <input value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="cth. Staff Admin" style={{ ...inputStyle, borderColor: errors.position ? '#EF4444' : '#E2E8F0', background: errors.position ? '#FEF2F2' : 'white' }} />
              {errors.position && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{errors.position}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Departemen</label>
              <input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="cth. Operasional" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Tarif Makan/Hari (Rp) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#64748B', pointerEvents: 'none' }}>Rp</span>
                <input type="number" value={form.mealAllowance} onChange={(e) => set('mealAllowance', Number(e.target.value))} min={0} step={1000}
                  style={{ ...inputStyle, paddingLeft: 36, borderColor: errors.mealAllowance ? '#EF4444' : '#E2E8F0' }} />
              </div>
              {errors.mealAllowance && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{errors.mealAllowance}</p>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Jam Masuk Normal</label>
              <input type="time" value={form.normalCheckIn} onChange={(e) => set('normalCheckIn', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Toleransi Terlambat (menit)</label>
              <input type="number" value={form.lateToleranceMinutes} onChange={(e) => set('lateToleranceMinutes', Number(e.target.value))} min={0} max={120} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Tanggal Bergabung</label>
              <input type="date" value={form.joinDate} onChange={(e) => set('joinDate', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 4 }}>
              <input type="checkbox" id="emp-active" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#4F46E5', cursor: 'pointer' }} />
              <label htmlFor="emp-active" style={{ fontSize: 13, color: '#0F172A', cursor: 'pointer', fontWeight: 500 }}>Karyawan aktif</label>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>— Non-aktif tidak muncul di tabel absensi</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'white', color: '#475569', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Batal</button>
          <button onClick={handleSave} style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Employee card
function EmployeeCard({ emp, onEdit, onToggle }: { emp: Employee; onEdit: () => void; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', padding: 20, boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.18s', position: 'relative', opacity: emp.isActive ? 1 : 0.65 }}
    >
      {!emp.isActive && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Non-aktif</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar name={emp.name} id={emp.id} size={46} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{emp.name}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{emp.position ?? '-'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        {emp.department && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
            <span style={{ color: '#94A3B8', width: 14 }}>🏢</span> {emp.department}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14 }}>🗓</span>
          Bergabung {formatDate(emp.joinDate)}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14 }}>🍱</span>
          Tarif makan <strong style={{ color: '#0F172A' }}>{formatRupiah(emp.mealAllowance)}</strong>/hari
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14 }}>🕐</span>
          Masuk {emp.normalCheckIn}, toleransi {emp.lateToleranceMinutes} mnt
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
        <button onClick={onEdit} style={{ background: 'white', color: '#475569', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Pencil size={12} /> Edit
        </button>
        <button onClick={onToggle} style={{ background: 'white', color: emp.isActive ? '#EF4444' : '#10B981', border: `1px solid ${emp.isActive ? '#FCA5A5' : '#6EE7B7'}`, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
          {emp.isActive ? 'Non-aktifkan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}

export default function KaryawanPage() {
  const { get, post, put } = useApi();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Employee | null>(null);
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const emps = await get('/api/employees?includeInactive=true');
      setEmployees(emps);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [get]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filtered = employees.filter((e) => {
    if (filter === 'active') return e.isActive;
    if (filter === 'inactive') return !e.isActive;
    return true;
  });

  const handleSave = async (data: Partial<Employee>) => {
    try {
      if (editingEmp) {
        await put(`/api/employees/${editingEmp.id}`, data);
        setToast({ message: 'Karyawan berhasil diperbarui', type: 'success' });
      } else {
        await post('/api/employees', data);
        setToast({ message: 'Karyawan berhasil ditambahkan', type: 'success' });
      }
      fetchEmployees();
    } catch {
      setToast({ message: 'Gagal menyimpan data karyawan', type: 'error' });
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    try {
      await put(`/api/employees/${confirmToggle.id}`, { isActive: !confirmToggle.isActive });
      setToast({ message: confirmToggle.isActive ? 'Karyawan berhasil dinonaktifkan' : 'Karyawan berhasil diaktifkan', type: 'success' });
      fetchEmployees();
    } catch {
      setToast({ message: 'Gagal mengubah status karyawan', type: 'error' });
    }
    setConfirmToggle(null);
  };

  const activeCount = employees.filter((e) => e.isActive).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Karyawan</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>{activeCount} aktif dari {employees.length} total karyawan</p>
        </div>
        <button onClick={() => { setEditingEmp(null); setModalOpen(true); }} style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Tambah Karyawan
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['active', 'inactive', 'all'] as const).map((val) => {
            const labels = { active: 'Aktif', inactive: 'Non-aktif', all: 'Semua' };
            const isActive = filter === val;
            return (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s', background: isActive ? '#4F46E5' : 'white', color: isActive ? 'white' : '#475569', borderColor: isActive ? '#4F46E5' : '#E2E8F0' }}>
                {labels[val]}
                {val === 'active' && (
                  <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: isActive ? 'rgba(255,255,255,0.25)' : '#EEF2FF', color: isActive ? 'white' : '#4F46E5', padding: '1px 6px', borderRadius: 10 }}>
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Memuat data...</div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((emp) => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                onEdit={() => { setEditingEmp(emp); setModalOpen(true); }}
                onToggle={() => setConfirmToggle(emp)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="👥"
            title="Tidak ada karyawan"
            description="Coba ubah filter atau tambah karyawan baru."
          />
        )}
      </div>

      <EmployeeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} employee={editingEmp} onSave={handleSave} />

      <ConfirmDialog
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        title={confirmToggle?.isActive ? 'Non-aktifkan Karyawan' : 'Aktifkan Karyawan'}
        message={confirmToggle?.isActive
          ? `Yakin ingin menonaktifkan ${confirmToggle?.name}? Karyawan tidak akan muncul di tabel absensi.`
          : `Aktifkan kembali ${confirmToggle?.name}? Karyawan akan muncul kembali di tabel absensi.`}
        confirmLabel={confirmToggle?.isActive ? 'Non-aktifkan' : 'Aktifkan'}
        isDanger={!!confirmToggle?.isActive}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
