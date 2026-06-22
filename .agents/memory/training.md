---
name: CattleAI training
description: How to retrain the cattle breed model and what the training script does.
---

## Rule
Always run `train.py` as a **workflow** (not a bash command) to avoid session timeout. It takes ~8–12 min on CPU.

**Why:** Two-phase EfficientNetB0 training (15 head epochs + 10 fine-tune epochs) exceeds the bash tool's timeout.

**How to apply:** Use `configureWorkflow` to create a `Training: CattleAI` workflow with command:
`python3 scripts/src/train.py <path-to-dataset.zip> 2>&1 | tee /tmp/training.log`

## What train.py does
1. Extracts zip → detects breed folders with ≥10 images
2. Splits 80/20 train/val
3. Phase 1: trains classification head only (EfficientNetB0 frozen, 15 epochs, lr=1e-3)
4. Phase 2: fine-tunes top 30 layers (10 epochs, lr=2e-5, with ReduceLROnPlateau + EarlyStopping)
5. Saves `best_model.h5` + `cattle_model.h5` to `artifacts/cattle-predict/`
6. Writes `labels.json` (alphabetical breed names)

## Last training result
- Dataset: 814 images, 9 breeds
- Final val accuracy: **93.1%** (best epoch val_accuracy: 93.75%)
- Model: EfficientNetB0 + custom head, input 224×224
