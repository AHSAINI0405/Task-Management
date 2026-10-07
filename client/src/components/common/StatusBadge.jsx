import { STATUS_CONFIG } from '../../utils/constants.js';

export default function StatusBadge({ status = 'Idea', size = 'sm', showDot = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Idea;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.badge} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{status}</span>
    </span>
  );
}
