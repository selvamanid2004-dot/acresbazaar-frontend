import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { CalendarEvent } from '../types';
import { api } from '../services/api';

export const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('REMINDER');
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchEvents = () => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    api.getCalendarEvents(monthKey)
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handleDayClick = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dStr);
    const dayEvts = events.filter((e) => e.date.startsWith(dStr));
    setSelectedDayEvents(dayEvts);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const dateToUse = selectedDateStr || `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
      await api.createCalendarEvent({
        title: eventTitle.trim(),
        date: dateToUse,
        type: eventType,
      });
      setEventTitle('');
      setShowAddModal(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleCalendarEvent(id);
      fetchEvents();
      setSelectedDayEvents((prev) => prev.map((e) => e.id === id ? { ...e, completed: !e.completed } : e));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle event');
    }
  };

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <Clock size={18} style={{ color: 'var(--gold-primary)' }} />
          <span>Admin Calendar</span>
        </div>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedDateStr(`${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
            setShowAddModal(true);
          }}
        >
          <Plus size={14} />
          <span>Reminder</span>
        </button>
      </div>

      <div className="panel-body calendar-widget">
        <div className="cal-header">
          <div className="cal-month-title">
            {monthNames[month]} {year}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="cal-nav-btn" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="cal-nav-btn" onClick={nextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="cal-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="cal-day-label">{d}</div>
          ))}

          {blanks.map((b) => (
            <div key={`blank-${b}`} className="cal-day-cell" style={{ opacity: 0.2 }} />
          ))}

          {days.map((day) => {
            const isToday = isCurrentMonth && day === today.getDate();
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = events.some((e) => e.date.startsWith(dStr));
            const isSelected = selectedDateStr === dStr;

            return (
              <div
                key={day}
                className={`cal-day-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}
                style={isSelected ? { outline: '2px solid var(--gold-primary)', outlineOffset: '-2px' } : undefined}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Selected Day Reminders */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {selectedDateStr ? `Events for ${selectedDateStr}` : 'Upcoming Reminders'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(selectedDayEvents.length > 0 ? selectedDayEvents : events.slice(0, 3)).map((e) => (
              <div 
                key={e.id}
                onClick={() => handleToggle(e.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'var(--bg-input)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                {e.completed ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                ) : (
                  <Circle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
                <span style={{ 
                  fontSize: '13px', 
                  color: e.completed ? 'var(--text-muted)' : '#fff', 
                  textDecoration: e.completed ? 'line-through' : 'none',
                  flex: 1 
                }}>
                  {e.title}
                </span>
                <span className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {e.type}
                </span>
              </div>
            ))}

            {events.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                No events or reminders scheduled for this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff' }}>Add Calendar Reminder</div>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event / Reminder Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Client Property Inspection"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select 
                    className="form-control"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="REMINDER">Reminder</option>
                    <option value="MEETING">Client Meeting</option>
                    <option value="INSPECTION">Site Inspection</option>
                    <option value="DEADLINE">Approval Deadline</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
