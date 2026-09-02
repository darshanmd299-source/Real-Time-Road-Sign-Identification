import os
import sys
import json
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from training.preprocessing import load_and_preprocess_dataset, split_dataset

def evaluate_trained_model():
    print("==========================================================================")
    print("📊 Evaluating BharatSign AI Model on Unseen Test Dataset")
    print("==========================================================================")

    models_dir = "d:/mproject/models"
    results_dir = "d:/mproject/results"
    model_path = os.path.join(models_dir, "road_sign_model.h5")
    labels_path = os.path.join(models_dir, "labels.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Train model first!")

    # 1. Load Model & Label Map
    model = tf.keras.models.load_model(model_path)
    with open(labels_path, "r") as f:
        labels_map = json.load(f)

    class_names = [labels_map[str(i)]["class"] for i in range(len(labels_map))]

    # 2. Load Dataset & Extract Test Split
    X, y, _, _ = load_and_preprocess_dataset("d:/mproject/dataset")
    _, _, (X_test, y_test) = split_dataset(X, y, 0.70, 0.15, 0.15)

    y_test_cat = tf.keras.utils.to_categorical(y_test, len(class_names))

    # 3. Model Inference
    test_loss, test_acc = model.evaluate(X_test, y_test_cat, verbose=0)
    predictions = model.predict(X_test, verbose=0)
    y_pred = np.argmax(predictions, axis=1)

    # 4. Calculate Detailed Metrics
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='macro')
    precision_micro, recall_micro, f1_micro, _ = precision_recall_fscore_support(y_test, y_pred, average='micro')
    
    cm = confusion_matrix(y_test, y_pred)
    per_class_acc = (cm.diagonal() / cm.sum(axis=1)).tolist()

    report_str = classification_report(y_test, y_pred, target_names=class_names)

    print(f"\n🎯 Test Set Metrics Summary ({len(X_test)} Test Images):")
    print(f"  • Test Accuracy  : {test_acc * 100:.2f}%")
    print(f"  • Test Loss      : {test_loss:.4f}")
    print(f"  • Macro Precision: {precision * 100:.2f}%")
    print(f"  • Macro Recall   : {recall * 100:.2f}%")
    print(f"  • Macro F1-Score : {f1 * 100:.2f}%")
    
    print("\n📋 Per-Class Accuracy:")
    for idx, name in enumerate(class_names):
        print(f"  • Class '{name}': {per_class_acc[idx] * 100:.2f}%")

    print("\n📄 Detailed Classification Report:\n", report_str)

    # 5. Export Metrics Summary JSON
    metrics_data = {
        "test_samples": int(len(X_test)),
        "test_accuracy_pct": round(float(test_acc * 100), 2),
        "test_loss": round(float(test_loss), 4),
        "precision_macro_pct": round(float(precision * 100), 2),
        "recall_macro_pct": round(float(recall * 100), 2),
        "f1_score_macro_pct": round(float(f1 * 100), 2),
        "per_class_accuracy_pct": {class_names[i]: round(float(per_class_acc[i] * 100), 2) for i in range(len(class_names))},
        "confusion_matrix": cm.tolist()
    }

    metrics_file = os.path.join(results_dir, "metrics_summary.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics_data, f, indent=4)

    # 6. Generate & Save Confusion Matrix Plot
    plt.figure(figsize=(9, 7))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names,
                cbar=True, square=True, linewidths=1)
    
    plt.title(f'Confusion Matrix (Test Accuracy: {test_acc * 100:.2f}%)', fontsize=13, fontweight='bold', pad=15)
    plt.xlabel('Predicted Road Sign Class', fontsize=11, fontweight='bold')
    plt.ylabel('Actual Ground Truth Class', fontsize=11, fontweight='bold')
    plt.xticks(rotation=30, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()

    cm_plot_path = os.path.join(results_dir, "confusion_matrix.png")
    plt.savefig(cm_plot_path, dpi=300)
    plt.close()

    print(f"\n✅ Evaluation Complete!")
    print(f"  • Metrics Summary JSON Saved : {metrics_file}")
    print(f"  • Confusion Matrix Plot Saved : {cm_plot_path}")

    return metrics_data

if __name__ == "__main__":
    evaluate_trained_model()
