import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as jobs from '../controllers/jobs.controller.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/pipeline', jobs.getJobPipeline);

router.get('/',    jobs.getJobs);
router.post('/',   validate(jobs.createJobSchema), jobs.createJob);
router.get('/:id', jobs.getJob);
router.put('/:id', validate(jobs.updateJobSchema), jobs.updateJob);
router.patch('/:id/status', validate(jobs.jobStatusSchema), jobs.updateJobStatus);
router.delete('/:id',                              jobs.deleteJob);

export default router;
