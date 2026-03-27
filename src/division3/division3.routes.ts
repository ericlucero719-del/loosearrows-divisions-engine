import { Router } from 'express';
import { division3Controller } from './division3.controller';

const router = Router();

router.post('/division3/process', (req, res) => {
  division3Controller.handle(req, res);
});

export default router;
