import { useState } from 'react';
import { Paperclip, Calendar, MoreVertical, Trash2, Edit3, Eye, ArrowUpDown } from 'lucide-react';
import dayjs from 'dayjs';
import Avatar from '../common/Avatar.jsx';
import PriorityBadge from '../common/PriorityBadge.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

export default function TaskListView({
  tasks = [],
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'assignee') {
      valA = a.assignee?.name || '';
      valB = b.assignee?.name || '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('taskKey')}
                className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Key</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Summary</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3">Status</th>
              <th
                onClick={() => handleSort('priority')}
                className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3">Assignee</th>
              <th
                onClick={() => handleSort('dueDate')}
                className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center">Files</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No tasks matching the criteria
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  task.status !== 'Completed' &&
                  dayjs(task.dueDate).isBefore(dayjs(), 'day');

                return (
                  <tr
                    key={task._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onTaskClick?.(task)}
                  >
                    {/* Key */}
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {task.taskKey || 'TASK'}
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-xs sm:max-w-md truncate">
                      <span>{task.title}</span>
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {task.labels.slice(0, 2).map((l, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-400 dark:text-slate-500"
                            >
                              #{l}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={task.status} size="sm" />
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar user={task.assignee} size="xs" />
                        <span className="truncate max-w-[120px]">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {task.dueDate ? (
                        <span
                          className={`font-medium ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {dayjs(task.dueDate).format('MMM D, YYYY')}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Files count */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {task.attachments && task.attachments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                          <Paperclip className="w-3 h-3" />
                          {task.attachments.length}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onTaskClick?.(task)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTask?.(task)}
                          title="Edit Task"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask?.(task)}
                          title="Delete Task"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
