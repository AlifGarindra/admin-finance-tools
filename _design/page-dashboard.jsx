// ============================================================
// page-dashboard.jsx — Dashboard
// ============================================================

function DashboardPage({ attendanceData, employees }) {
  const ctx = React.useContext(AppContext);
  const empList = ctx ? ctx.employees : employees || INITIAL_EMPLOYEES;
  const attData = ctx ? ctx.attendanceData : attendanceData || INITIAL_ATTENDANCE;

  const activeEmployees = empList.filter(e => e.active);

  // Last working day data (May 22)
  const lastWorkDay = 22;
  const todayStatus = empList.map(emp => {
    const rec = (attData[emp.id] || {})[lastWorkDay];
    return { emp, rec };
  });

  const hadirCount = todayStatus.filter(({ rec }) => rec && ['hadir', 'terlambat', 'wfh', 'dinas_luar'].includes(rec.status)).length;

  // Monthly meal total
  const totalMakan = empList.reduce((sum, emp) => {
    const eligible = calcMealEligibleDays(emp.id, attData);
    return sum + eligible * emp.tarif;
  }, 0);

  // Today's attendance for the quick table
  const days = getDaysInMonth(2026, 4);
  const lastDay = days.find(d => d.day === lastWorkDay);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Dashboard"
        subtitle={`Jumat, 22 Mei 2026 — Simbolon & Partners`}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* Summary Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <SummaryCard
            label="Hadir Jum'at Kemarin"
            value={`${hadirCount}/${activeEmployees.length}`}
            sub="22 Mei 2026 (hari kerja terakhir)"
            icon={<Icons.Users />}
            color="#4F46E5"
          />
          <SummaryCard
            label="Karyawan Aktif"
            value={activeEmployees.length}
            sub={`dari ${empList.length} total karyawan`}
            icon={<Icons.User />}
            color="#10B981"
          />
          <SummaryCard
            label="Uang Makan Bulan Ini"
            value={formatRupiah(totalMakan)}
            sub="Estimasi s/d Mei 2026"
            icon={<Icons.Money />}
            color="#F59E0B"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* Attendance quick view */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Absensi Jum&apos;at, 22 Mei 2026</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Hari kerja terakhir</p>
              </div>
              <button
                onClick={() => ctx && ctx.setActivePage('absensi')}
                style={{ ...sharedStyles.btnSecondary, fontSize: 12, padding: '6px 12px' }}
              >
                Lihat Semua
              </button>
            </div>
            <div>
              {todayStatus.map(({ emp, rec }, i) => (
                <div key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                  background: i % 2 === 0 ? 'white' : '#FAFAFA',
                  borderBottom: i < todayStatus.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}>
                  <Avatar name={emp.name} id={emp.id} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{emp.role}</div>
                  </div>
                  {rec ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <StatusBadge status={rec.status} />
                      {rec.timeIn && (
                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Icons.Clock /> {rec.timeIn} – {rec.timeOut}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#CBD5E1' }}>Belum diinput</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status distribution */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Rekap Status Bulan Ini</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Mei 2026</p>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                let count = 0;
                empList.forEach(emp => {
                  const empData = attData[emp.id] || {};
                  count += Object.values(empData).filter(r => r.status === key).length;
                });
                if (count === 0) return null;
                const total = empList.reduce((s, emp) => s + Object.keys(attData[emp.id] || {}).length, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage });
