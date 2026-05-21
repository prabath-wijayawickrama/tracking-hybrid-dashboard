/* -------------------------------------------------------
   hybrid.js — Hybrid Prediction Engine
------------------------------------------------------- */

let learnedPatterns = {};
let knownPrefixes = [];

/**
 * Train all models together.
 */
async function trainHybrid(map) {
  // 1. Prefix patterns
  learnedPatterns = learnPatterns(map);

  // 2. N‑gram model
  buildNGramStats(map);

  // 3. Markov model
  buildMarkovStats(map);

  // 4. ML heuristic
  buildMlStats(map);

  // 5. LSTM neural model
  await trainLstm(map);

  console.log("Hybrid training complete.");
}

/**
 * Predict warehouse using all models.
 *
 * Returns:
 * {
 *   warehouse: "BER3",
 *   confidence: 0.87,
 *   layers: {
 *     prefix: { warehouse: "BER3" },
 *     ngram: { warehouse: "BER3", score: 42 },
 *     markov: { warehouse: "BER3", score: 17 },
 *     ml: { warehouse: "BER3", score: 0.88 },
 *     lstm: { warehouse: "BER3", score: 0.82 }
 *   }
 * }
 */
async function hybridPredict(id) {
  id = sanitizeId(id);

  if (!id) {
    return {
      warehouse: null,
      confidence: 0,
      layers: {}
    };
  }

  // -------------------------------
  // 1. Prefix model
  // -------------------------------
  let prefixWh = null;
  for (const p of knownPrefixes) {
    if (id.startsWith(p)) {
      prefixWh = learnedPatterns[p];
      break;
    }
  }

  // -------------------------------
  // 2. N‑gram model
  // -------------------------------
  const ngram = nGramScore(id);

  // -------------------------------
  // 3. Markov model
  // -------------------------------
  const markov = markovScore(id);

  // -------------------------------
  // 4. ML heuristic
  // -------------------------------
  const ml = mlHeuristicScore(id);

  // -------------------------------
  // 5. LSTM neural model
  // -------------------------------
  const lstm = await lstmPredict(id);

  // -------------------------------
  // Combine scores
  // -------------------------------
  const combined = {};

  function addScore(wh, score) {
    if (!wh) return;
    combined[wh] = (combined[wh] || 0) + score;
  }

  // Prefix gets strong weight
  if (prefixWh) addScore(prefixWh, 3.0);

  // N‑gram weight
  addScore(ngram.warehouse, ngram.score * 0.5);

  // Markov weight
  addScore(markov.warehouse, markov.score * 0.4);

  // ML heuristic weight
  addScore(ml.warehouse, ml.score * 1.2);

  // LSTM weight
  addScore(lstm.warehouse, lstm.score * 2.0);

  // Normalize
  const normalized = normalizeScores(combined);

  // Pick best
  const best = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0];

  return {
    warehouse: best ? best[0] : null,
    confidence: best ? best[1] : 0,
    layers: {
      prefix: { warehouse: prefixWh },
      ngram,
      markov,
      ml,
      lstm
    }
  };
}
