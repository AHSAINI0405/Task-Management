import { useState } from 'react';
import { dayjs }     from '../../utils/dates.js';
import { CALENDAR_DOT_COLORS } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ items = [], loading, year, month, onMonthChange }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const firstOfMonth = dayjs().year(year).month(month).startOf('month');
  const daysInMonth  = firstOfMonth.daysInMonth();
  const startOffset  = firstOfMonth.day(); // 0=Sun

  // Group items by day-of-month (YYYY-MM-DD key)
  const byDay = {};
  items.forEach((item) => {
    const d = item._date ? dayjs(item._date).format('YYYY-MM-DD') : null;
    if (d) {
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(item);
    }
  });

  const todayStr  = dayjs().format('YYYY-MM-DD');
  const monthStr  = firstOfMonth.format('YYYY-MM');

  const selectedKey      = selectedDay ? `${monthStr}-${String(selectedDay).padStart(2,'0')}` : null;
  const selectedItems    = selectedKey ? (byDay[selectedKey] ?? []) : [];

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(-1)}>← Prev</Button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {firstOfMonth.format('MMMM YYYY')}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(1)}>Next →</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="min-h-16 border-b border-r border-gray-100 dark:border-gray-800" />;

              const dateKey = `${monthStr}-${String(day).padStart(2,'0')}`;
              const isToday = dateKey === todayStr;
              const isSelected = day === selectedDay;
              const dayItems   = byDay[dateKey] ?? [];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-16 p-1.5 border-b border-r border-gray-100 dark:border-gray-800 text-left
                    transition hover:bg-gray-50 dark:hover:bg-gray-800
                    ${isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                >
                  <span className={`text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full
                    ${isToday ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>

                  {/* Dots */}
                  {dayItems.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayItems.slice(0, 3).map((item, idx) => (
                        <span key={idx} className={`w-1.5 h-1.5 rounded-full ${CALENDAR_DOT_COLORS[item._type] ?? 'bg-gray-400'}`} />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[9px] text-gray-400">+{dayItems.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected day detail */}
      {selectedDay && (
        <div className="card p-4 animate-slide-up">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {firstOfMonth.date(selectedDay).format('dddd, MMMM D')}
          </h3>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing scheduled</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CALENDAR_DOT_COLORS[item._type]}`} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.title ?? `${item.company} — ${item.role}`}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{item._type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
