import Badge  from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { EVENT_TYPE_COLORS } from '../../utils/constants.js';
import { formatDate, daysUntil } from '../../utils/dates.js';

const TYPE_EMOJI = { birthday: '🎂', anniversary: '💑', holiday: '🎉', custom: '📌' };

export default function EventCard({ event, onEdit, onDelete }) {
  const days   = daysUntil(event.nextOccurrence ?? event.date);
  const urgent = days !== null && days <= 7 && days >= 0;

  return (
    <div className={`card p-4 flex flex-col gap-2 animate-fade-in
      ${urgent ? 'ring-2 ring-pink-400 dark:ring-pink-500' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{TYPE_EMOJI[event.type] ?? '📌'}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{event.title}</p>
            {event.person && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.person}
                {event.relationship && ` · ${event.relationship}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="p-1" onClick={() => onEdit(event)}>✏️</Button>
          <Button variant="ghost" size="sm" className="p-1 text-red-500" onClick={() => onDelete(event._id)}>🗑️</Button>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <Badge className={EVENT_TYPE_COLORS[event.type]}>{event.type}</Badge>
        {event.repeatsYearly && (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            Yearly
          </Badge>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-0.5">
        <span>📅 {formatDate(event.date, 'MMMM D')}</span>
        {event.nextOccurrence && days !== null && (
          <span className={urgent ? 'text-pink-500 font-medium' : ''}>
            {days === 0
              ? '🎉 Today!'
              : days > 0
              ? `⏳ In ${days} day${days !== 1 ? 's' : ''}`
              : '✓ Passed'}
          </span>
        )}
        {event.note && <span className="italic line-clamp-1">💬 {event.note}</span>}
      </div>
    </div>
  );
}
