/* -------------------------------------------------------
   ngram.js — N‑Gram Model (3‑grams)
------------------------------------------------------- */

let nGramStats = {};

/**
 * Build N‑gram statistics for each warehouse.
 *
 * Example:
 *   ID "AB123" → "AB1", "B12", "123"
 *
 * Stored as:
 *   nGramStats["BER3"]["AB1"] = count
 */
function buildNGramStats(map) {
  nGramStats = {};
  const n = 3;

  Object.entries(map).forEach(([id, info]) => {
    const wh = info.warehouse;

    if (!nGramStats[wh]) nGramStats[wh] = {};

    for (let i = 0; i <= id.length - n; i++) {
      const gram = id.slice(i, i + n);
      nGramStats[wh][gram] = (nGramStats[wh][gram] || 0) + 1;
    }
  });
}

/**
 * Score an ID using N‑gram similarity.
 *
 * Returns:
 *   { warehouse: "BER3", score: 42 }
 */
function nGramScore(id) {
  const n = 3;
  const scores = {};

  for (const [wh, grams] of Object.entries(nGramStats)) {
    let score = 0;

    for (let i = 0; i <= id.length - n; i++) {
      const gram = id.slice(i, i + n);
      if (grams[gram]) score += grams[gram];
    }

    scores[wh] = score;
  }

  // Pick highest scoring warehouse
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return {
    warehouse: best ? best[0] : null,
    score: best ? best[1] : 0
  };
}
