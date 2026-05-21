/* -------------------------------------------------------
   lstm.js — TensorFlow.js LSTM Neural Model
------------------------------------------------------- */

let lstmModel = null;
let charIndex = {};
let indexChar = {};
let warehouses = [];
let warehouseIndex = {};

/**
 * Build character dictionary from all tracking IDs.
 */
function buildCharIndex(map) {
  const chars = new Set();

  Object.keys(map).forEach(id => {
    id.split("").forEach(c => chars.add(c));
  });

  const sorted = Array.from(chars).sort();

  sorted.forEach((c, i) => {
    charIndex[c] = i + 1; // 0 reserved for padding
    indexChar[i + 1] = c;
  });
}

/**
 * Build warehouse index mapping.
 */
function buildWarehouseIndex(map) {
  warehouses = [...new Set(Object.values(map).map(x => x.warehouse))];

  warehouses.forEach((wh, i) => {
    warehouseIndex[wh] = i;
  });
}

/**
 * Convert a tracking ID into a padded numeric sequence.
 */
function encodeId(id, maxLen) {
  const seq = new Array(maxLen).fill(0);
  const chars = id.split("");

  for (let i = 0; i < chars.length && i < maxLen; i++) {
    seq[i] = charIndex[chars[i]] || 0;
  }

  return seq;
}

/**
 * Build training tensors.
 */
function buildTrainingData(map) {
  const ids = Object.keys(map);
  const maxLen = Math.max(...ids.map(id => id.length));

  const X = [];
  const y = [];

  ids.forEach(id => {
    const seq = encodeId(id, maxLen);
    X.push(seq);

    const wh = map[id].warehouse;
    const label = new Array(warehouses.length).fill(0);
    label[warehouseIndex[wh]] = 1;
    y.push(label);
  });

  return {
    X: tf.tensor2d(X),
    y: tf.tensor2d(y),
    maxLen
  };
}

/**
 * Build the LSTM model.
 */
function buildLstmModel(inputLength, vocabSize, outputSize) {
  const model = tf.sequential();

  model.add(tf.layers.embedding({
    inputDim: vocabSize + 1,
    outputDim: 16,
    inputLength
  }));

  model.add(tf.layers.lstm({
    units: 32,
    returnSequences: false
  }));

  model.add(tf.layers.dense({
    units: outputSize,
    activation: "softmax"
  }));

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

/**
 * Train the LSTM model with progress updates.
 */
async function trainLstm(map) {
  buildCharIndex(map);
  buildWarehouseIndex(map);

  const { X, y, maxLen } = buildTrainingData(map);

  lstmModel = buildLstmModel(maxLen, Object.keys(charIndex).length, warehouses.length);

  document.getElementById("trainingProgressContainer").classList.remove("hidden");

  await lstmModel.fit(X, y, {
    epochs: 8,
    batchSize: 16,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        const pct = Math.round(((epoch + 1) / 8) * 100);
        const bar = document.getElementById("trainingProgressBar");
        bar.style.width = pct + "%";
        bar.textContent = pct + "%";
        await wait(100);
      }
    }
  });

  document.getElementById("trainingProgressContainer").classList.add("hidden");

  X.dispose();
  y.dispose();

  return maxLen;
}

/**
 * Predict warehouse using LSTM.
 *
 * Returns:
 *   { warehouse: "BER3", score: 0.82 }
 */
async function lstmPredict(id) {
  if (!lstmModel) {
    return { warehouse: null, score: 0 };
  }

  const maxLen = lstmModel.inputs[0].shape[1];
  const seq = encodeId(id, maxLen);

  const input = tf.tensor2d([seq]);
  const pred = lstmModel.predict(input);
  const arr = await pred.data();

  input.dispose();
  pred.dispose();

  let bestIndex = 0;
  let bestScore = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > bestScore) {
      bestScore = arr[i];
      bestIndex = i;
    }
  }

  return {
    warehouse: warehouses[bestIndex],
    score: bestScore
  };
}
