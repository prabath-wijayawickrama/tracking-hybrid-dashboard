/* -------------------------------------------------------
   utils.js — General Helpers + Safe Fallbacks
------------------------------------------------------- */

// Remove invalid characters from tracking IDs
function sanitizeId(id) {
  return id.replace(/[^A-Za-z0-9#-]/g, "").trim();
}

// Convert NaN → 0
function safeNum(n) {
  return isNaN(n) ? 0 : n;
}

// Normalize score maps (convert to percentages)
function normalizeScores(scoreMap) {
  const total = Object.values(scoreMap).reduce((a, b) => a + b, 0);
  if (total === 0) return scoreMap;

  const normalized = {};
  for (const [k, v] of Object.entries(scoreMap)) {
    normalized[k] = v / total;
  }
  return normalized;
}

// Clear the result panel
function clearResult() {
  const box = document.getElementById("result");
  box.classList.add("hidden");
  box.innerHTML = "";
}

// Simple async delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Show a simple message in the result box
function showMessage(msg) {
  const box = document.getElementById("result");
  box.classList.remove("hidden");
  box.innerHTML = msg;
}
