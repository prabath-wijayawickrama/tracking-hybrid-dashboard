/* -------------------------------------------------------
   result.js — Prediction Result Rendering
------------------------------------------------------- */

/**
 * Convert confidence (0–1) into a badge class + label.
 */
function confidenceBadge(conf) {
  if (conf >= 0.85) return { cls: "conf-high", label: "High" };
  if (conf >= 0.60) return { cls: "conf-mid", label: "Medium" };
  if (conf >= 0.35) return { cls: "conf-low", label: "Low" };
  return { cls: "conf-verylow", label: "Very Low" };
}

/**
 * Render the result panel.
 */
function renderResult(prediction, merchant) {
  const box = document.getElementById("result");
  box.classList.remove("hidden");

  if (!prediction || !prediction.warehouse) {
    box.innerHTML = `<div>No prediction available.</div>`;
    return;
  }

  const wh = prediction.warehouse;
  const conf = prediction.confidence;
  const pct = Math.round(conf * 100);

  const badge = confidenceBadge(conf);

  const layers = prediction.layers;

  box.innerHTML = `
    <div class="prediction-header">
      <div class="prediction-title">${wh}</div>
      <div class="confidence-badge ${badge.cls}">${badge.label}</div>
    </div>

    <div class="confidence-bar-container">
      <div class="confidence-bar-fill" style="width:${pct}%;">
        ${pct}%
      </div>
    </div>

    <div class="section-title" style="margin-top:1rem;">Model Breakdown</div>

    <div class="layer-row"><strong>Prefix:</strong> ${layers.prefix.warehouse || "—"}</div>
    <div class="layer-row"><strong>N‑gram:</strong> ${layers.ngram.warehouse} (score ${layers.ngram.score})</div>
    <div class="layer-row"><strong>Markov:</strong> ${layers.markov.warehouse} (score ${layers.markov.score})</div>
    <div class="layer-row"><strong>ML Heuristic:</strong> ${layers.ml.warehouse} (score ${layers.ml.score.toFixed(2)})</div>
    <div class="layer-row"><strong>LSTM:</strong> ${layers.lstm.warehouse} (score ${layers.lstm.score.toFixed(2)})</div>

    <div class="section-title" style="margin-top:1rem;">Merchant</div>
    <div>${merchant}</div>
  `;
}
