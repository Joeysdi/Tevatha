// lib/store/sources/csv-parser.ts

import type { RawCSVProduct } from "../types";

const REQUIRED_COLUMNS = ["name", "sku", "price_usd", "category"] as const;

export interface CSVParseResult {
  rows: RawCSVProduct[];
  errors: string[];
}

/**
 * Parse a CSV text string into raw product rows.
 * Handles \r\n and \n line endings, double-quoted fields, and escaped quotes ("" → ").
 * Pipe-separated image URLs are kept as-is in the raw string; normalizers split them.
 * Returns partial success — errors[] alongside valid rows[].
 */
export function parseCSV(text: string): CSVParseResult {
  const errors: string[] = [];
  const rows: RawCSVProduct[] = [];

  // Normalize line endings
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  if (lines.length < 2) {
    errors.push("CSV must contain a header row and at least one data row.");
    return { rows, errors };
  }

  const headers = parseCSVLine(lines[0]);

  // Validate required columns
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    errors.push(`Missing required columns: ${missing.join(", ")}`);
    return { rows, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // skip blank lines

    let values: string[];
    try {
      values = parseCSVLine(line);
    } catch {
      errors.push(`Row ${i + 1}: failed to parse — ${line.slice(0, 80)}`);
      continue;
    }

    if (values.length !== headers.length) {
      errors.push(
        `Row ${i + 1}: column count mismatch (expected ${headers.length}, got ${values.length})`
      );
      continue;
    }

    const row: RawCSVProduct = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }

    // Validate required field presence
    const rowMissing = REQUIRED_COLUMNS.filter((col) => !row[col]?.trim());
    if (rowMissing.length > 0) {
      errors.push(`Row ${i + 1}: empty required fields: ${rowMissing.join(", ")}`);
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}

/**
 * Parse a single CSV line respecting RFC 4180 quoting.
 * "" inside a quoted field is treated as a literal ".
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let i = 0;

  while (i <= line.length) {
    if (i === line.length) {
      // End of line — push empty trailing field if line ends with comma
      if (line.endsWith(",")) fields.push("");
      break;
    }

    if (line[i] === '"') {
      // Quoted field
      i++; // skip opening quote
      let value = "";
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            // Escaped quote
            value += '"';
            i += 2;
          } else {
            // Closing quote
            i++;
            break;
          }
        } else {
          value += line[i];
          i++;
        }
      }
      fields.push(value);
      // Skip comma
      if (i < line.length && line[i] === ",") i++;
    } else {
      // Unquoted field
      const start = i;
      while (i < line.length && line[i] !== ",") i++;
      fields.push(line.slice(start, i));
      if (i < line.length) i++; // skip comma
    }
  }

  return fields;
}
