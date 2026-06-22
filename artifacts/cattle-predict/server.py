"""
CattleAI — Flask Prediction Microservice
=========================================
Listens on PREDICT_PORT (default 5000).
POST /predict  { "imageData": "<base64 string>" }
→ { "predictions": [{ "breed": str, "confidence": float, "rank": int }] }
"""

import os
import sys
import json
import base64
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify

PORT = int(os.environ.get("PREDICT_PORT", 5000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "cattle_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.json")
IMG_SIZE = (224, 224)
TOP_K = 5

print(f"[CattleAI] Loading model from {MODEL_PATH} …", flush=True)
if not os.path.exists(MODEL_PATH):
    print(f"[CattleAI] ERROR: model not found at {MODEL_PATH}", flush=True)
    sys.exit(1)
if not os.path.exists(LABELS_PATH):
    print(f"[CattleAI] ERROR: labels.json not found at {LABELS_PATH}", flush=True)
    sys.exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
with open(LABELS_PATH, "r", encoding="utf-8") as f:
    labels = json.load(f)

n_labels = len(labels)
print(f"[CattleAI] Model loaded. Breeds ({n_labels}): {labels}", flush=True)

app = Flask(__name__)


def preprocess(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    # Model embeds efficientnet.preprocess_input internally — pass raw 0-255 values
    arr = np.array(img, dtype=np.float32)
    return np.expand_dims(arr, axis=0)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "breeds": labels})


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(silent=True) or {}
    image_data = body.get("imageData", "")

    if not image_data:
        return jsonify({"error": "imageData field is required"}), 400

    # Strip data-URL prefix if present
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_data)
    except Exception as e:
        return jsonify({"error": f"base64 decode failed: {e}"}), 400

    try:
        arr = preprocess(image_bytes)
    except Exception as e:
        return jsonify({"error": f"image preprocessing failed: {e}"}), 400

    preds = model.predict(arr, verbose=0)[0]

    # Only consider indices within our known labels
    valid_preds = preds[:n_labels]
    top_indices = np.argsort(valid_preds)[::-1][:TOP_K]

    predictions = [
        {
            "rank": rank + 1,
            "breed": labels[int(idx)],
            "confidence": round(float(valid_preds[idx]), 4),
        }
        for rank, idx in enumerate(top_indices)
    ]

    return jsonify({"predictions": predictions})


if __name__ == "__main__":
    print(f"[CattleAI] Starting server on port {PORT}", flush=True)
    app.run(host="0.0.0.0", port=PORT, debug=False)
