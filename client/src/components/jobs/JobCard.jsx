import Badge  from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { JOB_STATUS_COLORS } from '../../utils/constants.js';
import { formatDate } from '../../utils/dates.js';

export default function JobCard({ job, onEdit, onDelete, onStatusChange, compact = false }) {
  return (
    <div className="card p-3 flex flex-col gap-2 text-sm animate-fade-in">
      {/* Company + Role */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{job.company}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{job.role}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="p-1" onClick={() => onEdit(job)}>✏️</Button>
          <Button variant="ghost" size="sm" className="p-1 text-red-500" onClick={() => onDelete(job._id)}>🗑️</Button>
        </div>
      </div>

      {/* Status badge */}
      <Badge className={`${JOB_STATUS_COLORS[job.status] ?? ''} w-fit text-xs`}>
        {job.status}
      </Badge>

      {!compact && (
        <>
          {job.location && (
            <p className="text-xs text-gray-400">📍 {job.location}</p>
          )}
          {job.followUpDate && (
            <p className="text-xs text-orange-500">📌 Follow up: {formatDate(job.followUpDate)}</p>
          )}
          {job.salary && (
            <p className="text-xs text-gray-400">💰 {job.salary}</p>
          )}
          {job.jobUrl && (
            <a href={job.jobUrl} target="_blank" rel="noreferrer"
              className="text-xs text-brand-500 hover:underline truncate block">
              View posting ↗
            </a>
          )}
        </>
      )}

      {/* Quick status change */}
      {onStatusChange && (
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job._id, e.target.value)}
          className="input-base text-xs py-1 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {['Wishlist','Applied','Phone Screen','Interview','Offer','Rejected','Withdrawn'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  );
}
