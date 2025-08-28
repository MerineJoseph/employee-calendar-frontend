import React, { useState } from 'react';

const API_BASE = 'https://employee-calendar-backend.onrender.com';

// UI station labels
type StationUI = 'com' | 'mol';
// Backend station values
type StationApi = 'StationA' | 'StationB';

function toApiStation(s: StationUI): StationApi {
  return s === 'com' ? 'StationA' : 'StationB';
}

const AdminPanel: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  // Work/Holiday entry fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'Working' | 'Holiday'>('Working');

  // Public holiday fields
  const [phDate, setPhDate] = useState('');
  const [phName, setPhName] = useState('');

  // Station (UI)
  const [stationUI, setStationUI] = useState<StationUI>('com');

  const [message, setMessage] = useState('');

  // Add working/holiday entry (+ optional time)
  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/calendar?station=${toApiStation(stationUI)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status, time }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setDate('');
        setTime('');
        onSuccess();
      } else {
        setMessage(`❌ ${data.message || 'Failed to add entry'}`);
      }
    } catch {
      setMessage('❌ Network error while adding entry');
    }
  };

  // Remove a work/holiday entry (by date)
  const handleRemoveEntry = async () => {
    if (!date) {
      setMessage('❌ Select a date to remove');
      return;
    }
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/calendar/${date}?station=${toApiStation(stationUI)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🗑️ ${data.message}`);
        setDate('');
        setTime('');
        onSuccess();
      } else {
        setMessage(`❌ ${data.message || 'Failed to remove date'}`);
      }
    } catch {
      setMessage('❌ Network error while removing date');
    }
  };

  // Bulk load AU public holidays (apply to selected station)
  const handleLoadPublicHolidays = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/calendar/public/auto?station=${toApiStation(stationUI)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        onSuccess();
      } else {
        setMessage(`❌ Failed to load: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch {
      setMessage('❌ Network error while loading public holidays');
    }
  };

  // Add a single public holiday
  const handleAddPublicHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/calendar/public?station=${toApiStation(stationUI)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: phDate, name: phName }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setPhDate('');
        setPhName('');
        onSuccess();
      } else {
        setMessage(`❌ ${data.message || 'Failed to add public holiday'}`);
      }
    } catch {
      setMessage('❌ Network error while adding public holiday');
    }
  };

  // Remove a single public holiday (by date)
  const handleRemovePublicHoliday = async () => {
    if (!phDate) {
      setMessage('❌ Select a date to remove from public holidays');
      return;
    }
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/calendar/public/${phDate}?station=${toApiStation(stationUI)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🗑️ ${data.message}`);
        setPhDate('');
        setPhName('');
        onSuccess();
      } else {
        setMessage(`❌ ${data.message || 'Failed to remove public holiday'}`);
      }
    } catch {
      setMessage('❌ Network error while removing public holiday');
    }
  };

  return (
    <div className="adm-edPanel" style={{ marginTop: '40px', maxWidth: 800 }}>
      <h3>Admin: Add Calendar Entry</h3>

      {/* Station selector (UI) */}
      <div style={{ margin: '12px 0' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Work station</label>
        <select
          value={stationUI}
          onChange={(e) => setStationUI(e.target.value as StationUI)}
          style={{ padding: 10, borderRadius: 6 }}
        >
          <option value="com">COM</option>
          <option value="mol">MOL</option>
        </select>
      </div>

      {/* Add work/holiday entry */}
      <form onSubmit={handleAddEntry}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Enter time (e.g. 9:00–17:00)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            padding: '10px',
            width: '60%',
            marginBottom: '15px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'Working' | 'Holiday')}
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        >
          <option value="Working">Working</option>
          <option value="Holiday">Holiday</option>
        </select>
        <button className="adm-add-date" type="submit" style={{ marginLeft: '10px' }}>
          Add
        </button>
      </form>

      {/* Remove work/holiday entry */}
      <div className="adm-rem-sec" style={{ marginTop: '24px' }}>
        <h3>Remove Date</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', marginRight: '10px' }}
        />
        <button className="adm-rem-date" onClick={handleRemoveEntry}>Remove</button>
      </div>

      {/* Bulk public holidays */}
      <div className="adm-load-phday-sec" style={{ marginTop: '30px' }}>
        <h3>Add Year Public Holidays (AU)</h3>
        <button className="adm-add-phday" onClick={handleLoadPublicHolidays} style={{ marginTop: '12px' }}>
          📅 Load Public Holidays (AU)
        </button>
      </div>

      {/* Add single public holiday */}
      <div style={{ marginTop: '30px' }}>
        <h3>Add Public Holiday (Single)</h3>
        <form onSubmit={handleAddPublicHoliday} style={{ marginBottom: 16 }}>
          <input
            type="date"
            value={phDate}
            onChange={(e) => setPhDate(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 6, marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Holiday name"
            value={phName}
            onChange={(e) => setPhName(e.target.value)}
            required
            style={{ padding: 10, width: 260, marginRight: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 14px' }}>Add Public Holiday</button>
        </form>
      </div>

      {/* Remove single public holiday */}
      <div style={{ marginBottom: 20 }}>
        <h4>Remove Public Holiday</h4>
        <input
          type="date"
          value={phDate}
          onChange={(e) => setPhDate(e.target.value)}
          style={{ padding: 10, borderRadius: 6, marginRight: 10 }}
        />
        <button onClick={handleRemovePublicHoliday} style={{ padding: '10px 14px' }}>
          Remove Public Holiday
        </button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
};

export default AdminPanel;
