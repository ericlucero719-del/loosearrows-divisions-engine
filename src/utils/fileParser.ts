// src/utils/fileParser.ts
// LooseArrows Supply & Logistics™
// File parsing utilities for contract uploads — CSV and plain text only.
//
// Supported formats:
//   text/csv       (.csv)  — parsed as UTF-8 plain text
//   text/plain     (.txt)  — parsed as UTF-8 plain text

export const MIME_CSV  = "text/csv";
export const MIME_TEXT = "text/plain";

export const SUPPORTED_MIME_TYPES = [MIME_CSV, MIME_TEXT] as const;
export type  SupportedMimeType    = typeof SUPPORTED_MIME_TYPES[number];

// ---------------------------------------------------------------------------
// parseCSV
// Reads a CSV file buffer and returns its contents as a UTF-8 string.
// No structural transformation is applied — the raw text is returned so
// downstream contract processors can handle column mapping themselves.
// ---------------------------------------------------------------------------
export function parseCSV(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

// ---------------------------------------------------------------------------
// parseText
// Reads a plain-text file buffer and returns its contents as a UTF-8 string.
// ---------------------------------------------------------------------------
export function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

// ---------------------------------------------------------------------------
// parseFile
// Routes a file buffer to the correct parser based on MIME type.
// Throws if the MIME type is not supported.
// ---------------------------------------------------------------------------
export function parseFile(buffer: Buffer, mimeType: string): string {
  switch (mimeType) {
    case MIME_CSV:
      return parseCSV(buffer);
    case MIME_TEXT:
      return parseText(buffer);
    default:
      throw new Error(
        `Unsupported file type: "${mimeType}". ` +
        `Only CSV (text/csv) and plain text (text/plain) are accepted.`
      );
  }
}
