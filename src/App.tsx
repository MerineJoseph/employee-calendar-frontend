import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Calendar from 'react-calendar';
import CustomSelect from './components/CustomSelect';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import LoginPage from './LoginPage';
import AdminPanel from './AdminPanel';

type MapStr = { [k: string]: string };
type Station = 'com' | 'mol';

const API_BASE = 'https://employee-calendar-backend.onrender.com';

const CalendarPage: React.FC = () => {
  const [value, setValue] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<MapStr>({});
  const [publicHolidays, setPublicHolidays] = useState<MapStr>({});
  const [calendarTimes, setCalendarTimes] = useState<MapStr>({});
  const [station, setStation] = useState<Station>('com');
  const userEmail = localStorage.getItem('userEmail') || 'Employee';

  // notes key per station + month
  const notesKey = useMemo(() => {
    const m = value.toLocaleDateString('en-CA').slice(0, 7); // YYYY-MM
    return `notes:${station}:${m}`;
  }, [station, value]);

  const [notes, setNotes] = useState<string>(() => localStorage.getItem(notesKey) || '');

  useEffect(() => {
    setNotes(localStorage.getItem(notesKey) || '');
  }, [notesKey]);

  useEffect(() => {
    fetch(`${API_BASE}/calendar?station=${station}`)
      .then((res) => res.json())
      .then((data) => {
        setCalendarData(data.calendar_data || {});
        setPublicHolidays(data.public_holidays || {});
        setCalendarTimes(data.calendar_times || {});
      })
      .catch(() => {});
  }, [station]);

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toLocaleDateString('en-CA');
    const todayStr = new Date().toLocaleDateString('en-CA');
    const classes: string[] = [];
    if (dateStr === todayStr) classes.push('today');
    if (publicHolidays[dateStr]) classes.push('public-holiday');
    else if (calendarData[dateStr] === 'Holiday') classes.push('holiday');
    else if (calendarData[dateStr] === 'Working') classes.push('working');
    return classes.join(' ');
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toLocaleDateString('en-CA');
    const time = calendarTimes[dateStr];
    const holidayName = publicHolidays[dateStr];
    return (
      <div style={{ fontSize: '0.7em', textAlign: 'center' }}>
        {time && <div>{time}</div>}
        {holidayName && <div style={{ color: '#000' }}>{holidayName}</div>}
      </div>
    );
  };

  const [activeStartDate, setActiveStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [view, setView] = useState<'month' | 'year' | 'decade' | 'century'>('month');

  // 2) build the label from activeStartDate (not from `value`)
  const monthLabel = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' })
    .format(activeStartDate);

  return (
    <div className="App">
      <div className="app-shell">
        <div className="two-col">
          {/* LEFT: Calendar */}
          <div className="calendar-card">
            <div className="top-bar">
              <div className="top-bar-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="top-bar-left-main">{userEmail}
                <button
                  className="emp-log-btn"
                  onClick={() => {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    window.location.href = '/';
                  }}
                >
                  Logout
                </button>
                </div>
              </div>
              <div className="top-bar-right">
                <label >Work Station</label>
                <CustomSelect
                  value={station}
                  onChange={(v) => setStation(v as 'com'|'mol')}
                  options={[
                    { label: 'COM', value: 'com' },
                    { label: 'MOL', value: 'mol' },
                  ]}
                />
              </div>
            </div>
            <div className="month-label">Month: {monthLabel}</div>
            <Calendar
              onChange={(date) => {
                const d = date as Date;
                setValue(d);
                // keep header in sync with the clicked day
                setActiveStartDate(new Date(d.getFullYear(), d.getMonth(), 1));
              }}
              value={value}
              tileClassName={tileClassName}
              tileContent={tileContent}
              calendarType="iso8601"
              locale="en-AU"
              activeStartDate={activeStartDate}
              onActiveStartDateChange={({ activeStartDate, view }) => {
                if (activeStartDate) setActiveStartDate(activeStartDate);
                if (view) setView(view);
              }}
            />
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="sidebar">
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Notes 
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                localStorage.setItem(notesKey, e.target.value);
              }}
              placeholder="Write a reminder…"
              rows={8}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

function AdminGate() {
  const [authed, setAuthed] = useState(localStorage.getItem('isAdminAuthed') === 'true');
  if (!authed) {
    return (
      <div className="app-shell" style={{ maxWidth: 420 }}>
        <h2>Admin Login</h2>
        <SimpleAdminLogin
          onSuccess={() => {
            localStorage.setItem('isAdminAuthed', 'true');
            setAuthed(true);
          }}
        />
      </div>
    );
  }
  return (
    <div className="app-shell">
      <h1>Admin Panel</h1>
      <button onClick={() => (window.location.href = '/')}>Back to Calendar</button>
      <AdminPanel onSuccess={() => window.location.reload()} />
    </div>
  );
}

function SimpleAdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  return (
    <>
      <input
        placeholder="Username"
        value={u}
        onChange={(e) => setU(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <input
        placeholder="Password"
        type="password"
        value={p}
        onChange={(e) => setP(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <button
        onClick={() => {
          if (u === 'admin' && p === 'admin123') onSuccess();
          else setErr('Invalid credentials');
        }}
      >
        Enter
      </button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/admin" element={<AdminGate />} />
    </Routes>
  );
}
