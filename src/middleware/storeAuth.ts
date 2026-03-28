import { Request, Response, NextFunction } from 'express';
import { getStoreByToken } from '../division2/services/division2Service';

export interface AuthenticatedRequest extends Request {
  store?: any;
}

export async function storeAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = String(req.headers.authorization ?? '');
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.headers['x-store-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const store = await getStoreByToken(token);
  if (!store) {
    return res.status(401).json({ error: 'Invalid store token' });
  }

  req.store = store;
  next();
}
