// src/api/contracts/upload.routes.ts
// LooseArrows Supply & Logistics™ — Division 2 (Compliance & Governance)
// Contract Upload Endpoint
//
// POST /api/contracts/upload
//   Accepts: multipart/form-data with a single file field named "contract"
//   Supported formats: CSV (.csv, text/csv) and plain text (.txt, text/plain)
//   Rejects: PDF, Word, and all other file types
//
// Response:
//   {
//     "success": true,
//     "filename": "contract.csv",
//     "mimeType": "text/csv",
//     "sizeBytes": 1024,
//     "extractedText": "...",
//     "uploadedAt": "2024-01-01T00:00:00.000Z"
//   }

import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { parseFile, MIME_CSV, MIME_TEXT } from "../../utils/fileParser";

const router = Router();

// ── Multer configuration ──────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = new Set([MIME_CSV, MIME_TEXT]);
const MAX_FILE_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ACCEPTED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: "${file.mimetype}". ` +
        `Only CSV (text/csv) and plain text (text/plain) files are accepted. ` +
        `PDF and Word documents are not supported.`
      )
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

// ── POST /api/contracts/upload ────────────────────────────────────────────────

router.post(
  "/upload",
  upload.single("contract"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({
        error: "No file uploaded. Include a CSV or plain text file in the \"contract\" field.",
        acceptedTypes: [MIME_CSV, MIME_TEXT],
      });
      return;
    }

    let extractedText: string;
    try {
      extractedText = parseFile(req.file.buffer, req.file.mimetype);
    } catch (err: any) {
      res.status(422).json({ error: err.message });
      return;
    }

    res.status(200).json({
      success:       true,
      filename:      req.file.originalname,
      mimeType:      req.file.mimetype,
      sizeBytes:     req.file.size,
      extractedText,
      uploadedAt:    new Date().toISOString(),
    });
  }
);

// ── Multer error handler (file type / size rejections) ────────────────────────

router.use((err: any, _req: Request, res: Response, _next: any): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
      });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  // fileFilter rejection or other errors
  if (err instanceof Error) {
    res.status(415).json({
      error:         err.message,
      acceptedTypes: [MIME_CSV, MIME_TEXT],
    });
    return;
  }

  res.status(500).json({ error: "An unexpected error occurred during upload." });
});

export default router;
