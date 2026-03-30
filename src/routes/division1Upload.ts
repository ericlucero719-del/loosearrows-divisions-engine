import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Division1Service } from '../divisions/division1/divisions/division1/division1.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

interface ClinRow {
  clin: string;
  sku: string;
  description: string;
  unitPrice: number;
  uom: string;
}

function parseCsv(text: string): ClinRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: ClinRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
    const get = (keys: string[]) => {
      for (const k of keys) {
        const idx = header.indexOf(k);
        if (idx !== -1 && cols[idx]) return cols[idx];
      }
      return '';
    };

    const clin = get(['clin', 'clin_id', 'contract_line']);
    const sku  = get(['sku', 'part_number', 'item_number', 'product_id']);
    if (!clin || !sku) continue;

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

function parseJson(text: string): ClinRow[] {
  const data = JSON.parse(text);
  const arr: any[] = Array.isArray(data) ? data : data.items ?? data.clins ?? data.rows ?? [];
  return arr
    .map((item: any) => ({
      clin: String(item.clin ?? item.clin_id ?? item.clinId ?? ''),
      sku: String(item.sku ?? item.partNumber ?? item.part_number ?? item.itemNumber ?? ''),
      description: String(item.description ?? item.desc ?? item.name ?? ''),
      unitPrice: parseFloat(item.unitPrice ?? item.unit_price ?? item.price ?? item.cost ?? 0),
      uom: String(item.uom ?? item.unit ?? 'EA'),
    }))
    .filter((r: ClinRow) => r.clin && r.sku);
}

router.post('/upload-contract', upload.single('contract'), (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let rows: ClinRow[] = [];
  const text = file.buffer.toString('utf8');
  const mime = file.originalname.toLowerCase();

  try {
    if (mime.endsWith('.json')) {
      rows = parseJson(text);
    } else {
      rows = parseCsv(text);
    }
  } catch (err: any) {
    return res.status(400).json({ error: `Parse error: ${err.message}` });
  }

  if (!rows.length) {
    return res.status(400).json({ error: 'No valid CLIN rows found. Ensure columns: clin, sku, description, unit_price, uom' });
  }

  let loaded = 0;
  let skipped = 0;
  let flags = 0;

  for (const row of rows) {
    const ok = Division1Service.upsertClin(row);
    if (ok) {
      loaded++;
      if (!row.unitPrice || row.unitPrice <= 0) flags++;
    } else {
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

export default router;
