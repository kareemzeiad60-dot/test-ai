---
name: CattleAI predict service
description: Flask microservice design decisions and gotchas for the cattle breed prediction server.
---

## Rule
The Flask predict service (`artifacts/cattle-predict/server.py`) returns confidence as a **0–1 fraction**, not a percentage.

**Why:** The Express API stores `topConfidence` directly and the frontend multiplies by 100 for display (`p.confidence * 100`). Returning percentage caused 0–10000% display bugs.

**How to apply:** Any change to the Flask server's confidence output must keep it in [0, 1] range.

## Labels
`labels.json` is written by `train.py` at training time — it reflects the **alphabetical sort** of breed folder names that Keras `flow_from_directory` uses. Never edit labels.json manually unless you understand the model's output-node order.

## Restart after retraining
After any retraining run, restart the `artifacts/cattle-predict: Predict Server` workflow to reload the new `cattle_model.h5`.

## Current breeds (9)
Angus, Ayrshire, Brown Swiss, Hereford, Holstein-Friesian, Jaffarabadi, Jersey, Red Dane, Simmental
