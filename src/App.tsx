import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import LoginPage from './LoginPage';
import AdminPanel from './AdminPanel';

type MapStr = { [k: string]: string };

const API_BASE = 'https://employee-calendar-backend.onrender.com'; // prod

type Station = 'StationA' | 'StationB'; // two work stations (we'll wire backend later)

const CalendarPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [value, setValue] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<{ [key: string]: string }>({});
  const [publicHolidays, setPublicHolidays] = useState<{ [key: string]: string }>({});
  const [calendarTimes, setCalendarTimes] = useState<{ [key: string]: string }>({});
  const [station, setStation] = useState<Station>('StationA');
  const userEmail = localStorage.getItem('userEmail') || 'Employee';

  // key notes per station + month
  const notesKey = useMemo(() => {
    const m = value.toLocaleDateString('en-CA').slice(0,7); // YYYY-MM
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
        console.log('Fetched Calendar Data:', data);
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

  // month label in header (for the "Month:" style)
  const monthLabel = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' }).format(value);

  return (
    <div className="App">
      <div className="app-shell">
        <div className="two-col">
          {/* LEFT: Calendar */}
          <div className="calendar-card">
            <div className="month-label">Month: {monthLabel}</div>
            <Calendar
              onChange={(date) => setValue(date as Date)}
              value={value}
              tileClassName={tileClassName}
              tileContent={tileContent}
              calendarType="US" /* Sunday first like the template */
            />
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              {userEmail && (
                <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
                  Logged in as: {userEmail}
                </div>
              )}
              <div style={{ fontWeight: 700 }}>{userEmail}</div>
              <button  className="emp-log-btn" onClick={() => {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('userEmail');
                  window.location.href = '/';
                }}>
                Logout
              </button>
            </div>

            <h1 className="emp-log-hdr">Employee Calendar</h1>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Work station</label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value as Station)}
              style={{ width: '100%', padding: 8, borderRadius: 6, marginBottom: 16 }}
            >
              <option value="StationA">Station A</option>
              <option value="StationB">Station B</option>
            </select>

            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Notes for {monthLabel} ({station})
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                localStorage.setItem(notesKey, e.target.value);
              }}
              placeholder="Write a reminder…"
              rows={8}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(storedLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<CalendarPage onLogout={handleLogout} />} />
      <Route path="/admin" element={
        <div className="App">
          <h1>Admin Panel</h1>
          <button className="back-to-cal" onClick={() => window.location.href = '/'}>Back to Calendar</button>
          <AdminPanel onSuccess={() => window.location.reload()} />
        </div>
      } />
    </Routes>
  );
}

function AdminGate() {
  const [authed, setAuthed] = useState(localStorage.getItem('isAdminAuthed') === 'true');
  if (!authed) {
    return (
      <SimpleAdminLogin
        onSuccess={() => {
          localStorage.setItem('isAdminAuthed', 'true');
          setAuthed(true);
        }}
      />
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
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  return (
    <div className="app-shell" style={{ maxWidth: 420 }}>
      <h2>Admin Login</h2>
      <input placeholder="Username" value={u} onChange={e=>setU(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10 }}/>
      <input placeholder="Password" type="password" value={p} onChange={e=>setP(e.target.value)} style={{ width:'100%', padding:10, marginBottom:10 }}/>
      <button
        onClick={()=>{
          if (u==='admin' && p==='admin123') onSuccess(); else setErr('Invalid credentials');
        }}
      >Enter</button>
      {err && <p style={{ color:'crimson' }}>{err}</p>}
    </div>
  );
}

export default function App(){
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn')==='true');
  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/admin" element={<AdminGate />} />
    </Routes>
  );
}
