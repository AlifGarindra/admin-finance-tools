// ============================================================
// page-uang-makan.jsx — Meal Allowance
// ============================================================

function UangMakanPage() {
  const ctx = React.useContext(AppContext);
  const employees = ctx ? ctx.employees : INITIAL_EMPLOYEES;
  const attendanceData = ctx ? ctx.attendanceData : INITIAL_ATTENDANCE;
  const showToast = ctx ? ctx.showToast : () => {};

  const [exportLoading, setExportLoading] = React.useState(false);
  const activeEmployees = employees.filter(e => e.active);

  const rows = activeEmployees.map(emp => {
    const empData = attendanceData[emp.id] || {};
    const records = Object.values(empData);
    const hariHadir = records.filter(r => MEAL_ELIGIBLE.includes(r.status)).length;
    const hariAlpha = records.filter(r => r.status === 'alpha').length;
    const potongan = hariAlpha * emp.tarif;
    const total = hariHadir * emp.tarif - potongan;
    return { emp, hariHadir, hariAlpha, potongan, total };
  });

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      showToast('Rekap uang makan berhasil diunduh');
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Uang Makan"
        subtitle="Rekap tunjangan makan — Mei 2026"
        actions={
          <>
            <MonthNav label="Mei 2026" />
            <button onClick={handleExport} style={sharedStyles.btnPrimary} disabled={exportLoading}>
              <Icons.Download />
              {exportLoading ? 'Mengunduh...' : 'Export Excel'}
            </button>
          </>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* Info banner */}
        <div style={{
          background: '#EEF2FF', border: '1px solid #C7D2FE',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: '#4338CA',
        }}>
          <Icons.AlertCircle />
          <span>
            Uang makan dihitung berdasarkan hari hadir (termasuk WFH, Terlambat, Dinas Luar, Sidang, Pendampingan).
            Potongan berlaku untuk status <strong>Alpha</strong>.
          </span>
        </div>

        {/* Table */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #E2E8F0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Karyawan', 'Jabatan', 'Tarif/Hari', 'Hari Hadir', 'Hari Alpha', 'Potongan', 'Total'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: i >= 2 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 600, color: '#64748B',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid #E2E8F0',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ emp, hariHadir, hariAlpha, potongan, total }, i) => (
                <tr key={emp.id} style={{
                  background: i % 2 === 0 ? 'white' : '#FAFAFA',
                  borderBottom: '1px solid #F1F5F9',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#FAFAFA'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={emp.name} id={emp.id} size={34} />
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748B' }}>{emp.role}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#0F172A', fontWeight: 500 }}>
                    {formatRupiah(emp.tarif)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 28, borderRadius: 6,
                      background: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: 13,
                    }}>
                      {hariHadir}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {hariAlpha > 0 ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 28, borderRadius: 6,
                        background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13,
                      }}>
                        {hariAlpha}
                      </span>
                    ) : (
                      <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: potongan > 0 ? '#DC2626' : '#CBD5E1', fontWeight: potongan > 0 ? 500 : 400 }}>
                    {potongan > 0 ? `- ${formatRupiah(potongan)}` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                    {formatRupiah(total)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand total footer */}
            <tfoot>
              <tr style={{ background: '#0F172A', position: 'sticky', bottom: 0 }}>
                <td colSpan={6} style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                  Total Uang Makan — {activeEmployees.length} karyawan aktif, Mei 2026
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, fontSize: 16, color: 'white' }}>
                  {formatRupiah(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Per-employee breakdown cards */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Detail per Karyawan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {rows.map(({ emp, hariHadir, total }) => {
              const empData = attendanceData[emp.id] || {};
              const statusBreakdown = {};
              Object.values(empData).forEach(r => {
                statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
              });
              return (
                <div key={emp.id} style={{
                  background: 'white', borderRadius: 12, border: '1px solid #E2E8F0',
                  padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <Avatar name={emp.name} id={emp.id} size={38} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{emp.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{formatRupiah(total)}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{hariHadir} hari × {formatRupiah(emp.tarif)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {Object.entries(statusBreakdown).map(([s, count]) => {
                      const cfg = STATUS_CONFIG[s];
                      if (!cfg) return null;
                      return (
                        <span key={s} style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 5,
                          background: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.color}25`, fontWeight: 500,
                        }}>
                          {cfg.label}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { UangMakanPage });
