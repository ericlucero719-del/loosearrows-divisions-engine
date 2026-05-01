// src/utils/fileParser.ts
// LooseArrows Supply & Logistics™
// File text-extraction utilities for contract upload processing (Division 2)
//
// Supported formats:
//   PDF  — application/pdf                                                (pdf-parse)
//   Word — application/vnd.openxmlformats-officedocument.wordprocessingml.document  (mammoth)

import pdfParse from "pdf-parse";
import mammoth  from "mammoth";

// ── MIME type constants ───────────────────────────────────────────────────────
export const MIME_PDF  = "application/pdf";
export const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ── PDF ───────────────────────────────────────────────────────────────────────

/**
 * Extract plain text from a PDF buffer.
 * Returns an empty string if the PDF contains no extractable text (e.g. scanned image).
 * Throws a descriptive error if the buffer is not a valid PDF.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error("parsePDF: received an empty buffer");
  }

  try {
    const result = await pdfParse(buffer);
    return (result.text ?? "").trim();
  } catch (err: any) {
    throw new Error(`parsePDF: failed to extract text — ${err.message}`);
  }
}

// ── Word (.docx) ──────────────────────────────────────────────────────────────

/**
 * Extract plain text from a Word (.docx) buffer using mammoth.
 * Returns an empty string if the document contains no text content.
 * Throws a descriptive error if the buffer is not a valid .docx file.
 */
export async function parseWord(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error("parseWord: received an empty buffer");
  }

  try {
    const result = await mammoth.extractRawText({ buffer });

    // Surface any non-fatal warnings from mammoth (e.g. unsupported elements)
    if (result.messages && result.messages.length > 0) {
      const warnings = result.messages
        .filter((m) => m.type === "warning")
        .map((m) => m.message)
        .join("; ");
      if (warnings) {
        console.warn(`[fileParser] parseWord warnings: ${warnings}`);
      }
    }

    return (result.value ?? "").trim();
  } catch (err: any) {
    throw new Error(`parseWord: failed to extract text — ${err.message}`);
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

/**
 * Route a file buffer to the correct parser based on its MIME type.
 *
 * @param buffer   Raw file bytes (e.g. from multer memoryStorage)
 * @param mimeType The MIME type reported by the upload (req.file.mimetype)
 * @returns        Extracted plain text, or empty string if no text found
 * @throws         Error with a descriptive message for unsupported types or parse failures
 */
export async function parseFile(buffer: Buffer, mimeType: string): Promise<string> {
  const normalised = mimeType.trim().toLowerCase();

  switch (normalised) {
    case MIME_PDF:
      return parsePDF(buffer);

    case MIME_DOCX:
      return parseWord(buffer);

    default:
      throw new Error(
        `parseFile: unsupported MIME type "${mimeType}". ` +
        `Accepted types: ${MIME_PDF}, ${MIME_DOCX}`
      );
  }
}
