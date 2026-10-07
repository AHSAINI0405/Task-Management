import JobCard from './JobCard.jsx';
import { JOB_STATUSES, JOB_STATUS_COLORS } from '../../utils/constants.js';
import Spinner from '../ui/Spinner.jsx';

export default function KanbanBoard({ pipeline, loading, onEdit, onDelete, onStatusChange }) {
  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6">
      {JOB_STATUSES.map((status) => {
        const col = pipeline?.find((p) => p.status === status) ?? { jobs: [], count: 0 };
        return (
          <div key={status} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div className={`rounded-t-xl px-3 py-2 flex items-center justify-between
              ${JOB_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
              <span className="text-xs font-semibold">{status}</span>
              <span className="text-xs font-bold bg-white/40 rounded-full px-1.5 py-0.5">
                {col.count}
              </span>
            </div>

            {/* Cards */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-b-xl p-2 min-h-32 flex flex-col gap-2">
              {col.jobs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No applications</p>
              ) : (
                col.jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    compact
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
