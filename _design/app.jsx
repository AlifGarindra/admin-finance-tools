// ============================================================
// app.jsx — Root App + Context
// ============================================================

// Export AppContext BEFORE render so page components can look it up globally
const AppContext = React.createContext(null);
Object.assign(window, { AppContext });

// Tweak defaults — host rewrites the JSON block between these markers on disk
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#4F46E5"
}/*EDITMODE-END*/;

function App() {
  // ── State ──────────────────────────────────────────────────
  const [activePage, setActivePage] = React.useState('dashboard');
  const [attendanceData, setAttendanceData] = React.useState(INITIAL_ATTENDANCE);
  const [employees, setEmployees] = React.useState(INITIAL_EMPLOYEES);
  const [settings, setSettings] = React.useState(INITIAL_SETTINGS);
  const [toast, setToast] = React.useState(null);

  // ── Tweaks — useTweaks returns [values, setTweak] array ───
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply CSS custom properties on :root
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', tweaks.accentColor);
    root.style.setProperty('--color-primary-light', tweaks.accentColor + '2e');
  }, [tweaks.accentColor]);

  // ── Actions ────────────────────────────────────────────────
  const showToast = React.useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const updateAttendance = React.useCallback((empId, day, data) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || {}), [day]: data },
    }));
    showToast('Absensi berhasil disimpan');
  }, [showToast]);

  const addEmployee = React.useCallback((emp) => {
    setEmployees(prev => [...prev, { ...emp, id: Date.now() }]);
    showToast('Karyawan berhasil ditambahkan');
  }, [showToast]);

  const updateEmployee = React.useCallback((id, data) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    showToast('Data karyawan berhasil diperbarui');
  }, [showToast]);

  const updateSettings = React.useCallback((data) => {
    setSettings(prev => ({ ...prev, ...data }));
    showToast('Pengaturan berhasil disimpan');
  }, [showToast]);

  // ── Context ────────────────────────────────────────────────
  const ctx = React.useMemo(() => ({
    activePage, setActivePage,
    attendanceData, updateAttendance,
    employees, addEmployee, updateEmployee,
    settings, updateSettings,
    showToast,
  }), [activePage, attendanceData, employees, settings]);

  // ── Pages ──────────────────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <DashboardPage />;
      case 'absensi':     return <AbsensiPage />;
      case 'uang-makan':  return <UangMakanPage />;
      case 'karyawan':    return <KaryawanPage />;
      case 'pengaturan':  return <PengaturanPage />;
      default:            return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main style={{
          flex: 1, overflow: 'hidden', minWidth: 0,
          display: 'flex', flexDirection: 'column',
          background: '#F8FAFC',
        }}>
          {renderPage()}
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="Warna Tema">
          <TweakColor
            label="Warna Aksen"
            value={tweaks.accentColor}
            options={['#4F46E5', '#059669', '#7C3AED', '#E11D48']}
            onChange={v => setTweak('accentColor', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </AppContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
