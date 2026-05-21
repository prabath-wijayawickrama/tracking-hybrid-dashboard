/* -------------------------------------------------------
   ml.js — Lightweight ML‑Style Heuristic Model
------------------------------------------------------- */

let mlStats = {
  length: {},
  digitRatio: {},
  letterRatio: {},
  specialRatio: {},
  warehouseFreq: {}
};

/**
 * Build heuristic statistics for each warehouse.
 */
function buildMlStats(map) {
  mlStats = {
    length: {},
    digitRatio: {},
    letterRatio: {},
    specialRatio: {},
    warehouseFreq: {}
  };

  Object.entries(map).forEach(([id, info]) => {
    const wh = info.warehouse;

    if (!mlStats.length[wh]) {
      mlStats.length[wh] = [];
      mlStats.digitRatio[wh] = [];
      mlStats.letterRatio[wh] = [];
      mlStats.specialRatio[wh] = [];
      mlStats.warehouseFreq[wh] = 0;
    }

    const len = id.length;
    const digits = (id.match(/[0-9]/g) || []).length;
    const letters = (id.match(/[A-Za-z]/g) || []).length;
    const special = (id.match(/[#-]/g) || []).length;

    const digitRatio = digits / len;
    const letterRatio = letters / len;
    const specialRatio = special / len;

    mlStats.length[wh].push(len);
    mlStats.digitRatio[wh].push(digitRatio);
    mlStats.letterRatio[wh].push(letterRatio);
    mlStats.specialRatio[wh].push(specialRatio);
    mlStats.warehouseFreq[wh]++;
  });
}

/**
 * Compute mean of an array.
 */
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Score an ID using heuristic similarity.
 *
 * Returns:
 *   { warehouse: "BER3", score: 0.87 }
 */
function mlHeuristicScore(id) {
  const len = id.length;
  const digits = (id.match(/[0-9]/g) || []).length;
  const letters = (id.match(/[A-Za-z]/g) || []).length;
  const special = (id.match(/[#-]/g) || []).length;

  const digitRatio = digits / len;
  const letterRatio = letters / len;
  const specialRatio = special / len;

  const scores = {};

  for (const wh of Object.keys(mlStats.length)) {
    const lenMean = mean(mlStats.length[wh]);
    const digitMean = mean(mlStats.digitRatio[wh]);
    const letterMean = mean(mlStats.letterRatio[wh]);
    const specialMean = mean(mlStats.specialRatio[wh]);

    // Similarity scoring (closer = better)
    let score = 0;

    score += 1 - Math.abs(len - lenMean) / 20;
    score += 1 - Math.abs(digitRatio - digitMean);
    score += 1 - Math.abs(letterRatio - letterMean);
    score += 1 - Math.abs(specialRatio - specialMean);

    // Add warehouse frequency weight
    score += mlStats.warehouseFreq[wh] / 1000;

    scores[wh] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return {
    warehouse: best ? best[0] : null,
    score: best ? best[1] : 0
  };
}
