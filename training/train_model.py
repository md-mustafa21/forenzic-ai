import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# Dataset path
DATASET_PATH = r"C:\Users\Mustafa21\Downloads\real_vs_fake\real-vs-fake"

TRAIN_DIR = os.path.join(DATASET_PATH, "train")
VALID_DIR = os.path.join(DATASET_PATH, "valid")

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 8
EPOCHS = 10

# Data Augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    zoom_range=0.15,
    horizontal_flip=True,
    width_shift_range=0.1,
    height_shift_range=0.1
)

valid_datagen = ImageDataGenerator(
    rescale=1./255
)

# Dataset Loaders
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=True
)

valid_generator = valid_datagen.flow_from_directory(
    VALID_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)

print("\nClass Mapping:")
print(train_generator.class_indices)

# MobileNetV2 Base Model
base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(224, 224, 3)
)

# Transfer Learning Stage 1
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
x = Dropout(0.5)(x)
output = Dense(1, activation="sigmoid")(x)

model = Model(inputs=base_model.input, outputs=output)

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# Train using FULL dataset
history = model.fit(
    train_generator,
    validation_data=valid_generator,
    epochs=EPOCHS
)

# Save model
SAVE_PATH = r"C:\Users\Mustafa21\.gemini\antigravity-ide\scratch\forenzic-ai\backend\models\deepfake_detector.h5"

model.save(SAVE_PATH)

print(f"\nModel saved successfully at:\n{SAVE_PATH}")
