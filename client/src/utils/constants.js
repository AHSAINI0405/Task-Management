// Jira-style Task Statuses (exact 5-stage workflow)
export const TASK_STATUSES = ['Idea', 'To Do', 'In Progress', 'In Review', 'Completed'];

export const STATUS_CONFIG = {
  Idea: {
    label: 'Idea',
    description: 'Tasks that are newly proposed or under discussion',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    headerBg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200',
    dot: 'bg-purple-500',
    countBadge: 'bg-purple-200/70 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200',
  },
  'To Do': {
    label: 'To Do',
    description: 'Tasks approved and ready for development',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    headerBg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
    dot: 'bg-blue-500',
    countBadge: 'bg-blue-200/70 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200',
  },
  'In Progress': {
    label: 'In Progress',
    description: 'Tasks currently being worked on',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    headerBg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    dot: 'bg-amber-500',
    countBadge: 'bg-amber-200/70 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
  },
  'In Review': {
    label: 'In Review',
    description: 'Tasks awaiting review, testing, or approval',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    headerBg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200',
    dot: 'bg-indigo-500',
    countBadge: 'bg-indigo-200/70 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200',
  },
  Completed: {
    label: 'Completed',
    description: 'Tasks successfully completed and closed',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    countBadge: 'bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
  },
};

// Task Priorities (Low, Medium, High, Critical)
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const PRIORITY_CONFIG = {
  Critical: {
    label: 'Critical',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    iconColor: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-600',
    cardBorder: 'border-l-4 border-l-rose-500',
  },
  High: {
    label: 'High',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    dot: 'bg-orange-500',
    cardBorder: 'border-l-4 border-l-orange-500',
  },
  Medium: {
    label: 'Medium',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    cardBorder: 'border-l-4 border-l-blue-500',
  },
  Low: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    iconColor: 'text-slate-500 dark:text-slate-400',
    dot: 'bg-slate-400',
    cardBorder: 'border-l-4 border-l-slate-400',
  },
};

// Legacy color maps for backwards compatibility
export const PRIORITY_COLORS = {
  low:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Low:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Medium:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export const STATUS_COLORS = {
  Idea:          'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'To Do':       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'In Review':   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Completed:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

// Query keys for React Query
export const QK = {
  tasks:      (params) => ['tasks', params],
  todayTasks: () => ['tasks', 'today'],
  task:       (id) => ['task', id],
  users:      () => ['users'],
  dashboard:  () => ['dashboard'],
  jobs:       (params) => ['jobs', params],
  pipeline:   () => ['jobs', 'pipeline'],
  job:        (id) => ['job', id],
  events:     (params) => ['events', params],
  event:      (id) => ['event', id],
  calendar:   (from, to) => ['calendar', from, to],
};

// Legacy exports for other views
export const JOB_STATUS_COLORS = {
  Wishlist:      'bg-gray-100 text-gray-600',
  Applied:       'bg-blue-100 text-blue-700',
  'Phone Screen':'bg-purple-100 text-purple-700',
  Interview:     'bg-indigo-100 text-indigo-700',
  Offer:         'bg-green-100 text-green-700',
  Rejected:      'bg-red-100 text-red-700',
  Withdrawn:     'bg-orange-100 text-orange-700',
};

export const JOB_STATUSES = [
  'Wishlist', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Withdrawn',
];

export const EVENT_TYPE_COLORS = {
  birthday:    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  anniversary: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  holiday:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  custom:      'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

export const CALENDAR_DOT_COLORS = {
  task:  'bg-blue-500',
  job:   'bg-purple-500',
  event: 'bg-pink-500',
};

