import { useState } from 'react';
import { Plus, Search, Filter, X, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskCard from './TaskCard.jsx';
import { TASK_STATUSES, STATUS_CONFIG, TASK_PRIORITIES } from '../../utils/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function KanbanBoard({
  tasks = [],
  isLoading = false,
  users = [],
  onTaskClick,
  onStatusChange,
  onCreateTask,
}) {
  const { user: currentUser } = useAuth();

  // Search & filter state
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'assignedToMe', 'createdByMe'
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  // Filter tasks based on controls
  const filteredTasks = tasks.filter((task) => {
    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchKey = task.taskKey?.toLowerCase().includes(q);
      const matchTitle = task.title?.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchLabels = task.labels?.some((l) => l.toLowerCase().includes(q));
      if (!matchKey && !matchTitle && !matchDesc && !matchLabels) return false;
    }

    // View filter
    if (viewFilter === 'assignedToMe') {
      const isAssigned =
        task.assignee &&
        (task.assignee._id === currentUser?._id || task.assignee === currentUser?._id);
      if (!isAssigned) return false;
    } else if (viewFilter === 'createdByMe') {
      const isCreator =
        task.creator &&
        (task.creator._id === currentUser?._id || task.creator === currentUser?._id);
      if (!isCreator) return false;
    }

    // Priority filter
    if (priorityFilter && task.priority !== priorityFilter) {
      return false;
    }

    // Assignee filter
    if (assigneeFilter) {
      if (assigneeFilter === 'unassigned') {
        if (task.assignee) return false;
      } else {
        const matchesAssignee =
          task.assignee &&
          (task.assignee._id === assigneeFilter || task.assignee === assigneeFilter);
        if (!matchesAssignee) return false;
      }
    }

    return true;
  });

  // Drag and Drop Handlers
  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (_e, status) => {
    if (activeDropColumn === status) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    // Check authorization: creator or assignee
    const isCreator =
      task.creator &&
      (task.creator._id === currentUser?._id || task.creator === currentUser?._id);
    const isAssignee =
      task.assignee &&
      (task.assignee._id === currentUser?._id || task.assignee === currentUser?._id);

    if (!isCreator && !isAssignee) {
      toast.error('Permission denied: Only the task creator or assigned user can move this task.');
      return;
    }

    // Trigger status transition
    onStatusChange(taskId, targetStatus);
  };

  const hasActiveFilters =
    search || viewFilter !== 'all' || priorityFilter || assigneeFilter;

  const resetFilters = () => {
    setSearch('');
    setViewFilter('all');
    setPriorityFilter('');
    setAssigneeFilter('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading Kanban board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search, Filters & View toggles ────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search key, title, labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs py-1.5"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Middle: Quick Pill Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              viewFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setViewFilter('assignedToMe')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              viewFilter === 'assignedToMe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assigned to Me
          </button>
          <button
            onClick={() => setViewFilter('createdByMe')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              viewFilter === 'createdByMe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Created by Me
          </button>
        </div>

        {/* Right: Dropdowns & Clear */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-base text-xs py-1.5 w-auto"
          >
            <option value="">Priority: All</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input-base text-xs py-1.5 w-auto"
          >
            <option value="">Assignee: All</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Kanban Columns Grid ────────────────────────────────────────── */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-250px)]">
        {TASK_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const columnTasks = filteredTasks.filter((t) => t.status === status);
          const isDropActive = activeDropColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex-shrink-0 w-72 sm:w-80 flex flex-col rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border transition-all duration-200 ${
                isDropActive
                  ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div
                className={`px-3.5 py-3 rounded-t-2xl flex items-center justify-between border-b ${config.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200">
                    {status}
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.countBadge}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Quick Add in column */}
                <button
                  onClick={() => onCreateTask({ status })}
                  title={`Add task to ${status}`}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Description */}
              <div className="px-3.5 py-1 text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-200/50 dark:border-slate-800/60 truncate">
                {config.description}
              </div>

              {/* Task Cards Drop Container */}
              <div
                className={`p-2.5 flex-1 flex flex-col gap-2.5 min-h-[350px] transition-colors rounded-b-2xl ${
                  isDropActive ? 'bg-blue-50/20 dark:bg-blue-950/20' : ''
                }`}
              >
                {columnTasks.length === 0 ? (
                  <div
                    onClick={() => onCreateTask({ status })}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed cursor-pointer transition text-center group ${
                      isDropActive
                        ? 'border-blue-400 bg-blue-100/20 text-blue-600'
                        : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium">No tasks in {status}</p>
                    <p className="text-[11px] opacity-75">Click to add a task</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={onTaskClick}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
