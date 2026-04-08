"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const division1_service_1 = require("../divisions/division1/divisions/division1/division1.service");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length)
        return [];
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        const get = (keys) => {
            for (const k of keys) {
                const idx = header.indexOf(k);
                if (idx !== -1 && cols[idx])
                    return cols[idx];
            }
            return '';
        };
        const clin = get(['clin', 'clin_id', 'contract_line']);
        const sku = get(['sku', 'part_number', 'item_number', 'product_id']);
        if (!clin || !sku)
            continue;
        rows.push({
            clin,
            sku,
            description: get(['description', 'desc', 'item_description', 'product_name', 'name']) || sku,
            unitPrice: parseFloat(get(['unit_price', 'price', 'cost', 'unit_cost'])) || 0,
            uom: get(['uom', 'unit_of_measure', 'unit']) || 'EA',
        });
    }
    return rows;
}
function parseJson(text) {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : data.items ?? data.clins ?? data.rows ?? [];
    return arr
        .map((item) => ({
        clin: String(item.clin ?? item.clin_id ?? item.clinId ?? ''),
        sku: String(item.sku ?? item.partNumber ?? item.part_number ?? item.itemNumber ?? ''),
        description: String(item.description ?? item.desc ?? item.name ?? ''),
        unitPrice: parseFloat(item.unitPrice ?? item.unit_price ?? item.price ?? item.cost ?? 0),
        uom: String(item.uom ?? item.unit ?? 'EA'),
    }))
        .filter((r) => r.clin && r.sku);
}
router.post('/upload-contract', upload.single('contract'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    let rows = [];
    const text = file.buffer.toString('utf8');
    const mime = file.originalname.toLowerCase();
    try {
        if (mime.endsWith('.json')) {
            rows = parseJson(text);
        }
        else {
            rows = parseCsv(text);
        }
    }
    catch (err) {
        return res.status(400).json({ error: `Parse error: ${err.message}` });
    }
    if (!rows.length) {
        return res.status(400).json({ error: 'No valid CLIN rows found. Ensure columns: clin, sku, description, unit_price, uom' });
    }
    let loaded = 0;
    let skipped = 0;
    let flags = 0;
    for (const row of rows) {
        const ok = division1_service_1.Division1Service.upsertClin(row);
        if (ok) {
            loaded++;
            if (!row.unitPrice || row.unitPrice <= 0)
                flags++;
        }
        else {
            skipped++;
        }
    }
    return res.json({
        extracted: loaded,
        skipped,
        flags,
        message: `${loaded} CLINs loaded from ${file.originalname}`,
    });
});
exports.default = router;
//# sourceMappingURL=division1Upload.js.map