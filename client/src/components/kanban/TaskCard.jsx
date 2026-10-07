import { useState } from 'react';
import { Paperclip, Calendar, GripVertical } from 'lucide-react';
import dayjs from 'dayjs';
import Avatar from '../common/Avatar.jsx';
import PriorityBadge from '../common/PriorityBadge.jsx';
import { PRIORITY_CONFIG } from '../../utils/constants.js';

export default function TaskCard({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDraggable = true,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;

  // Due date checks
  const isOverdue =
    task.dueDate &&
    task.status !== 'Completed' &&
    dayjs(task.dueDate).isBefore(dayjs(), 'day');

  const formattedDueDate = task.dueDate ? dayjs(task.dueDate).format('MMM D') : null;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    if (onDragStart) onDragStart(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(task)}
      className={`group relative bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm border border-slate-200 dark:border-slate-700/80 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all select-none ${
        priorityConf.cardBorder
      } ${isDragging ? 'opacity-40 scale-95 ring-2 ring-blue-500' : 'opacity-100'}`}
    >
      {/* Top Header: Task Key + Grip Handle */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-semibold text-xs tracking-wide text-blue-600 dark:text-blue-400 uppercase">
          {task.taskKey || 'TASK'}
        </span>
        <div className="flex items-center gap-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 leading-snug">
        {task.title}
      </h4>

      {/* Description Snippet (optional short display) */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2.5">
          {task.description}
        </p>
      )}

      {/* Labels / Tags */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              #{lbl}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-slate-400">+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Card Footer: Priority, Attachments, Due Date & Assignee Avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-1">
        <div className="flex items-center gap-2.5">
          {/* Priority Icon */}
          <PriorityBadge priority={task.priority} showLabel={false} size="sm" />

          {/* Attachments Indicator */}
          {task.attachments && task.attachments.length > 0 && (
            <span
              title={`${task.attachments.length} attachment(s)`}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"
            >
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </span>
          )}

          {/* Due Date Indicator */}
          {formattedDueDate && (
            <span
              title={`Due ${formattedDueDate}`}
              className={`inline-flex items-center gap-1 text-[11px] font-medium rounded px-1.5 py-0.5 ${
                isOverdue
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <Avatar user={task.assignee} size="sm" />
      </div>
    </div>
  );
}
