// src/api/contracts/upload.routes.ts
// LooseArrows Supply & Logistics™
// POST /api/contracts/upload — Division 2 (Compliance & Governance)
//
// Accepts contract documents in CSV, plain text, PDF, or Word (.docx) format,
// extracts the text content, and returns it for downstream compliance processing.
//
// Example request (multipart/form-data):
//   POST /api/contracts/upload
//   Field: contract  (file — .csv | .txt | .pdf | .docx)
//
// Example response:
//   {
//     "success": true,
//     "filename": "contract_q3.pdf",
//     "mimeType": "application/pdf",
//     "size": 48210,
//     "characterCount": 12340,
//     "text": "AGREEMENT FOR SUPPLY OF OFFICE MATERIALS..."
//   }

import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import {
  parseFile,
  MIME_CSV,
  MIME_TEXT,
  MIME_PDF,
  MIME_DOCX,
} from "../../utils/fileParser";

const router = Router();

// ── Accepted MIME types ───────────────────────────────────────────────────────
const ACCEPTED_MIME_TYPES = [MIME_CSV, MIME_TEXT, MIME_PDF, MIME_DOCX] as const;
type AcceptedMime = typeof ACCEPTED_MIME_TYPES[number];

function isAcceptedMime(mime: string): mime is AcceptedMime {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime);
}

// ── Multer configuration ──────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (isAcceptedMime(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: "${file.mimetype}". ` +
          `Accepted formats: CSV (text/csv), plain text (text/plain), ` +
          `PDF (application/pdf), Word (application/vnd.openxmlformats-officedocument.wordprocessingml.document)`
        )
      );
    }
  },
});

// ── POST /api/contracts/upload ────────────────────────────────────────────────
router.post(
  "/upload",
  upload.single("contract"),
  async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error:   "No file uploaded.",
        hint:    "Send a multipart/form-data request with a field named \"contract\".",
        accepted: ACCEPTED_MIME_TYPES,
      });
    }

    if (!isAcceptedMime(file.mimetype)) {
      return res.status(415).json({
        error:    `Unsupported file type: "${file.mimetype}".`,
        accepted: ACCEPTED_MIME_TYPES,
      });
    }

    try {
      const text = await parseFile(file.buffer, file.mimetype);

      return res.status(200).json({
        success:        true,
        filename:       file.originalname,
        mimeType:       file.mimetype,
        size:           file.size,
        characterCount: text.length,
        text,
      });
    } catch (err: any) {
      return res.status(422).json({
        error:   "Failed to extract text from the uploaded file.",
        detail:  err.message ?? String(err),
      });
    }
  }
);

export default router;
