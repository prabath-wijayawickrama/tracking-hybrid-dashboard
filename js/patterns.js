/* -------------------------------------------------------
   patterns.js — Prefix Pattern Learning
------------------------------------------------------- */

/**
 * Learn prefix → warehouse patterns.
 *
 * Example:
 *   "AB123" → prefix "AB" → BER3
 *   "AB998" → prefix "AB" → BER3
 *   "XY555" → prefix "XY" → POZ
 *
 * Output:
 *   learnedPatterns = { "AB": "BER3", "XY": "POZ" }
 *   knownPrefixes   = ["AB", "XY"]
 */
function learnPatterns(map) {
  const prefixCounts = {};

  Object.entries(map).forEach(([id, info]) => {
    // Extract prefix: letters, #, or -
    const prefix = id.match(/^[A-Za-z#-]+/)?.[0];
    if (!prefix) return;

    const wh = info.warehouse;

    if (!prefixCounts[prefix]) prefixCounts[prefix] = {};
    prefixCounts[prefix][wh] = (prefixCounts[prefix][wh] || 0) + 1;
  });

  const learned = {};

  // Convert counts → dominant warehouse
  Object.entries(prefixCounts).forEach(([prefix, whCounts]) => {
    const best = Object.entries(whCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    learned[prefix] = best;
  });

  // Update global prefix list
  knownPrefixes = Object.keys(learned);

  return learned;
}
