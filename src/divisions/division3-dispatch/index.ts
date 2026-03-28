import { Router, Request, Response } from 'express';

const router = Router();

router.get('/ping', (_req: Request, res: Response) => {
  res.json({ status: 'Dispatch online' });
});

router.post('/dispatch', (req: Request, res: Response) => {
  const { orderId, destination } = req.body;
  if (!orderId || !destination) {
    return res.status(400).json({ error: 'orderId and destination are required' });
  }
  return res.json({
    dispatched: true,
    orderId,
    destination,
    timestamp: new Date().toISOString(),
  });
});

export const dispatchRoutes = router;
