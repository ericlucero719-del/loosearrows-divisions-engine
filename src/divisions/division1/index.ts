import { Router } from 'express';
import { Division1Controller } from './divisions/division1/division1.controller';

const router = Router();

router.get('/ping', Division1Controller.ping);
router.post('/quote', Division1Controller.quote);

export const division1Routes = router;
