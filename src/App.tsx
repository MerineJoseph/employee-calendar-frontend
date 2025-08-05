import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import LoginPage from './LoginPage';
import AdminPanel from './AdminPanel';

const CalendarPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [value, setValue] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<{ [key: string]: string }>({});
  const [publicHolidays, setPublicHolidays] = useState<{ [key: string]: string }>({});
  const [calendarTimes, setCalendarTimes] = useState<{ [key: string]: string }>({});
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetch('http://192.168.0.71:8001/calendar')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched Calendar Data:', data);
        setCalendarData(data.calendar_data || {});
        setPublicHolidays(data.public_holidays || {});
        setCalendarTimes(data.calendar_times || {});
      });
  }, []);

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toLocaleDateString('en-CA');
    const todayStr = new Date().toLocaleDateString('en-CA');
    let classes = [];

    if (dateStr === todayStr) {
      classes.push('today');
    }

    // Priority to public holidays
    if (publicHolidays[dateStr]) {
      classes.push('public-holiday');  // Apply a new color
    } else if (calendarData[dateStr] === 'Holiday') {
      classes.push('holiday');
    } else if (calendarData[dateStr] === 'Working') {
      classes.push('working');
    }

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

  return (
    <div className="App">

      <button  className="emp-log-btn" onClick={() => {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          window.location.reload();
        }}>
        Logout
      </button>

      <h1 className="emp-log-hdr">Employee Calendar</h1>

      {userEmail && (
        <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
          Logged in as: {userEmail}
        </div>
      )}

      <Calendar
        onChange={(date) => setValue(date as Date)}
        value={value}
        tileClassName={tileClassName}
        tileContent={tileContent}
      />
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

export default App;
