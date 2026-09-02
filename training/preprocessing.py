import os
import cv2
import numpy as np
from PIL import Image
import random
import json

# Class configuration
CLASS_MAPPING = {
    0: {"folder": "No_Entry", "name": "No Entry", "action": "Do Not Enter", "instruction": "STOP / DO NOT ENTER", "target_speed": 0},
    1: {"folder": "No_Overtaking", "name": "No Overtaking", "action": "Do Not Overtake", "instruction": "DO NOT OVERTAKE", "target_speed": 40},
    2: {"folder": "Road_Hump", "name": "Road Hump", "action": "Reduce Speed", "instruction": "REDUCE SPEED", "target_speed": 20},
    3: {"folder": "No_Left_Turn", "name": "No Left Turn", "action": "Do Not Turn Left", "instruction": "NO LEFT TURN", "target_speed": 30},
    4: {"folder": "No_Parking", "name": "No Parking", "action": "Parking Not Allowed", "instruction": "DO NOT PARK", "target_speed": 35}
}

IMG_SIZE = (64, 64)

def ensure_dataset_structure(base_dir="d:/mproject/dataset"):
    """Ensure dataset subfolders exist and populate synthetic samples only if completely empty."""
    os.makedirs(base_dir, exist_ok=True)
    
    for class_id, info in CLASS_MAPPING.items():
        folder_path = os.path.join(base_dir, info["folder"])
        os.makedirs(folder_path, exist_ok=True)
        
        # Check existing images
        existing = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(existing) == 0:
            print(f"Populating default dataset samples for '{info['name']}' in {folder_path}...")
            _generate_class_samples(class_id, folder_path, count=200)

def _generate_class_samples(class_id: int, output_dir: str, count: int = 200):
    """Generate clean, highly distinctive annotated training images for each road sign class."""
    for idx in range(count):
        img = np.full((64, 64, 3), 240, dtype=np.uint8)
        center = (32, 32)
        radius = 26

        if class_id == 0:  # No Entry (Red Circle + White Bar)
            cv2.circle(img, center, radius, (0, 0, 220), -1)
            cv2.rectangle(img, (12, 27), (52, 37), (255, 255, 255), -1)
        elif class_id == 1:  # No Overtaking (Red Border + Dual Cars + Slash)
            cv2.circle(img, center, radius, (0, 0, 220), -1)
            cv2.circle(img, center, radius - 4, (255, 255, 255), -1)
            cv2.rectangle(img, (34, 24), (45, 40), (20, 20, 20), -1)
            cv2.rectangle(img, (19, 24), (30, 40), (0, 0, 220), -1)
            cv2.line(img, (15, 15), (49, 49), (0, 0, 220), 4)
        elif class_id == 2:  # Road Hump (Yellow/Red Triangle + Hump Arc)
            pts = np.array([[32, 8], [56, 54], [8, 54]], np.int32)
            cv2.fillPoly(img, [pts], (255, 255, 255))
            cv2.polylines(img, [pts], True, (0, 0, 220), 4)
            cv2.ellipse(img, (32, 44), (13, 8), 0, 180, 360, (20, 20, 20), 4)
        elif class_id == 3:  # No Left Turn (Red Border + Curved Left Arrow + Slash)
            cv2.circle(img, center, radius, (0, 0, 220), -1)
            cv2.circle(img, center, radius - 4, (255, 255, 255), -1)
            path_pts = np.array([[40, 44], [40, 32], [28, 32]], np.int32)
            cv2.polylines(img, [path_pts], False, (20, 20, 20), 4)
            cv2.arrowedLine(img, (30, 32), (18, 32), (20, 20, 20), 4, tipLength=0.5)
            cv2.line(img, (15, 15), (49, 49), (0, 0, 220), 4)
        elif class_id == 4:  # No Parking (Blue Disc + Red Border & Slash)
            cv2.circle(img, center, radius, (0, 0, 220), -1)
            cv2.circle(img, center, radius - 4, (180, 50, 20), -1)
            cv2.putText(img, "P", (22, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.line(img, (15, 15), (49, 49), (0, 0, 220), 4)

        # Apply mild random spatial variation
        angle = random.uniform(-8, 8)
        scale = random.uniform(0.92, 1.08)
        M = cv2.getRotationMatrix2D(center, angle, scale)
        img = cv2.warpAffine(img, M, (64, 64), borderValue=(240, 240, 240))

        # Mild brightness variation & noise
        brightness_factor = random.uniform(0.9, 1.1)
        img = np.clip(img.astype(np.float32) * brightness_factor, 0, 255).astype(np.uint8)

        filepath = os.path.join(output_dir, f"sample_{idx:04d}.png")
        cv2.imwrite(filepath, img)

def load_and_preprocess_dataset(base_dir="d:/mproject/dataset", img_size=(64, 64)):
    """
    Scans dataset, filters corrupted images, resizes, normalizes, 
    and returns (X, y, class_names, class_counts).
    """
    ensure_dataset_structure(base_dir)

    images = []
    labels = []
    class_counts = {}
    class_names = []

    # Map subfolders to index
    folders = sorted([f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f))])

    for class_idx, folder_name in enumerate(folders):
        folder_path = os.path.join(base_dir, folder_name)
        class_names.append(folder_name)
        valid_count = 0

        for file_name in os.listdir(folder_path):
            if not file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                continue

            file_path = os.path.join(folder_path, file_name)
            
            # Filter corrupted/unreadable images
            try:
                img = Image.open(file_path)
                img.verify() # Verify file header
                img = Image.open(file_path) # Re-open after verify
                img = img.convert('RGB')
                img = img.resize(img_size, Image.Resampling.BILINEAR)
                
                img_array = np.array(img, dtype=np.float32) / 255.0
                images.append(img_array)
                labels.append(class_idx)
                valid_count += 1
            except Exception as e:
                print(f"Skipping corrupted image: {file_path} ({e})")

        class_counts[folder_name] = valid_count

    X = np.array(images, dtype=np.float32)
    y = np.array(labels, dtype=np.int64)

    return X, y, class_names, class_counts

def split_dataset(X, y, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42):
    """Executes stratified 70% train / 15% val / 15% test split without data leakage."""
    np.random.seed(seed)
    num_samples = len(X)
    indices = np.arange(num_samples)
    
    # Stratified shuffle
    unique_classes = np.unique(y)
    train_idx, val_idx, test_idx = [], [], []

    for c in unique_classes:
        cls_indices = indices[y == c]
        np.random.shuffle(cls_indices)
        
        n_cls = len(cls_indices)
        n_train = int(n_cls * train_ratio)
        n_val = int(n_cls * val_ratio)
        
        train_idx.extend(cls_indices[:n_train])
        val_idx.extend(cls_indices[n_train:n_train + n_val])
        test_idx.extend(cls_indices[n_train + n_val:])

    np.random.shuffle(train_idx)
    np.random.shuffle(val_idx)
    np.random.shuffle(test_idx)

    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    return (X_train, y_train), (X_val, y_val), (X_test, y_test)

if __name__ == "__main__":
    X, y, class_names, counts = load_and_preprocess_dataset()
    print("Class Counts:", counts)
    (X_tr, y_tr), (X_v, y_v), (X_te, y_te) = split_dataset(X, y)
    print(f"Total Images: {len(X)} | Train: {len(X_tr)} | Val: {len(X_v)} | Test: {len(X_te)}")
