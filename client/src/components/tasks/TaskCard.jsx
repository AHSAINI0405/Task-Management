import Badge    from '../ui/Badge.jsx';
import Button   from '../ui/Button.jsx';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants.js';
import { formatDate, isOverdue, fromNow } from '../../utils/dates.js';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div className={`card p-4 flex flex-col gap-3 animate-fade-in transition-opacity
      ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Done toggle */}
          <button
            onClick={() =>
              onStatusChange(task._id, task.status === 'done' ? 'pending' : 'done')
            }
            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-brand-500 transition"
            aria-label="Toggle done"
          >
            {task.status === 'done' && (
              <div className="w-3 h-3 rounded-full bg-brand-500" />
            )}
          </button>
          <p className={`text-sm font-medium leading-snug line-clamp-2
            ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
          >
            {task.title}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}
            className="p-1.5" aria-label="Edit">
            ✏️
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task._id)}
            className="p-1.5 text-red-500" aria-label="Delete">
            🗑️
          </Button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 -mt-1">
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center flex-wrap gap-2">
        <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
        <Badge className={STATUS_COLORS[task.status]}>{task.status}</Badge>
        {task.category && (
          <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {task.category}
          </Badge>
        )}
      </div>

      {/* Due date */}
      {task.dueDate && (
        <p className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {overdue ? '⚠️ Overdue · ' : '📅 '}{formatDate(task.dueDate, 'MMM D')} · {fromNow(task.dueDate)}
        </p>
      )}

      {/* Subtasks progress */}
      {task.subtasks?.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all"
              style={{
                width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
          </span>
        </div>
      )}
    </div>
  );
}
