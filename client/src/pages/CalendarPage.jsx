import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '../api/api.js';
import CalendarView from '../components/calendar/CalendarView.jsx';
import { getMonthRange, dayjs } from '../utils/dates.js';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => dayjs());

  const year = currentDate.year();
  const month = currentDate.month(); // 0-indexed

  const { from, to } = getMonthRange(year, month);

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', from, to],
    queryFn: async () => {
      const res = await calendarApi.get(from, to);
      return res.data.data.items;
    },
  });

  const handleMonthChange = (direction) => {
    setCurrentDate((prev) => prev.add(direction, 'month'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Calendar Overview</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Merged view of deadlines, job application milestones, and birthdays
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-gray-600 dark:text-gray-300">Tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-gray-600 dark:text-gray-300">Jobs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span className="text-gray-600 dark:text-gray-300">Events</span>
          </div>
        </div>
      </div>

      <CalendarView
        items={data || []}
        loading={isLoading}
        year={year}
        month={month}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
