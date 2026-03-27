export interface ClinRecord {
  clin: string;
  sku: string;
  description: string;
  unitPrice: number;
  uom: string;
}

export interface PriceQuote {
  clin: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  extendedPrice: number;
  description: string;
  uom: string;
}

export interface Division1TaskInput {
  clin: string;
  sku: string;
  quantity: number;
}
