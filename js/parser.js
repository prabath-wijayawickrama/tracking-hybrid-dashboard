/* -------------------------------------------------------
   parser.js — CSV Parsing Logic
------------------------------------------------------- */

/**
 * Parse CSV text into a mapping:
 * {
 *   "TRACKINGID123": { merchant: "X", warehouse: "BER3" },
 *   ...
 * }
 */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const map = {};

  if (lines.length < 2) {
    showMessage("CSV appears to be empty or missing data rows.");
    return map;
  }

  // Expect header: TrackingID, Merchant, Warehouse
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;

    const parts = row.split(",");

    if (parts.length < 3) {
      console.warn("Skipping malformed row:", row);
      continue;
    }

    const id = sanitizeId(parts[0]);
    const merchant = parts[1].trim();
    const warehouse = parts[2].trim();

    if (!id || !merchant || !warehouse) {
      console.warn("Skipping incomplete row:", row);
      continue;
    }

    map[id] = { merchant, warehouse };
  }

  return map;
}
