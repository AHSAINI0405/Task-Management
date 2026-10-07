import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobsApi } from '../api/jobs.api.js';
import { QK } from '../utils/constants.js';
import KanbanBoard from '../components/jobs/KanbanBoard.jsx';
import JobCard from '../components/jobs/JobCard.jsx';
import JobForm from '../components/jobs/JobForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const { data: pipelineData, isLoading: isPipelineLoading } = useQuery({
    queryKey: QK.pipeline(),
    queryFn: async () => {
      const res = await jobsApi.getPipeline();
      return res.data.data.pipeline;
    },
  });

  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: QK.jobs(),
    queryFn: async () => {
      const res = await jobsApi.getAll();
      return res.data.data.jobs;
    },
    enabled: viewMode === 'list',
  });

  const invalidateJobs = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: QK.dashboard() });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => jobsApi.create(payload),
    onSuccess: () => {
      toast.success('Job application saved');
      setIsModalOpen(false);
      invalidateJobs();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add application'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => jobsApi.update(id, payload),
    onSuccess: () => {
      toast.success('Job application updated');
      setIsModalOpen(false);
      setEditingJob(null);
      invalidateJobs();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update application'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => jobsApi.updateStatus(id, status),
    onSuccess: () => invalidateJobs(),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsApi.delete(id),
    onSuccess: () => {
      toast.success('Job application removed');
      invalidateJobs();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete application'),
  });

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (payload) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-gray-500'
            }`}
          >
            📊 Kanban Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
                : 'text-gray-500'
            }`}
          >
            📋 List View
          </button>
        </div>

        <Button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        >
          + Add Application
        </Button>
      </div>

      {/* Main View */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          pipeline={pipelineData}
          loading={isPipelineLoading}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
      ) : isListLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !listData || listData.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">💼</p>
          <p className="text-sm font-medium">No job applications tracked yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listData.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        title={editingJob ? 'Edit Application' : 'New Job Application'}
        size="lg"
      >
        <JobForm
          defaultValues={editingJob}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingJob(null);
          }}
        />
      </Modal>
    </div>
  );
}
