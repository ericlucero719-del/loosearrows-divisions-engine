"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division1Service = void 0;
// In-memory CLIN table — populated from seed data or contract uploads
const CLIN_TABLE = [
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
function findClinRecord(clin, sku) {
    return CLIN_TABLE.find((r) => r.clin === clin && r.sku.toUpperCase() === sku.toUpperCase());
}
exports.Division1Service = {
    validateAndPrice(input) {
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
    upsertClin(record) {
        if (!record.clin || !record.sku)
            return false;
        const idx = CLIN_TABLE.findIndex((r) => r.clin === record.clin && r.sku.toUpperCase() === record.sku.toUpperCase());
        if (idx !== -1) {
            CLIN_TABLE[idx] = record;
        }
        else {
            CLIN_TABLE.push(record);
        }
        return true;
    },
    listClins() {
        return [...CLIN_TABLE];
    },
};
//# sourceMappingURL=division1.service.js.map