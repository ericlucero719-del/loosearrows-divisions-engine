import { ClinRecord, Division1TaskInput, PriceQuote } from './division1.types';

// Temporary CLIN table — replace with your real contract data later
const CLIN_TABLE: ClinRecord[] = [
  {
    clin: '001',
    sku: 'CF360A',
    description: 'Black Toner Cartridge',
    unitPrice: 123.45,
    uom: 'EA',
  },
  {
    clin: '002',
    sku: 'CF361A',
    description: 'Cyan Toner Cartridge',
    unitPrice: 130.0,
    uom: 'EA',
  },
];

function findClinRecord(clin: string, sku: string): ClinRecord | undefined {
  return CLIN_TABLE.find(
    (r) => r.clin === clin && r.sku.toUpperCase() === sku.toUpperCase()
  );
}

export const Division1Service = {
  validateAndPrice(input: Division1TaskInput): PriceQuote {
    const record = findClinRecord(input.clin, input.sku);

    if (!record) {
      throw new Error('CLIN/SKU combination not found in Division 1 table');
    }

    const extendedPrice = record.unitPrice * input.quantity;

    return {
      clin: record.clin,
      sku: record.sku,
      quantity: input.quantity,
      unitPrice: record.unitPrice,
      extendedPrice,
      description: record.description,
      uom: record.uom,
    };
  },
};
