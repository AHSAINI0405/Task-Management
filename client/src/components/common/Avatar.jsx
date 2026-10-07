export default function Avatar({ user, name, size = 'md', className = '' }) {
  const displayName = user?.name || name || 'Unassigned';
  const isUnassigned = !user && !name;

  const initials = isUnassigned
    ? '?'
    : displayName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

  // Generate a consistent soft color based on user name/id
  const colors = [
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-emerald-500 text-white',
    'bg-teal-500 text-white',
    'bg-rose-500 text-white',
    'bg-amber-500 text-white',
    'bg-cyan-500 text-white',
  ];

  const hash = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = isUnassigned ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : colors[hash % colors.length];

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs font-semibold',
    lg: 'w-10 h-10 text-sm font-semibold',
    xl: 'w-12 h-12 text-base font-bold',
  };

  return (
    <div
      title={isUnassigned ? 'Unassigned' : `${displayName} (${user?.email || ''})`}
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none shadow-sm ${sizeClasses[size] || sizeClasses.md} ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
}
