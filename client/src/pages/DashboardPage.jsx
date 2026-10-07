import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Kanban,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ListTodo,
  Eye,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Activity,
  Layers,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { dashboardApi } from '../api/api.js';
import { QK, STATUS_CONFIG } from '../utils/constants.js';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import PriorityBadge from '../components/common/PriorityBadge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: QK.dashboard(),
    queryFn: async () => {
      const res = await dashboardApi.get();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading project overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl border border-rose-200">
        Failed to load dashboard metrics: {error.message}
      </div>
    );
  }

  const {
    cards = {},
    counts = {},
    priorities = {},
    assignedTasks = [],
    recentTasks = [],
    recentActivity = [],
  } = data || {};

  const total = cards.totalTasks || 0;
  const completionRate = total > 0 ? Math.round(((cards.completedTasks || 0) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── Welcome Header & Quick Action Buttons ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span>Project Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span>.
            Here is your Jira team overview and task pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/tasks')}
            variant="secondary"
            className="text-xs flex items-center gap-1.5"
          >
            <Kanban className="w-4 h-4 text-blue-600" />
            Open Kanban Board
          </Button>
          <Button
            onClick={() => navigate('/tasks?create=true')}
            className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Issue
          </Button>
        </div>
      </div>

      {/* ── 6 Required Overview Cards (Requirement 7) ─────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Workflow Status Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Total Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-blue-400 transition cursor-pointer group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Tasks
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition">
              {cards.totalTasks ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">All project items</span>
          </div>

          {/* 2. Idea Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-purple-400 transition cursor-pointer group bg-gradient-to-br from-white to-purple-50/20 dark:from-slate-900 dark:to-purple-950/20 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Idea
              </span>
              <div className="p-1.5 rounded-lg bg-purple-100/70 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition">
              {cards.ideaTasks ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Under discussion</span>
          </div>

          {/* 3. To Do Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-blue-400 transition cursor-pointer group bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/20 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                To Do
              </span>
              <div className="p-1.5 rounded-lg bg-blue-100/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition">
              {cards.todoTasks ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Ready to develop</span>
          </div>

          {/* 4. In Progress Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-amber-400 transition cursor-pointer group bg-gradient-to-br from-white to-amber-50/20 dark:from-slate-900 dark:to-amber-950/20 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                In Progress
              </span>
              <div className="p-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition">
              {cards.inProgressTasks ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Actively working</span>
          </div>

          {/* 5. In Review Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-indigo-400 transition cursor-pointer group bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                In Review
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">
              {cards.inReviewTasks ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting approval</span>
          </div>

          {/* 6. Completed Tasks */}
          <div
            onClick={() => navigate('/tasks')}
            className="card p-4 hover:shadow-md hover:border-emerald-400 transition cursor-pointer group bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/20 border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Completed
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
              {cards.completedTasks ?? 0}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
              {completionRate}% of total
            </span>
          </div>
        </div>
      </div>

      {/* ── Priority Breakdown & Project Velocity Progress ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Priority Distribution */}
        <div className="card p-4 md:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Priority Distribution
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Critical', count: priorities.Critical || 0, color: 'bg-rose-500', text: 'text-rose-600' },
              { label: 'High', count: priorities.High || 0, color: 'bg-orange-500', text: 'text-orange-600' },
              { label: 'Medium', count: priorities.Medium || 0, color: 'bg-blue-500', text: 'text-blue-600' },
              { label: 'Low', count: priorities.Low || 0, color: 'bg-slate-400', text: 'text-slate-500' },
            ].map((p) => {
              const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className={p.text}>{p.label}</span>
                    <span className="text-slate-500">
                      {p.count} <span className="text-[10px] text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Velocity */}
        <div className="card p-4 md:col-span-2 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workflow Progress
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {cards.completedTasks || 0} / {total} Issues Closed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Overall completion progress of all tasks across current sprints and backlog.
            </p>

            {/* Segmented workflow progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-4 overflow-hidden flex shadow-inner">
              {total > 0 ? (
                <>
                  <div
                    title={`Idea: ${cards.ideaTasks || 0}`}
                    className="bg-purple-500 h-full transition-all"
                    style={{ width: `${((cards.ideaTasks || 0) / total) * 100}%` }}
                  />
                  <div
                    title={`To Do: ${cards.todoTasks || 0}`}
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${((cards.todoTasks || 0) / total) * 100}%` }}
                  />
                  <div
                    title={`In Progress: ${cards.inProgressTasks || 0}`}
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${((cards.inProgressTasks || 0) / total) * 100}%` }}
                  />
                  <div
                    title={`In Review: ${cards.inReviewTasks || 0}`}
                    className="bg-indigo-500 h-full transition-all"
                    style={{ width: `${((cards.inReviewTasks || 0) / total) * 100}%` }}
                  />
                  <div
                    title={`Completed: ${cards.completedTasks || 0}`}
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${((cards.completedTasks || 0) / total) * 100}%` }}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-full" />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Idea ({cards.ideaTasks || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> To Do ({cards.todoTasks || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress ({cards.inProgressTasks || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> In Review ({cards.inReviewTasks || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed ({cards.completedTasks || 0})
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Assigned to you: <strong className="text-slate-700 dark:text-slate-300">{counts.assignedToMeCount || 0}</strong> tasks
            </span>
            <Link to="/tasks" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium">
              View on Board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main 2 Columns: Assigned to Me & Live Activity Stream ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Assigned to You */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Assigned to You</span>
            </h3>
            <Link to="/tasks" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>

          {assignedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="text-xs font-medium">All caught up!</p>
              <p className="text-[11px] mt-0.5">No pending tasks currently assigned to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignedTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate('/tasks')}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {task.taskKey}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </p>
                    </div>
                    {task.dueDate && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {dayjs(task.dueDate).format('MMM D, YYYY')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={task.status} size="sm" />
                    <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Transition History & Activity Feed */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Recent Activity & Workflow Transitions</span>
            </h3>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No recent activity logged yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-4 space-y-3.5">
              {recentActivity.slice(0, 6).map((act, i) => (
                <div key={i} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {act.changedBy?.name || 'User'}
                    </span>
                    <span className="text-slate-400">moved</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {act.taskKey}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      from <strong className="text-slate-600 dark:text-slate-300">{act.fromStatus}</strong> to{' '}
                      <strong className="text-blue-600 dark:text-blue-400">{act.toStatus}</strong>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {dayjs(act.changedAt).fromNow()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
