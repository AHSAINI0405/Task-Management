import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Kanban, List, Plus, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { tasksApi } from '../api/tasks.api.js';
import { authApi } from '../api/auth.api.js';
import { QK } from '../utils/constants.js';
import KanbanBoard from '../components/kanban/KanbanBoard.jsx';
import TaskListView from '../components/tasks/TaskListView.jsx';
import TaskFormModal from '../components/tasks/TaskFormModal.jsx';
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx';
import Button from '../components/ui/Button.jsx';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'list'
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [prefilledStatus, setPrefilledStatus] = useState(null);

  // Check if '?create=true' in URL
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsFormOpen(true);
      setEditingTask(null);
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Fetch all accessible tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      const res = await tasksApi.getAll();
      return res.data.data;
    },
  });

  // Fetch registered users for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: QK.users(),
    queryFn: async () => {
      const res = await authApi.getUsers();
      return res.data.data.users || [];
    },
  });

  const tasks = tasksData?.tasks || [];
  const users = usersData || [];

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: QK.dashboard() });
  };

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: (formData) => tasksApi.create(formData),
    onSuccess: (res) => {
      toast.success(`Task ${res.data.data.task?.taskKey || ''} created successfully!`);
      setIsFormOpen(false);
      setEditingTask(null);
      invalidateData();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    },
  });

  // Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => tasksApi.update(id, formData),
    onSuccess: (res) => {
      toast.success('Task updated successfully');
      setIsFormOpen(false);
      setEditingTask(null);
      if (selectedTask && selectedTask._id === res.data.data.task?._id) {
        setSelectedTask(res.data.data.task);
      }
      invalidateData();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task');
    },
  });

  // Update Status Mutation with Optimistic UI updates
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'all'] });
      const previous = queryClient.getQueryData(['tasks', 'all']);

      // Optimistically update status in cache
      queryClient.setQueryData(['tasks', 'all'], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) => (t._id === id ? { ...t, status } : t)),
        };
      });

      if (selectedTask && selectedTask._id === id) {
        setSelectedTask((prev) => (prev ? { ...prev, status } : prev));
      }

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks', 'all'], context.previous);
      }
      toast.error(err.response?.data?.message || 'Failed to update task status');
    },
    onSettled: () => {
      invalidateData();
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => {
      toast.success('Task permanently deleted');
      setIsDetailOpen(false);
      setSelectedTask(null);
      invalidateData();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    },
  });

  // Upload Attachments Mutation
  const uploadAttachmentsMutation = useMutation({
    mutationFn: ({ id, formData }) => tasksApi.uploadAttachments(id, formData),
    onSuccess: (res) => {
      setSelectedTask(res.data.data.task);
      invalidateData();
    },
  });

  // Delete Attachment Mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: ({ id, attachmentId }) => tasksApi.deleteAttachment(id, attachmentId),
    onSuccess: (res) => {
      setSelectedTask(res.data.data.task);
      invalidateData();
    },
  });

  // Handlers
  const handleOpenCreate = (preset = {}) => {
    setEditingTask(preset.status ? { status: preset.status } : null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleTaskClick = (task) => {
    // Keep most up-to-date task object
    const fresh = tasks.find((t) => t._id === task._id) || task;
    setSelectedTask(fresh);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingTask && editingTask._id) {
      updateMutation.mutate({ id: editingTask._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-full min-w-0">
      {/* ── Top Bar: Title, View Switcher & Create Button ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span>Project Tasks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {tasks.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jira Kanban workflow: Idea → To Do → In Progress → In Review → Completed
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle: Kanban vs List */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeView === 'kanban'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeView === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetchTasks()}
            title="Refresh tasks"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Create Button */}
          <Button
            onClick={() => handleOpenCreate()}
            className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Issue</span>
          </Button>
        </div>
      </div>

      {/* ── Main View (Kanban Board or List View) ────────────────────── */}
      {activeView === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          isLoading={tasksLoading}
          users={users}
          onTaskClick={handleTaskClick}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
          onCreateTask={handleOpenCreate}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onEditTask={handleOpenEdit}
          onDeleteTask={(task) => {
            if (window.confirm(`Permanently delete task ${task.taskKey}?`)) {
              deleteMutation.mutate(task._id);
            }
          }}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
      )}

      {/* ── Create / Edit Task Modal ─────────────────────────────────── */}
      <TaskFormModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        users={users}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Task Details / Issue View Modal ──────────────────────────── */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        onEdit={handleOpenEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        onUploadAttachments={(id, formData) =>
          uploadAttachmentsMutation.mutateAsync({ id, formData })
        }
        onDeleteAttachment={(id, attachmentId) =>
          deleteAttachmentMutation.mutateAsync({ id, attachmentId })
        }
      />
    </div>
  );
}
