// src/api/contracts/upload.routes.ts
// LooseArrows Supply & Logistics™
// Contract Upload Router
//
// Mount point (via src/api/index.ts):
//   POST /api/contracts/upload   — upload a contract document for parsing
//
// Accepted formats:
//   • CSV        (.csv)
//   • Plain text (.txt)
//   • PDF        (.pdf)
//   • Word       (.docx / .doc)
//
// Auth: X-API-Key required (OPERATOR or ARCHITECT tier)
// Field name: "contract"  (multipart/form-data)
// Max size: 10 MB

import { Router, Request, Response } from "express";
import multer from "multer";
import { parseContractFile } from "../../utils/fileParser";

const contractsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * POST /api/contracts/upload
 *
 * Accepts a single contract file (field name: "contract") and returns a
 * structured summary of the parsed content.
 */
contractsRouter.post(
  "/upload",
  upload.single("contract"),
  (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: "No file uploaded.",
        hint: 'Send the file as multipart/form-data with field name "contract".',
        acceptedFormats: ["CSV (.csv)", "Plain text (.txt)", "PDF (.pdf)", "Word (.docx, .doc)"],
      });
    }

    let parsed;
    try {
      parsed = parseContractFile(file.buffer, file.originalname);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }

    // Build the response payload
    const payload: Record<string, any> = {
      success:      true,
      originalName: parsed.originalName,
      format:       parsed.format,
      sizeBytes:    parsed.sizeBytes,
    };

    if (parsed.format === "csv" || parsed.format === "text") {
      const lines = (parsed.text ?? "").split(/\r?\n/).filter((l) => l.trim());
      payload.lineCount = lines.length;
      payload.preview   = lines.slice(0, 5);
      payload.message   = `${parsed.format.toUpperCase()} contract received — ${lines.length} line(s) extracted from "${parsed.originalName}".`;
    } else {
      // PDF / Word — binary content received; text extraction requires
      // optional pdf-parse / mammoth integration.
      payload.message = `${parsed.format.toUpperCase()} contract received (${(parsed.sizeBytes / 1024).toFixed(1)} KB). Binary content stored — integrate pdf-parse or mammoth for full text extraction.`;
    }

    return res.status(200).json(payload);
  }
);

export default contractsRouter;
