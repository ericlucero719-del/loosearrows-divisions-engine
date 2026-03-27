import { Request, Response } from 'express';
import { Division1Service } from './division1.service';

export const Division1Controller = {
  ping(_req: Request, res: Response) {
    res.json({ status: 'Division 1 online' });
  },

  quote(req: Request, res: Response) {
    try {
      const { clin, sku, quantity } = req.body;

      if (!clin || !sku || typeof quantity !== 'number') {
        return res.status(400).json({
          error: 'clin, sku, and quantity are required',
        });
      }

      const quote = Division1Service.validateAndPrice({
        clin,
        sku,
        quantity,
      });

      return res.json(quote);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },
};
