import { Request, Response } from 'express';
import { division3Service } from './division3.service';

export const division3Controller = {
  async handle(req: Request, res: Response) {
    try {
      const result = await division3Service.process({
        operatorId: req.body.operatorId,
        payload: req.body.payload
      });

      res.status(result.status === 'success' ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Unexpected server error'
      });
    }
  }
};
