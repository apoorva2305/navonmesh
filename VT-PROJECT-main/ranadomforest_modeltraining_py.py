# -*- coding: utf-8 -*-
"""Train SheRoute's Random Forest from the route-safety rows in the master CSV.

Run from the repository root:
    python ranadomforest_modeltraining_py.py

Only row_type == 'route_safety_record' is used for supervised training.
Crime, hospital and police-station rows are operational geospatial records,
not labelled training examples.
"""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "Backend" / "app" / "datasets" / "SheRoute_Raipur_Master_Dataset.csv"
MODEL_OUT = ROOT / "route_safety_model.joblib"
LABEL_ENCODER_OUT = ROOT / "label_encoder.joblib"

FEATURE_COLS = ["police_count", "hospital_count", "night_light", "crime_count"]
TARGET_COL = "target"


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Master dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    required = {"row_type", *FEATURE_COLS, TARGET_COL}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")

    route_df = df.loc[df["row_type"].eq("route_safety_record")].copy()
    route_df[FEATURE_COLS] = route_df[FEATURE_COLS].apply(pd.to_numeric, errors="coerce")
    route_df[TARGET_COL] = route_df[TARGET_COL].astype("string").str.strip().str.title()
    route_df = route_df.dropna(subset=FEATURE_COLS + [TARGET_COL])
    route_df = route_df[route_df[TARGET_COL].isin(["Safe", "Moderate", "Unsafe"])]

    if route_df.empty:
        raise ValueError("No valid labelled route_safety_record rows found.")
    if route_df[TARGET_COL].nunique() < 2:
        raise ValueError("At least two target classes are required for training.")

    X = route_df[FEATURE_COLS]
    y_raw = route_df[TARGET_COL].astype(str)
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")
    print(f"Target distribution: {y_raw.value_counts().to_dict()}")
    print(f"Label mapping: {dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_)))}")
    print(f"Holdout accuracy (unverified supplied labels): {accuracy_score(y_test, predictions):.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, predictions, target_names=label_encoder.classes_, zero_division=0))
    print("Confusion matrix (rows=true, columns=predicted):")
    print(confusion_matrix(y_test, predictions))
    print("Feature importances:")
    for feature, importance in sorted(
        zip(FEATURE_COLS, model.feature_importances_), key=lambda item: -item[1]
    ):
        print(f"  {feature}: {importance:.4f}")

    joblib.dump(model, MODEL_OUT)
    joblib.dump(label_encoder, LABEL_ENCODER_OUT)
    print(f"\nSaved model: {MODEL_OUT}")
    print(f"Saved label encoder: {LABEL_ENCODER_OUT}")
    print("Note: evaluation reflects the supplied target labels; it does not validate real-world route safety.")


if __name__ == "__main__":
    main()
