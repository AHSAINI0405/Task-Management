import { useState } from 'react';
import {
  X,
  Paperclip,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit3,
  Download,
  UploadCloud,
  FileText,
  File,
  Image as ImageIcon,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Avatar from '../common/Avatar.jsx';
import PriorityBadge from '../common/PriorityBadge.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { TASK_STATUSES, STATUS_CONFIG } from '../../utils/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';

dayjs.extend(relativeTime);

export default function TaskDetailModal({
  task,
  open,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onUploadAttachments,
  onDeleteAttachment,
}) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'attachments' | 'history'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  if (!task) return null;

  const isCreator =
    task.creator &&
    (task.creator._id === currentUser?._id || task.creator === currentUser?._id);
  const isAssignee =
    task.assignee &&
    (task.assignee._id === currentUser?._id || task.assignee === currentUser?._id);

  const canEdit = isCreator || isAssignee;
  const canDelete = isCreator;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (mimetype, filename) => {
    if (mimetype && mimetype.startsWith('image/')) return true;
    if (filename && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)) return true;
    return false;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }

    try {
      setUploadingFiles(true);
      await onUploadAttachments(task._id, formData);
      toast.success('Attachments uploaded successfully');
      e.target.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload attachments');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteAttachmentClick = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    try {
      await onDeleteAttachment(task._id, attachmentId);
      toast.success('Attachment removed');
    } catch (err) {
      toast.error('Failed to remove attachment');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-wide text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
            {task.taskKey || 'TASK'}
          </span>
          <span className="text-slate-400 text-xs font-normal">Issue Details</span>
        </div>
      }
    >
      <div className="space-y-5 max-h-[78vh] overflow-y-auto px-1">
        {/* Top Header Actions & Status Transition Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              disabled={!canEdit}
              className="text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
            >
              {TASK_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(task)}
                className="text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 transition border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Details & Description
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Attachments</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {task.attachments?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Status History ({task.statusHistory?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: DETAILS & DESCRIPTION */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title & Description */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {task.title}
                </h3>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Description
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </div>
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Labels / Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((l, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                      >
                        #{l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Metadata Sidebar */}
            <div className="space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1">Priority</span>
                <PriorityBadge priority={task.priority} size="md" />
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">Assignee</span>
                <div className="flex items-center gap-2">
                  <Avatar user={task.assignee} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.assignee?.name || 'Unassigned'}
                    </p>
                    {task.assignee?.email && (
                      <p className="text-[10px] text-slate-400">{task.assignee.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">Reporter</span>
                <div className="flex items-center gap-2">
                  <Avatar user={task.creator} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.creator?.name || 'System'}
                    </p>
                    {task.creator?.email && (
                      <p className="text-[10px] text-slate-400">{task.creator.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">Due Date</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {task.dueDate ? dayjs(task.dueDate).format('MMMM D, YYYY') : 'None set'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {dayjs(task.createdAt).format('MMM D, YYYY h:mm A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {dayjs(task.updatedAt).fromNow()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTACHMENTS */}
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            {/* Inline Upload Zone */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center">
              <input
                id="detail-attachment-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
              />
              <UploadCloud className="w-7 h-7 mx-auto mb-1.5 text-blue-500" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Add more attachments to this issue
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploadingFiles}
                onClick={() => document.getElementById('detail-attachment-input')?.click()}
                className="mt-2 text-xs"
              >
                Browse Files
              </Button>
            </div>

            {/* List of Attachments */}
            {task.attachments && task.attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.attachments.map((att) => {
                  const isImg = isImageFile(att.mimetype, att.originalName);
                  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
                  const fullUrl = `${apiBase.replace('/api/v1', '')}${att.url}`;

                  return (
                    <div
                      key={att._id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isImg ? (
                          <img
                            src={fullUrl}
                            alt={att.originalName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {att.originalName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatFileSize(att.size)} • {dayjs(att.createdAt).format('MMM D, YYYY')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`${apiBase}/tasks/${task._id}/attachments/${att._id}/download`}
                          download={att.originalName}
                          target="_blank"
                          rel="noreferrer"
                          title="Download file"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachmentClick(att._id)}
                            title="Delete attachment"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-center text-slate-400 py-6">
                No attachments uploaded yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: STATUS HISTORY AUDIT TRAIL */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Status Change Timeline
            </h4>
            {task.statusHistory && task.statusHistory.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-4 space-y-4">
                {task.statusHistory.map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Timeline bullet */}
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />

                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.changedBy?.name || 'System'}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {dayjs(item.changedAt).format('MMM D, YYYY [at] h:mm A')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {item.fromStatus}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {item.toStatus}
                      </span>
                    </div>

                    {item.comment && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        "{item.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No status history available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-sm w-full p-5 space-y-4 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-sm">Delete Task Permanently?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{task.taskKey} ({task.title})</span>?
              All attached files and history will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(task._id);
                }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
