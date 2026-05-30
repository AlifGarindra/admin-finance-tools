// ============================================================
// page-absensi.jsx — Attendance Table + Inline Edit (core feature)
// ============================================================

// ── Attendance Popover ────────────────────────────────────────
function AttendancePopover({ popover, onSave, onClose }) {
  const [status, setStatus] = React.useState(popover.currentData?.status || '');
  const [timeIn, setTimeIn] = React.useState(popover.currentData?.timeIn || '');
  const [timeOut, setTimeOut] = React.useState(popover.currentData?.timeOut || '');

  const needsTime = ['hadir', 'terlambat', 'wfh', 'sidang', 'pendampingan', 'dinas_luar'].includes(status);

  // Click-outside close
  React.useEffect(() => {
    const h = (e) => { if (!e.target.closest('[data-popover="attendance"]')) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h), 10);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Escape key
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Smart position: appear below/above cell, flip if near edge
  const W = 296;
  const H = needsTime ? 370 : 290;
  const vW = window.innerWidth;
  const vH = window.innerHeight;
  let top = popover.rect.bottom + 6;
  let left = popover.rect.left;
  if (top + H > vH - 12) top = popover.rect.top - H - 6;
  if (left + W > vW - 12) left = vW - W - 12;
  if (left < 12) left = 12;
  if (top < 12) top = 12;

  const handleSave = () => {
    if (!status) return;
    onSave({ status, timeIn: needsTime ? timeIn : '', timeOut: needsTime ? timeOut : '' });
  };

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  return (
    <div data-popover="attendance" style={{
      position: 'fixed', top, left, zIndex: 3000, width: W,
      background: 'white', borderRadius: 13,
      boxShadow: '0 8px 30px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #E2E8F0',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px 10px', borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
            {popover.dayInfo.dayName}, {popover.day} {MONTH_NAMES[4]} 2026
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{popover.empName}</div>
        </div>
        <button onClick={onClose} style={{
          background: '#F1F5F9', border: 'none', borderRadius: 6,
          padding: 5, cursor: 'pointer', display: 'flex', color: '#64748B',
        }}>
          <Icons.X />
        </button>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Status grid */}
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, marginBottom: 14 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const isSelected = status === key;
            return (
              <button key={key} onClick={() => setStatus(key)} style={{
                padding: '6px 10px', borderRadius: 7, cursor: 'pointer', textAlign: 'left',
                border: `1.5px solid ${isSelected ? cfg.color : '#E2E8F0'}`,
                background: isSelected ? cfg.bg : 'white',
                color: cfg.color, fontWeight: cfg.bold ? 700 : (isSelected ? 600 : 400),
                fontSize: 12, transition: 'all 0.1s',
              }}>
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Time inputs */}
        {needsTime && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jam Kerja</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748B', marginBottom: 3, display: 'block' }}>Masuk</label>
                <input type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px', border: '1px solid #E2E8F0',
                    borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
                    fontFamily: 'inherit', outline: 'none', color: '#0F172A',
                  }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#64748B', marginBottom: 3, display: 'block' }}>Keluar</label>
                <input type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px', border: '1px solid #E2E8F0',
                    borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
                    fontFamily: 'inherit', outline: 'none', color: '#0F172A',
                  }} />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...sharedStyles.btnSecondary, padding: '7px 14px', fontSize: 13 }}>
            Batal
          </button>
          <button onClick={handleSave} disabled={!status} style={{
            ...sharedStyles.btnPrimary,
            padding: '7px 14px', fontSize: 13,
            opacity: status ? 1 : 0.45,
            cursor: status ? 'pointer' : 'not-allowed',
          }}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Attendance Cell ───────────────────────────────────────────
function AttendanceCell({ empId, empName, day, dayInfo, data, onEdit }) {
  const isFuture = !dayInfo.isPast && !dayInfo.isToday;
  const isEditable = !isFuture;
  const cfg = data ? STATUS_CONFIG[data.status] : null;
  const [hovered, setHovered] = React.useState(false);

  return (
    <td
      onClick={isEditable ? (e) => onEdit(e, empId, empName, day, dayInfo, data) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 10px', border: '1px solid #F1F5F9',
        cursor: isEditable ? 'pointer' : 'default',
        minWidth: 140, maxWidth: 180,
        background: hovered && isEditable ? '#F8FAFC' : 'white',
        transition: 'background 0.1s',
        verticalAlign: 'middle', position: 'relative',
      }}
    >
      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StatusBadge status={data.status} size="sm" />
          {(data.timeIn || data.timeOut) && (
            <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icons.Clock />
              {data.timeIn || '--:--'} – {data.timeOut || '--:--'}
            </span>
          )}
        </div>
      ) : isFuture ? (
        <span style={{ color: '#E2E8F0', fontSize: 12, userSelect: 'none' }}>—</span>
      ) : (
        <span style={{
          fontSize: 12, color: hovered ? 'var(--color-primary)' : '#CBD5E1',
          fontWeight: hovered ? 500 : 400, transition: 'color 0.1s',
        }}>
          + Input
        </span>
      )}

      {/* Edit indicator on hover */}
      {data && isEditable && hovered && (
        <div style={{
          position: 'absolute', top: 5, right: 5, color: '#94A3B8', lineHeight: 0,
        }}>
          <Icons.Edit />
        </div>
      )}
    </td>
  );
}

// ── Absensi Page ──────────────────────────────────────────────
function AbsensiPage() {
  const ctx = React.useContext(AppContext);
  const attendanceData = ctx ? ctx.attendanceData : INITIAL_ATTENDANCE;
  const employees = ctx ? ctx.employees : INITIAL_EMPLOYEES;
  const updateAttendance = ctx ? ctx.updateAttendance : () => {};
  const showToast = ctx ? ctx.showToast : () => {};

  const days = getDaysInMonth(2026, 4);
  const activeEmployees = employees.filter(e => e.active);

  const [popover, setPopover] = React.useState(null);
  const [exportLoading, setExportLoading] = React.useState(false);
  const tableRef = React.useRef(null);

  const handleCellEdit = (e, empId, empName, day, dayInfo, currentData) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ empId, empName, day, dayInfo, currentData, rect });
  };

  const handleSave = ({ status, timeIn, timeOut }) => {
    if (!popover) return;
    updateAttendance(popover.empId, popover.day, { status, timeIn, timeOut });
    setPopover(null);
  };

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      showToast('File rekap absensi berhasil diunduh');
    }, 1800);
  };

  // Summary row per employee (bottom of table)
  const getSummary = (empId) => {
    const empData = attendanceData[empId] || {};
    const counts = {};
    Object.values(empData).forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Rekap Absensi"
        subtitle="Mei 2026 — Data hingga hari ini"
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

      {/* Legend */}
      <div style={{
        padding: '8px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>Status:</span>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: cfg.color, fontWeight: cfg.bold ? 700 : 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>Klik sel untuk input/edit</span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }} ref={tableRef}>
        <table style={{
          borderCollapse: 'collapse', fontSize: 13,
          width: 'max-content', minWidth: '100%',
        }}>
          {/* Sticky Header */}
          <thead>
            <tr style={{ position: 'sticky', top: 0, zIndex: 20 }}>
              <th style={{
                position: 'sticky', left: 0, zIndex: 30,
                background: '#0F172A', color: 'white',
                padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12,
                minWidth: 110, letterSpacing: '0.02em',
                borderRight: '2px solid #1E293B',
              }}>
                Tanggal
              </th>
              {activeEmployees.map(emp => (
                <th key={emp.id} style={{
                  background: '#0F172A', color: 'white',
                  padding: '10px 14px', textAlign: 'left', fontWeight: 500, fontSize: 12,
                  minWidth: 150, whiteSpace: 'nowrap',
                  borderRight: '1px solid #1E293B',
                }}>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 400, marginTop: 1 }}>{emp.role}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map(dayInfo => {
              const { day, dayName, isWeekend, isHoliday, holidayName, isPast, isToday } = dayInfo;

              // Weekend row
              if (isWeekend) {
                return (
                  <tr key={day} style={{ background: '#F8FAFC' }}>
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 10,
                      padding: '7px 16px', borderRight: '2px solid #E2E8F0',
                      background: '#F8FAFC',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#CBD5E1', minWidth: 22 }}>{day}</span>
                        <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>{dayName}</span>
                      </div>
                    </td>
                    <td colSpan={activeEmployees.length} style={{ padding: '7px 14px', color: '#CBD5E1', fontSize: 12, fontStyle: 'italic' }}>
                      Libur akhir pekan
                    </td>
                  </tr>
                );
              }

              // Holiday row
              if (isHoliday) {
                return (
                  <tr key={day} style={{ background: '#FFFBEB' }}>
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 10,
                      padding: '7px 16px', borderRight: '2px solid #FDE68A',
                      background: '#FFFBEB',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#D97706', minWidth: 22 }}>{day}</span>
                        <span style={{ fontSize: 11, color: '#D97706', fontWeight: 500 }}>{dayName}</span>
                      </div>
                    </td>
                    <td colSpan={activeEmployees.length} style={{ padding: '7px 14px', color: '#D97706', fontSize: 12, fontWeight: 500 }}>
                      Libur Nasional — {holidayName}
                    </td>
                  </tr>
                );
              }

              // Normal work day
              const isHighlightedRow = isToday;
              const rowBg = isHighlightedRow ? '#EEF2FF' : 'white';

              return (
                <tr key={day} style={{ background: rowBg }}>
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 10,
                    padding: '7px 16px', borderRight: '2px solid #E2E8F0',
                    background: rowBg,
                    borderBottom: '1px solid #F1F5F9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700,
                        color: isToday ? 'var(--color-primary)' : '#0F172A',
                        minWidth: 22,
                      }}>{day}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: isToday ? 'var(--color-primary)' : '#94A3B8',
                      }}>{dayName}</span>
                    </div>
                    {isToday && (
                      <div style={{
                        fontSize: 10, color: 'var(--color-primary)',
                        fontWeight: 600, marginTop: 2, letterSpacing: '0.04em',
                      }}>HARI INI</div>
                    )}
                  </td>
                  {activeEmployees.map(emp => {
                    const rec = (attendanceData[emp.id] || {})[day];
                    return (
                      <AttendanceCell
                        key={emp.id}
                        empId={emp.id}
                        empName={emp.name}
                        day={day}
                        dayInfo={dayInfo}
                        data={rec}
                        onEdit={handleCellEdit}
                      />
                    );
                  })}
                </tr>
              );
            })}

            {/* Summary row */}
            <tr style={{ position: 'sticky', bottom: 0, zIndex: 20, background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
              <td style={{
                position: 'sticky', left: 0, zIndex: 30,
                padding: '10px 16px', fontWeight: 700, fontSize: 12,
                color: '#0F172A', background: '#F8FAFC',
                borderRight: '2px solid #E2E8F0',
              }}>
                TOTAL
              </td>
              {activeEmployees.map(emp => {
                const counts = getSummary(emp.id);
                const hadirTotal = (counts['hadir'] || 0) + (counts['terlambat'] || 0) + (counts['wfh'] || 0) + (counts['dinas_luar'] || 0) + (counts['sidang'] || 0) + (counts['pendampingan'] || 0);
                return (
                  <td key={emp.id} style={{ padding: '8px 10px', borderRight: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{hadirTotal} hadir</span>
                      {counts['alpha'] > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{counts['alpha']} alpha</span>
                      )}
                      {(counts['izin'] || counts['sakit'] || counts['cuti']) > 0 && (
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                          {(counts['izin'] || 0) + (counts['sakit'] || 0) + (counts['cuti'] || 0)} absent
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Popover */}
      {popover && (
        <AttendancePopover
          popover={popover}
          onSave={handleSave}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { AbsensiPage });
