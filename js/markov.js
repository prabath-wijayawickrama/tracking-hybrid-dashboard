/* -------------------------------------------------------
   markov.js — Markov Chain Model
------------------------------------------------------- */

let markovStats = {};

/**
 * Build Markov transition tables for each warehouse.
 *
 * Example:
 *   ID "AB12"
 *   Transitions: A→B, B→1, 1→2
 *
 * Stored as:
 *   markovStats["BER3"]["A"]["B"] = count
 */
function buildMarkovStats(map) {
  markovStats = {};

  Object.entries(map).forEach(([id, info]) => {
    const wh = info.warehouse;

    if (!markovStats[wh]) markovStats[wh] = {};

    for (let i = 0; i < id.length - 1; i++) {
      const a = id[i];
      const b = id[i + 1];

      if (!markovStats[wh][a]) markovStats[wh][a] = {};
      markovStats[wh][a][b] = (markovStats[wh][a][b] || 0) + 1;
    }
  });
}

/**
 * Score an ID using Markov transitions.
 *
 * Returns:
 *   { warehouse: "BER3", score: 17 }
 */
function markovScore(id) {
  const scores = {};

  for (const [wh, transitions] of Object.entries(markovStats)) {
    let score = 0;

    for (let i = 0; i < id.length - 1; i++) {
      const a = id[i];
      const b = id[i + 1];

      if (transitions[a] && transitions[a][b]) {
        score += transitions[a][b];
      }
    }

    scores[wh] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return {
    warehouse: best ? best[0] : null,
    score: best ? best[1] : 0
  };
}
