import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UploadCloud,
  File,
  X,
  Plus,
  Paperclip,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Avatar from '../common/Avatar.jsx';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../utils/constants.js';

const schema = z.object({
  title:       z.string().min(1, 'Task title is required').max(250),
  description: z.string().min(1, 'Task description is required').max(10000),
  status:      z.enum(['Idea', 'To Do', 'In Progress', 'In Review', 'Completed']),
  priority:    z.enum(['Low', 'Medium', 'High', 'Critical']),
  assignee:    z.string().nullable().optional(),
  dueDate:     z.string().optional(),
});

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  users = [],
  loading = false,
}) {
  const isEditing = Boolean(initialData?._id);

  const [tagInput, setTagInput] = useState('');
  const [labels, setLabels] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       '',
      description: '',
      status:      'Idea',
      priority:    'Medium',
      assignee:    '',
      dueDate:     '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue('title', initialData.title || '');
        setValue('description', initialData.description || '');
        setValue('status', initialData.status || 'Idea');
        setValue('priority', initialData.priority || 'Medium');
        setValue('assignee', initialData.assignee?._id || initialData.assignee || '');
        setValue(
          'dueDate',
          initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        );
        setLabels(initialData.labels || []);
      } else {
        reset({
          title:       '',
          description: '',
          status:      'Idea',
          priority:    'Medium',
          assignee:    '',
          dueDate:     '',
        });
        setLabels([]);
      }
      setSelectedFiles([]);
      setTagInput('');
    }
  }, [open, initialData, setValue, reset]);

  // Tag / Label handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setLabels(labels.filter((l) => l !== tagToRemove));
  };

  // File upload handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDropFiles = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('status', data.status);
    formData.append('priority', data.priority);
    formData.append('assignee', data.assignee || '');
    formData.append('dueDate', data.dueDate || '');
    formData.append('labels', JSON.stringify(labels));

    for (const file of selectedFiles) {
      formData.append('files', file);
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Task (${initialData.taskKey || 'TASK'})` : 'Create Issue'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {/* Title (Required) */}
        <Input
          label="Task Title *"
          placeholder="e.g. Implement user authentication workflow"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Description (Required) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Description *
          </label>
          <textarea
            rows={4}
            placeholder="Describe the task requirements, context, and acceptance criteria..."
            className="input-base text-xs"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workflow Status
            </label>
            <select className="input-base text-xs" {...register('status')}>
              {TASK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select className="input-base text-xs" {...register('priority')}>
              {TASK_PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assignee
            </label>
            <select className="input-base text-xs" {...register('assignee')}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="input-base text-xs"
              {...register('dueDate')}
            />
          </div>
        </div>

        {/* Labels / Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Labels / Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add tag and press Enter (e.g. backend, ui, bug)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="input-base text-xs flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTag}
              className="text-xs px-3"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  #{l}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(l)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Attachments Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Attachments (Images, PDFs, Documents)
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDropFiles}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
            onClick={() => document.getElementById('task-file-input')?.click()}
          >
            <input
              id="task-file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
            />
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400 group-hover:text-blue-500" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Drag & drop files here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Images, PDF, Documents, Archives up to 25MB each
            </p>
          </div>

          {/* Pending Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Files to upload ({selectedFiles.length})
              </p>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[200px] font-medium text-slate-800 dark:text-slate-200">
                      {file.name}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
