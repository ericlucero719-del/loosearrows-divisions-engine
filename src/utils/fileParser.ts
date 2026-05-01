// src/utils/fileParser.ts
// LooseArrows Supply & Logistics™
// File parsing utilities for contract uploads — Division 2 (Compliance & Governance)
//
// Supported formats:
//   CSV   — text/csv
//   Text  — text/plain
//   PDF   — application/pdf          (via pdf-parse)
//   Word  — application/vnd.openxmlformats-officedocument.wordprocessingml.document (via mammoth)

import pdfParse from "pdf-parse";
import mammoth  from "mammoth";

// ── MIME type constants ───────────────────────────────────────────────────────
export const MIME_CSV  = "text/csv";
export const MIME_TEXT = "text/plain";
export const MIME_PDF  = "application/pdf";
export const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ── Individual parsers ────────────────────────────────────────────────────────

/**
 * Parse a CSV buffer — returns the raw text content.
 * Callers can further process rows as needed.
 */
export function parseCSV(buffer: Buffer): string {
  return buffer.toString("utf8");
}

/**
 * Parse a plain-text buffer — returns the raw text content.
 */
export function parseText(buffer: Buffer): string {
  return buffer.toString("utf8");
}

/**
 * Parse a PDF buffer using pdf-parse — returns extracted plain text.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parse a .docx buffer using mammoth — returns extracted plain text.
 */
export async function parseWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// ── Unified dispatcher ────────────────────────────────────────────────────────

/**
 * Route a file buffer to the correct parser based on its MIME type.
 * Returns the extracted text content.
 *
 * @throws Error if the MIME type is not supported.
 */
export async function parseFile(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case MIME_CSV:
      return parseCSV(buffer);
    case MIME_TEXT:
      return parseText(buffer);
    case MIME_PDF:
      return parsePDF(buffer);
    case MIME_DOCX:
      return parseWord(buffer);
    default:
      throw new Error(
        `Unsupported file type: "${mimeType}". ` +
        `Accepted types: ${MIME_CSV}, ${MIME_TEXT}, ${MIME_PDF}, ${MIME_DOCX}`
      );
  }
}
