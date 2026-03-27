export interface Division3Request {
  operatorId: string;
  payload: any;
}

export interface Division3Response {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}
