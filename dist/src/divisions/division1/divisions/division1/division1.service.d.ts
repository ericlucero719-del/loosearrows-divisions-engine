import { ClinRecord, Division1TaskInput, PriceQuote } from '../../division1.types';
export declare const Division1Service: {
    validateAndPrice(input: Division1TaskInput): PriceQuote;
    upsertClin(record: ClinRecord): boolean;
    listClins(): ClinRecord[];
};
//# sourceMappingURL=division1.service.d.ts.map