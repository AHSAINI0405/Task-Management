import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as tasks from '../controllers/tasks.controller.js';

const router = Router();

router.use(verifyAccessToken);

// Core CRUD routes
router.get('/',      tasks.getTasks);
router.post('/',     upload.array('files', 10), tasks.createTask);
router.get('/:id',   tasks.getTask);
router.put('/:id',   upload.array('files', 10), tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

// Kanban & status updates
router.patch('/:id/status', tasks.updateTaskStatus);

// Attachments operations
router.post('/:id/attachments', upload.array('files', 10), tasks.uploadAttachments);
router.delete('/:id/attachments/:attachmentId', tasks.deleteAttachment);
router.get('/:id/attachments/:attachmentId/download', tasks.downloadAttachment);

export default router;
