/* -------------------------------------------------------
   main.js — App Wiring + UI Logic
------------------------------------------------------- */

let trainingData = {};   // Parsed CSV map
let modelReady = false;  // Enables lookup button

/* -------------------------------------------------------
   CSV UPLOAD → TRAINING
------------------------------------------------------- */
document.getElementById("csvFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  clearResult();
  modelReady = false;
  document.getElementById("lookupBtn").disabled = true;

  const text = await file.text();
  trainingData = parseCsv(text);

  if (Object.keys(trainingData).length === 0) {
    showMessage("CSV contains no valid rows.");
    return;
  }

  // Train hybrid model
  await trainHybrid(trainingData);

  modelReady = true;
  document.getElementById("lookupBtn").disabled = false;

  showMessage("Training complete. You can now search tracking IDs.");
});

/* -------------------------------------------------------
   LOOKUP BUTTON → PREDICT
------------------------------------------------------- */
document.getElementById("lookupBtn").addEventListener("click", async () => {
  clearResult();

  if (!modelReady) {
    showMessage("Model not trained yet.");
    return;
  }

  const id = sanitizeId(document.getElementById("returnIdInput").value);
  if (!id) {
    showMessage("Enter a valid Tracking ID.");
    return;
  }

  // Find merchant (if exists in training data)
  const merchant = trainingData[id]?.merchant || "Unknown";

  // Predict
  const prediction = await hybridPredict(id);

  if (!prediction.warehouse) {
    showMessage("No prediction available.");
    return;
  }

  // Update summaries
  updateSummaries(prediction.warehouse, merchant);

  // Render result
  renderResult(prediction, merchant);
});

/* -------------------------------------------------------
   AUTO‑CLEAR RESULT WHEN TYPING
------------------------------------------------------- */
document.getElementById("returnIdInput").addEventListener("input", () => {
  clearResult();
});

/* -------------------------------------------------------
   ENTER KEY → TRIGGER LOOKUP
------------------------------------------------------- */
document.getElementById("returnIdInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && modelReady) {
    document.getElementById("lookupBtn").click();
  }
});

/* -------------------------------------------------------
   THEME TOGGLE
------------------------------------------------------- */
document.getElementById("themeToggleBtn").addEventListener("click", () => {
  const body = document.body;
  const btn = document.getElementById("themeToggleBtn");

  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    btn.textContent = "Light Mode";
  } else {
    btn.textContent = "Dark Mode";
  }
});

/* -------------------------------------------------------
   MOBILE VIEW TOGGLE
------------------------------------------------------- */
document.getElementById("viewToggleBtn").addEventListener("click", () => {
  const body = document.body;
  const btn = document.getElementById("viewToggleBtn");

  body.classList.toggle("mobile");

  if (body.classList.contains("mobile")) {
    btn.textContent = "Desktop View";
  } else {
    btn.textContent = "Mobile View";
  }
});
