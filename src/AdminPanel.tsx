import React, { useState } from 'react';

const AdminPanel: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'Working' | 'Holiday'>('Working');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch('https://employee-calendar-backend.onrender.com/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, status, time }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage('✅ Entry added!');
      setDate('');
      setTime('');
      onSuccess();
    } else {
      setMessage('❌ Failed to add entry.');
    }
  };

  const handleRemove = async () => {
    const res = await fetch(`https://employee-calendar-backend.onrender.com/calendar/${date}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (data.success) {
      setMessage('🗑️ Date removed!');
      setDate('');
      setTime('');
      onSuccess();
    } else {
      setMessage('❌ Failed to remove date.');
    }
  };

  const loadPublicHolidays = async () => {
    const res = await fetch('https://employee-calendar-backend.onrender.com/calendar/public/auto', {
      method: 'POST',
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`✅ ${data.message}`);
      onSuccess(); // to refresh calendar display
    } else {
      setMessage(`❌ Failed to load: ${data.error}`);
    }
  };


  return (
    <div className="adm-edPanel" style={{ marginTop: '40px' }}>
      <h3>Admin: Add Calendar Entry</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Enter time (e.g. 9AM – 5PM)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            padding: '10px',
            width: '80%',
            marginBottom: '15px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'Working' | 'Holiday')}
          style={{ padding: '10px', borderRadius: '6px' }}
        >
          <option value="Working">Working</option>
          <option value="Holiday">Holiday</option>
        </select>
        <button className="adm-add-date" type="submit" style={{ marginLeft: '10px' }}>Add</button>
      </form>

      <div className="adm-rem-sec" style={{ marginTop: '30px' }}>
        <h3>Remove Date</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        />
        <button className="adm-rem-date" onClick={handleRemove}>Remove</button>
      </div>
      <div className="adm-load-phday-sec" style={{ marginTop: '30px' }}>
        <button className="adm-add-phday" onClick={loadPublicHolidays} style={{ marginTop: '20px' }}>
          📅 Load Public Holidays (AU)
        </button>
      </div>
      <div className="adm-rem-phday-sec" style={{ marginTop: '30px' }}>
        <h3>Remove Public Holiday</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        />
        <button className="adm-rem-phday"
          onClick={async () => {
            const res = await fetch(`https://employee-calendar-backend.onrender.com/calendar/public/${date}`, {
              method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
              setMessage('🗑️ Public holiday removed!');
              onSuccess();
            } else {
              setMessage('❌ Failed to remove public holiday.');
            }
          }}
        >
          Remove Public Holiday
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminPanel;
