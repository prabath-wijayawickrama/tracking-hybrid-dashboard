/* -------------------------------------------------------
   summary.js — Warehouse + Merchant Summary Rendering
------------------------------------------------------- */

let sessionCounts = {
  BER3: 0,
  POZ: 0,
  TOTAL: 0
};

let merchantCounts = {};

/**
 * Update counters when a prediction is made.
 */
function updateSessionCounts(warehouse, merchant) {
  if (warehouse === "BER3") sessionCounts.BER3++;
  if (warehouse === "POZ") sessionCounts.POZ++;

  sessionCounts.TOTAL++;

  // Merchant count
  if (!merchantCounts[merchant]) merchantCounts[merchant] = 0;
  merchantCounts[merchant]++;
}

/**
 * Render the BER3 / POZ / TOTAL counters.
 */
function renderScanSummary() {
  document.getElementById("berCount").textContent = sessionCounts.BER3;
  document.getElementById("pozCount").textContent = sessionCounts.POZ;
  document.getElementById("totalCount").textContent = sessionCounts.TOTAL;
}

/**
 * Render warehouse summary bars.
 */
function renderWarehouseSummary() {
  const container = document.getElementById("warehouseSummary");

  if (sessionCounts.TOTAL === 0) {
    container.innerHTML = `<div class="placeholder">No scans yet.</div>`;
    return;
  }

  const berPct = Math.round((sessionCounts.BER3 / sessionCounts.TOTAL) * 100);
  const pozPct = Math.round((sessionCounts.POZ / sessionCounts.TOTAL) * 100);

  container.innerHTML = `
    <div class="warehouse-row">
      <div class="warehouse-label">BER3</div>
      <div class="warehouse-bar">
        <div class="warehouse-bar-fill" style="width:${berPct}%;">${berPct}%</div>
      </div>
      <div class="warehouse-count">${sessionCounts.BER3}</div>
    </div>

    <div class="warehouse-row">
      <div class="warehouse-label">POZ</div>
      <div class="warehouse-bar">
        <div class="warehouse-bar-fill" style="width:${pozPct}%;">${pozPct}%</div>
      </div>
      <div class="warehouse-count">${sessionCounts.POZ}</div>
    </div>
  `;
}

/**
 * Render merchant summary table.
 */
function renderMerchantSummary() {
  const body = document.getElementById("merchantSummaryBody");

  if (sessionCounts.TOTAL === 0) {
    body.innerHTML = `<div class="placeholder">No scans yet.</div>`;
    return;
  }

  const rows = Object.entries(merchantCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([merchant, count]) => {
      const pct = Math.round((count / sessionCounts.TOTAL) * 100);
      return `
        <div class="merchant-row">
          <div>${merchant}</div>
          <div class="right">${count}</div>
          <div class="right">${pct}%</div>
        </div>
      `;
    })
    .join("");

  body.innerHTML = rows;
}

/**
 * Update all summaries at once.
 */
function updateSummaries(warehouse, merchant) {
  updateSessionCounts(warehouse, merchant);
  renderScanSummary();
  renderWarehouseSummary();
  renderMerchantSummary();
}
