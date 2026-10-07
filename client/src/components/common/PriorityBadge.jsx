import { ArrowUp, ArrowDown, Minus, AlertOctagon } from 'lucide-react';
import { PRIORITY_CONFIG } from '../../utils/constants.js';

export default function PriorityBadge({ priority = 'Medium', size = 'sm', showLabel = true }) {
  const normalized = priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
  const config = PRIORITY_CONFIG[normalized] || PRIORITY_CONFIG.Medium;

  const renderIcon = () => {
    switch (normalized) {
      case 'Critical':
        return <AlertOctagon className={`shrink-0 ${config.iconColor} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />;
      case 'High':
        return <ArrowUp className={`shrink-0 ${config.iconColor} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />;
      case 'Medium':
        return <Minus className={`shrink-0 ${config.iconColor} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />;
      case 'Low':
        return <ArrowDown className={`shrink-0 ${config.iconColor} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />;
      default:
        return <Minus className={`shrink-0 ${config.iconColor} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />;
    }
  };

  if (!showLabel) {
    return (
      <span title={`Priority: ${normalized}`} className="inline-flex items-center">
        {renderIcon()}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md px-2 py-0.5 text-xs ${config.badge}`}
    >
      {renderIcon()}
      <span>{normalized}</span>
    </span>
  );
}
