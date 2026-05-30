// ============================================================
// page-karyawan.jsx — Employee Management
// ============================================================

function EmployeeModal({ isOpen, onClose, employee, onSave }) {
  const isEdit = !!employee;
  const [form, setForm] = React.useState(employee ? {
    name: employee.name, role: employee.role,
    tarif: employee.tarif, phone: employee.phone,
    email: employee.email, joinDate: employee.joinDate,
    active: employee.active,
  } : {
    name: '', role: '', tarif: 25000,
    phone: '', email: '', joinDate: new Date().toISOString().slice(0, 10),
    active: true,
  });
  const [errors, setErrors] = React.useState({});

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.role.trim()) errs.role = 'Jabatan wajib diisi';
    if (!form.email.trim()) errs.email = 'Email wajib diisi';
    if (form.tarif <= 0) errs.tarif = 'Tarif harus lebih dari 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, tarif: Number(form.tarif) });
    onClose();
  };

  const ROLES = ['Staff Admin', 'HR Officer', 'Finance Staff', 'Marketing Staff', 'IT Support', 'Manager', 'Direktur', 'Lainnya'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
      width={520}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={sharedStyles.btnSecondary}>Batal</button>
          <button onClick={handleSave} style={sharedStyles.btnPrimary}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <FormInput label="Nama Lengkap *" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="cth. Budi Santoso" error={errors.name} />
        </div>
        <FormSelect label="Jabatan *" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="">Pilih jabatan...</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </FormSelect>
        <div>
          <label style={sharedStyles.label}>Tarif Makan/Hari (Rp) *</label>
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 13, color: '#64748B', pointerEvents: 'none',
              }}>Rp</span>
              <input type="number" value={form.tarif} onChange={e => set('tarif', e.target.value)}
                style={{ ...sharedStyles.input, paddingLeft: 36 }}
                min={0} step={1000} />
            </div>
            {errors.tarif && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{errors.tarif}</p>}
          </div>
        </div>
        <FormInput label="Email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="nama@perusahaan.co.id" error={errors.email} type="email" />
        <FormInput label="No. HP" value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="0812-xxxx-xxxx" />
        <FormInput label="Tanggal Bergabung" value={form.joinDate} onChange={e => set('joinDate', e.target.value)}
          type="date" />
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <input type="checkbox" id="emp-active" checked={form.active} onChange={e => set('active', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
          <label htmlFor="emp-active" style={{ fontSize: 13, color: '#0F172A', cursor: 'pointer', fontWeight: 500 }}>
            Karyawan aktif
          </label>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>— Karyawan non-aktif tidak muncul di tabel absensi</span>
        </div>
      </div>
    </Modal>
  );
}

// ── Employee Card ─────────────────────────────────────────────
function EmployeeCard({ emp, onEdit, onDeactivate }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 14, border: '1px solid #E2E8F0',
        padding: '20px', boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
        opacity: emp.active ? 1 : 0.6,
      }}
    >
      {/* Inactive badge */}
      {!emp.active && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#FEF2F2', color: '#DC2626', fontSize: 10,
          fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          Non-aktif
        </div>
      )}

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar name={emp.name} id={emp.id} size={46} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{emp.name}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{emp.role}</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14, flexShrink: 0 }}>📧</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14, flexShrink: 0 }}>📱</span>
          {emp.phone}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14, flexShrink: 0 }}>🗓</span>
          Bergabung {new Date(emp.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#475569' }}>
          <span style={{ color: '#94A3B8', width: 14, flexShrink: 0 }}>🍱</span>
          Tarif makan <strong style={{ color: '#0F172A' }}>{formatRupiah(emp.tarif)}</strong>/hari
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
        <button onClick={() => onEdit(emp)} style={{
          ...sharedStyles.btnSecondary, fontSize: 12, padding: '6px 12px', flex: 1,
          justifyContent: 'center',
        }}>
          <Icons.Edit /> Edit
        </button>
        <button onClick={() => onDeactivate(emp)} style={{
          ...sharedStyles.btnSecondary, fontSize: 12, padding: '6px 10px',
          color: emp.active ? '#EF4444' : '#10B981',
          borderColor: emp.active ? '#FCA5A5' : '#6EE7B7',
        }}>
          {emp.active ? 'Non-aktifkan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}

// ── Karyawan Page ─────────────────────────────────────────────
function KaryawanPage() {
  const ctx = React.useContext(AppContext);
  const employees = ctx ? ctx.employees : INITIAL_EMPLOYEES;
  const addEmployee = ctx ? ctx.addEmployee : () => {};
  const updateEmployee = ctx ? ctx.updateEmployee : () => {};
  const showToast = ctx ? ctx.showToast : () => {};

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingEmp, setEditingEmp] = React.useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(null);
  const [filter, setFilter] = React.useState('active');

  const filtered = employees.filter(e => {
    if (filter === 'active') return e.active;
    if (filter === 'inactive') return !e.active;
    return true;
  });

  const handleEdit = (emp) => { setEditingEmp(emp); setModalOpen(true); };
  const handleAdd = () => { setEditingEmp(null); setModalOpen(true); };
  const handleSave = (data) => {
    if (editingEmp) updateEmployee(editingEmp.id, data);
    else addEmployee(data);
  };
  const handleDeactivate = (emp) => setConfirmDeactivate(emp);
  const doDeactivate = () => {
    updateEmployee(confirmDeactivate.id, { active: !confirmDeactivate.active });
    showToast(confirmDeactivate.active ? 'Karyawan berhasil dinonaktifkan' : 'Karyawan berhasil diaktifkan');
    setConfirmDeactivate(null);
  };

  const activeCount = employees.filter(e => e.active).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Karyawan"
        subtitle={`${activeCount} aktif dari ${employees.length} total karyawan`}
        actions={
          <button onClick={handleAdd} style={sharedStyles.btnPrimary}>
            <Icons.Plus /> Tambah Karyawan
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[['active', 'Aktif'], ['inactive', 'Non-aktif'], ['all', 'Semua']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s',
              background: filter === val ? 'var(--color-primary)' : 'white',
              color: filter === val ? 'white' : '#475569',
              borderColor: filter === val ? 'var(--color-primary)' : '#E2E8F0',
            }}>
              {label}
              {val === 'active' && (
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  background: filter === val ? 'rgba(255,255,255,0.25)' : '#EEF2FF',
                  color: filter === val ? 'white' : 'var(--color-primary)',
                  padding: '1px 6px', borderRadius: 10,
                }}>
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(emp => (
              <EmployeeCard key={emp.id} emp={emp} onEdit={handleEdit} onDeactivate={handleDeactivate} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Tidak ada karyawan</div>
            <div style={{ fontSize: 13 }}>Coba ubah filter atau tambah karyawan baru.</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmp}
        onSave={handleSave}
      />

      {/* Deactivate confirm */}
      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={doDeactivate}
        title={confirmDeactivate?.active ? 'Non-aktifkan Karyawan' : 'Aktifkan Karyawan'}
        message={confirmDeactivate?.active
          ? `Yakin ingin menonaktifkan ${confirmDeactivate?.name}? Karyawan tidak akan muncul di tabel absensi.`
          : `Aktifkan kembali ${confirmDeactivate?.name}? Karyawan akan muncul kembali di tabel absensi.`}
        confirmLabel={confirmDeactivate?.active ? 'Non-aktifkan' : 'Aktifkan'}
        isDanger={!!confirmDeactivate?.active}
      />
    </div>
  );
}

Object.assign(window, { KaryawanPage });
