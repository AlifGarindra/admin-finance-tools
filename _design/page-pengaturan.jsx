// ============================================================
// page-pengaturan.jsx — Settings
// ============================================================

function PengaturanPage() {
  const ctx = React.useContext(AppContext);
  const settings = ctx ? ctx.settings : INITIAL_SETTINGS;
  const updateSettings = ctx ? ctx.updateSettings : () => {};
  const showToast = ctx ? ctx.showToast : () => {};

  const [form, setForm] = React.useState({ ...settings });
  const [saved, setSaved] = React.useState(false);

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const toggleHariKerja = (day) => {
    setForm(prev => {
      const current = prev.hariKerja || [];
      const next = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day].sort();
      return { ...prev, hariKerja: next };
    });
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const DAY_LABELS = { 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu', 0: 'Minggu' };

  const sectionStyle = {
    background: 'white', borderRadius: 14, border: '1px solid #E2E8F0',
    padding: '20px 24px', marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const sectionTitleStyle = {
    fontSize: 15, fontWeight: 700, color: '#0F172A',
    marginBottom: 18, paddingBottom: 12,
    borderBottom: '1px solid #F1F5F9',
  };
  const rowStyle = {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16,
    marginBottom: 14, flexWrap: 'wrap',
  };
  const rowLabelStyle = { fontSize: 13, fontWeight: 500, color: '#0F172A', minWidth: 200 };
  const rowSubStyle = { fontSize: 12, color: '#94A3B8', marginTop: 2 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Pengaturan"
        subtitle="Konfigurasi perusahaan dan aturan kehadiran"
        actions={
          <button onClick={handleSave} style={{
            ...sharedStyles.btnPrimary,
            background: saved ? '#10B981' : 'var(--color-primary)',
          }}>
            {saved ? <><Icons.Check /> Tersimpan</> : 'Simpan Pengaturan'}
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* Company Info */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Informasi Perusahaan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <FormInput label="Nama Perusahaan" value={form.namaPerusahaan || ''}
              onChange={e => set('namaPerusahaan', e.target.value)} />
            <FormInput label="Tarif Makan Default (Rp/hari)" value={form.tarifMakanDefault || 25000}
              type="number" min={0} step={1000}
              onChange={e => set('tarifMakanDefault', Number(e.target.value))} />
          </div>
        </div>

        {/* Attendance rules */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Aturan Kehadiran</h2>

          <div style={rowStyle}>
            <div>
              <div style={rowLabelStyle}>Jam Masuk Normal</div>
              <div style={rowSubStyle}>Waktu check-in yang dianggap tepat waktu</div>
            </div>
            <input type="time" value={form.jamMasuk}
              onChange={e => set('jamMasuk', e.target.value)}
              style={{ ...sharedStyles.input, width: 'auto', padding: '8px 12px', minWidth: 130 }} />
          </div>

          <div style={rowStyle}>
            <div>
              <div style={rowLabelStyle}>Toleransi Keterlambatan</div>
              <div style={rowSubStyle}>Menit setelah jam masuk yang masih dianggap tepat waktu</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={form.toleransiMenit} min={0} max={60} step={5}
                onChange={e => set('toleransiMenit', Number(e.target.value))}
                style={{ ...sharedStyles.input, width: 80, textAlign: 'center' }} />
              <span style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>menit</span>
            </div>
          </div>
        </div>

        {/* Work days */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Hari Kerja</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
            Pilih hari yang dihitung sebagai hari kerja. Hari di luar ini akan otomatis ditandai libur.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 0].map(day => {
              const isOn = (form.hariKerja || []).includes(day);
              return (
                <button key={day} onClick={() => toggleHariKerja(day)} style={{
                  padding: '8px 18px', borderRadius: 8, border: '2px solid',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                  background: isOn ? 'var(--color-primary)' : 'white',
                  color: isOn ? 'white' : '#475569',
                  borderColor: isOn ? 'var(--color-primary)' : '#E2E8F0',
                }}>
                  {DAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal allowance rules */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Aturan Uang Makan</h2>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
            Tentukan status kehadiran mana yang berhak mendapat uang makan.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const eligible = MEAL_ELIGIBLE.includes(key);
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  background: eligible ? cfg.bg : '#F8FAFC',
                  border: `1px solid ${eligible ? cfg.color + '40' : '#E2E8F0'}`,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: eligible ? cfg.color : '#CBD5E1', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: eligible ? cfg.color : '#94A3B8' }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                    color: eligible ? cfg.color : '#CBD5E1',
                  }}>
                    {eligible ? '✓ Dapat' : '✗ Tidak'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 16, padding: '12px 14px', background: '#FFFBEB',
            borderRadius: 8, border: '1px solid #FDE68A', fontSize: 13, color: '#92400E',
          }}>
            Status yang berhak uang makan dapat diubah melalui pengembang. Saat ini: Hadir, Terlambat, WFH, Dinas Luar, Sidang, Pendampingan.
          </div>
        </div>

        {/* Deduction rules */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Aturan Potongan</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FCA5A5' }}>
            <input type="checkbox" id="potong-alpha" checked={form.potonganAlpha}
              onChange={e => set('potonganAlpha', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#EF4444', cursor: 'pointer', flexShrink: 0 }} />
            <div>
              <label htmlFor="potong-alpha" style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                Potong uang makan untuk status <strong>Alpha</strong>
              </label>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                Karyawan yang Alpha (tidak hadir tanpa keterangan) akan dipotong uang makan sejumlah tarif per hari.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { PengaturanPage });
