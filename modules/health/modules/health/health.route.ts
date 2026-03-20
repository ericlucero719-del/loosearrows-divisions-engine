import { Router } from 'express';
import { healthCheck } from './health.controller';

const router = Router();

router.get('/', healthCheck);

export const healthRouter = router;