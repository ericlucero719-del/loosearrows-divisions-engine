// src/api/contracts/upload.routes.ts
// LooseArrows Supply & Logistics™
// Division 2 — Compliance & Governance: Contract File Upload
//
// POST /api/contracts/upload
//   Accepts a single PDF or Word (.docx) file, extracts its text content,
//   and returns the text alongside file metadata for downstream processing.
//
// Auth: X-API-Key required (mounted after requireApiKey gate in src/api/index.ts)
//
// Example request (multipart/form-data):
//   curl -X POST /api/contracts/upload \
//     -H "X-API-Key: <key>" \
//     -F "contract=@/path/to/contract.pdf"
//
// Example response:
//   {
//     "success": true,
//     "file": {
//       "originalName": "contract.pdf",
//       "mimeType": "application/pdf",
//       "sizeBytes": 204800
//     },
//     "extraction": {
//       "characterCount": 4821,
//       "wordCount": 812,
//       "text": "AGREEMENT FOR SERVICES ..."
//     }
//   }

import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { parseFile, MIME_PDF, MIME_DOCX } from "../../utils/fileParser";

const router = Router();

// ── Multer configuration ──────────────────────────────────────────────────────
// Store files in memory so we can pass the buffer directly to the parser.
// 25 MB ceiling — large enough for real-world contracts.

const ACCEPTED_MIME_TYPES = new Set([MIME_PDF, MIME_DOCX]);
const MAX_FILE_SIZE_BYTES  = 25 * 1024 * 1024; // 25 MB

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
        `Invalid file type "${file.mimetype}". ` +
        `Only PDF (application/pdf) and Word documents ` +
        `(application/vnd.openxmlformats-officedocument.wordprocessingml.document) are accepted.`
      )
    );
  }
};

const upload = multer({
  storage:    multer.memoryStorage(),
  limits:     { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

// ── POST /api/contracts/upload ────────────────────────────────────────────────

router.post(
  "/upload",
  upload.single("contract"),
  async (req: Request, res: Response): Promise<void> => {
    // multer populates req.file when a valid file is present
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: "No file uploaded. Send a PDF or Word document as the \"contract\" field.",
      });
      return;
    }

    let extractedText: string;

    try {
      extractedText = await parseFile(file.buffer, file.mimetype);
    } catch (err: any) {
      res.status(422).json({
        error:   "Text extraction failed.",
        detail:  err.message,
        file:    file.originalname,
        hint:    "Ensure the file is a valid, non-password-protected PDF or .docx document.",
      });
      return;
    }

    const words = extractedText.trim().length > 0
      ? extractedText.trim().split(/\s+/).length
      : 0;

    res.status(200).json({
      success: true,
      file: {
        originalName: file.originalname,
        mimeType:     file.mimetype,
        sizeBytes:    file.size,
      },
      extraction: {
        characterCount: extractedText.length,
        wordCount:      words,
        text:           extractedText,
      },
    });
  }
);

// ── Error handler — catches multer errors (file size, type rejection) ─────────
router.use((err: any, _req: Request, res: Response, _next: any) => {
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
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "An unexpected error occurred during file upload." });
});

export default router;
