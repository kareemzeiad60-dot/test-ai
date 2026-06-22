"""
CattleAI — تدريب النموذج
=========================
الاستخدام:
    python3 scripts/src/train.py <مسار_ملف.zip>
"""

import sys
import os
import json
import shutil
import zipfile
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "artifacts", "cattle-predict"))
EXTRACT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "_training_tmp"))
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_HEAD = 15
EPOCHS_FINE = 10
SEED = 42
MIN_IMAGES = 10

IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def normalise_name(name):
    return name.replace("_", "-").strip()


def extract_zip(zip_path):
    print(f"\n📦 فك ضغط {zip_path} …", flush=True)
    if os.path.exists(EXTRACT_DIR):
        shutil.rmtree(EXTRACT_DIR)
    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(EXTRACT_DIR)

    best, best_count = None, 0
    for root, dirs, _ in os.walk(EXTRACT_DIR):
        dirs[:] = sorted(d for d in dirs if not d.startswith(("__", ".", "_")))
        cls_counts = []
        for d in dirs:
            n = sum(1 for f in os.listdir(os.path.join(root, d))
                    if os.path.splitext(f)[1].lower() in IMG_EXTS)
            if n > 0:
                cls_counts.append(n)
        if len(cls_counts) >= 2 and sum(cls_counts) > best_count:
            best_count = sum(cls_counts)
            best = root

    print(f"✅ dataset: {best}  ({best_count} صورة)", flush=True)
    return best


def prepare_split(data_dir):
    print("\n✂️  تقسيم 80/20 …", flush=True)
    split_root = os.path.join(EXTRACT_DIR, "_split")
    shutil.rmtree(split_root, ignore_errors=True)

    kept, removed = [], []
    for cls in sorted(os.listdir(data_dir)):
        src = os.path.join(data_dir, cls)
        if not os.path.isdir(src):
            continue
        images = [f for f in os.listdir(src)
                  if os.path.splitext(f)[1].lower() in IMG_EXTS]
        if len(images) < MIN_IMAGES:
            removed.append((cls, len(images)))
            continue

        norm = normalise_name(cls)
        kept.append(norm)
        random.seed(SEED)
        random.shuffle(images)
        split = max(1, int(len(images) * 0.8))

        for subset, imgs in [("train", images[:split]), ("val", images[split:])]:
            dst = os.path.join(split_root, subset, norm)
            os.makedirs(dst, exist_ok=True)
            for img in imgs:
                shutil.copy2(os.path.join(src, img), os.path.join(dst, img))

        print(f"   ✅ {norm:<30} {split:>3} train / {len(images)-split:>2} val", flush=True)

    if removed:
        print(f"\n   ⚠️  شيلنا (صور قليلة جداً): {[c for c,_ in removed]}", flush=True)

    return os.path.join(split_root, "train"), os.path.join(split_root, "val")


def train(zip_path):
    import tensorflow as tf
    tf.random.set_seed(SEED)
    random.seed(SEED)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    data_dir = extract_zip(zip_path)
    train_dir, val_dir = prepare_split(data_dir)

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir, image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        label_mode="categorical", shuffle=True, seed=SEED,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir, image_size=IMG_SIZE, batch_size=BATCH_SIZE,
        label_mode="categorical", shuffle=False,
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"\n🐄 {num_classes} سلالات: {class_names}", flush=True)

    labels_path = os.path.join(OUTPUT_DIR, "labels.json")
    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=False)
    print(f"✅ labels.json محفوظ → {labels_path}", flush=True)

    # Mild class weights (square-root) لتجنب عدم الاستقرار
    counts = {cls: len([f for f in os.listdir(os.path.join(train_dir, cls))
                        if os.path.splitext(f)[1].lower() in IMG_EXTS])
              for cls in class_names}
    total = sum(counts.values())
    class_weight = {i: (total / (num_classes * counts[c])) ** 0.5
                    for i, c in enumerate(class_names)}
    print("\n⚖️  Class weights:", {class_names[i]: round(v, 2) for i, v in class_weight.items()}, flush=True)

    # Augmentation
    aug = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.15),
        tf.keras.layers.RandomZoom(0.15),
        tf.keras.layers.RandomBrightness(0.15),
        tf.keras.layers.RandomContrast(0.15),
    ], name="aug")

    def preprocess(x, y):
        # EfficientNet expects raw 0-255; normalise inside model via preprocess_input
        return x, y

    def augment(x, y):
        return aug(x, training=True), y

    train_ds = (train_ds
                .map(preprocess, AUTOTUNE)
                .map(augment, AUTOTUNE)
                .prefetch(AUTOTUNE))
    val_ds = val_ds.prefetch(AUTOTUNE)

    # Model
    base = tf.keras.applications.EfficientNetB0(
        include_top=False, weights="imagenet",
        input_shape=(*IMG_SIZE, 3), pooling="avg",
    )
    base.trainable = False

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base(x, training=False)
    x = tf.keras.layers.Dropout(0.35)(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)

    best_path = os.path.join(OUTPUT_DIR, "best_model.h5")
    final_path = os.path.join(OUTPUT_DIR, "cattle_model.h5")

    ckpt = tf.keras.callbacks.ModelCheckpoint(
        best_path, save_best_only=True, monitor="val_accuracy", mode="max", verbose=1)
    early = tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=7, restore_best_weights=True, verbose=1)
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.4, patience=3, min_lr=1e-7, verbose=1)

    # ── Phase 1: head ──────────────────────────────────────────────────────────
    print(f"\n🚀 المرحلة 1 — Head فقط ({EPOCHS_HEAD} epochs) …\n", flush=True)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD,
              class_weight=class_weight, callbacks=[ckpt, early, reduce_lr])

    # ── Phase 2: fine-tune ────────────────────────────────────────────────────
    print(f"\n🔧 المرحلة 2 — Fine-tuning ({EPOCHS_FINE} epochs) …\n", flush=True)
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(2e-5),
        loss="categorical_crossentropy", metrics=["accuracy"])
    model.fit(
        train_ds, validation_data=val_ds,
        epochs=EPOCHS_HEAD + EPOCHS_FINE,
        initial_epoch=model.history.epoch[-1] + 1 if model.history else EPOCHS_HEAD,
        class_weight=class_weight, callbacks=[ckpt, early, reduce_lr])

    model.save(final_path)
    print(f"\n✅ cattle_model.h5 → {final_path}", flush=True)
    print(f"✅ best_model.h5   → {best_path}", flush=True)

    loss, acc = model.evaluate(val_ds, verbose=0)
    print(f"\n📊 Final val accuracy: {acc*100:.1f}%  loss: {loss:.4f}", flush=True)
    print("\n🎉 التدريب اكتمل! أعد تشغيل خدمة التنبؤ.", flush=True)

    shutil.rmtree(EXTRACT_DIR, ignore_errors=True)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("الاستخدام: python3 scripts/src/train.py <zip_path>")
        sys.exit(1)
    train(sys.argv[1])
