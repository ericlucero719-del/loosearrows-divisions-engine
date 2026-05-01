// src/utils/fileParser.ts
// LooseArrows Supply & Logistics™
// Contract file parser — extracts raw text from uploaded contract documents.
//
// Supported formats:
//   • CSV  (.csv)          — returned as-is for downstream row parsing
//   • Plain text (.txt)    — returned as-is
//   • PDF  (.pdf)          — buffer returned for binary handling; text extraction
//                            requires an optional pdf-parse integration
//   • Word (.docx / .doc)  — buffer returned for binary handling; text extraction
//                            requires an optional mammoth integration
//
// The function always resolves. On unsupported or unreadable input it rejects
// with a descriptive error so callers can return a clean 400 to the client.

export type ParsedFile = {
  /** Normalised MIME / extension label */
  format: "csv" | "text" | "pdf" | "word";
  /** UTF-8 text content (CSV and plain-text files) */
  text?: string;
  /** Raw buffer (PDF and Word files) */
  buffer?: Buffer;
  /** Original filename as supplied by the uploader */
  originalName: string;
  /** File size in bytes */
  sizeBytes: number;
};

/**
 * Detect the logical format from the original filename extension.
 * Returns null when the extension is not in the supported set.
 */
export function detectFormat(
  filename: string
): ParsedFile["format"] | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv"))                          return "csv";
  if (lower.endsWith(".txt"))                          return "text";
  if (lower.endsWith(".pdf"))                          return "pdf";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "word";
  return null;
}

/**
 * Parse an uploaded contract file buffer into a normalised `ParsedFile`.
 *
 * @param buffer       Raw file bytes from multer's memory storage
 * @param originalName Original filename (used for format detection)
 */
export function parseContractFile(
  buffer: Buffer,
  originalName: string
): ParsedFile {
  const format = detectFormat(originalName);

  if (!format) {
    throw new Error(
      `Unsupported file type: "${originalName}". ` +
        "Accepted formats: CSV (.csv), plain text (.txt), PDF (.pdf), Word (.docx, .doc)."
    );
  }

  const base: Omit<ParsedFile, "text" | "buffer"> = {
    format,
    originalName,
    sizeBytes: buffer.length,
  };

  switch (format) {
    case "csv":
    case "text":
      return { ...base, text: buffer.toString("utf8") };

    case "pdf":
    case "word":
      // Return the raw buffer; callers can integrate pdf-parse / mammoth
      // for full text extraction when those packages are available.
      return { ...base, buffer };
  }
}
