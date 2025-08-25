
# import tensorflow as tf
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
# from tensorflow.keras.applications import MobileNetV2
# from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
# from tensorflow.keras.models import Model
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
# import os
# import numpy as np

# # Configuration
# BASE_DIR = 'dataset'
# TRAIN_DIR = os.path.join(BASE_DIR, 'train')
# VAL_DIR = os.path.join(BASE_DIR, 'val')
# TEST_DIR = os.path.join(BASE_DIR, 'test')
# IMG_SIZE = (224, 224)
# BATCH_SIZE = 32
# EPOCHS = 30
# LEARNING_RATE = 1e-4

# # Get class names from train directory
# class_names = sorted([d for d in os.listdir(TRAIN_DIR) if os.path.isdir(os.path.join(TRAIN_DIR, d))])
# num_classes = len(class_names)

# print(f"Found {num_classes} classes: {class_names}")

# # Data augmentation for training
# train_datagen = ImageDataGenerator(
#     rescale=1./255,
#     rotation_range=20,
#     width_shift_range=0.2,
#     height_shift_range=0.2,
#     shear_range=0.15,
#     zoom_range=0.15,
#     horizontal_flip=True,
#     fill_mode='nearest'
# )

# # Validation and test generators (only rescaling)
# val_datagen = ImageDataGenerator(rescale=1./255)
# test_datagen = ImageDataGenerator(rescale=1./255)

# # Data generators
# train_generator = train_datagen.flow_from_directory(
#     TRAIN_DIR,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode='categorical',
#     shuffle=True
# )

# val_generator = val_datagen.flow_from_directory(
#     VAL_DIR,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode='categorical',
#     shuffle=False
# )

# test_generator = test_datagen.flow_from_directory(
#     TEST_DIR,
#     target_size=IMG_SIZE,
#     batch_size=BATCH_SIZE,
#     class_mode='categorical',
#     shuffle=False
# )

# # Create model using transfer learning
# base_model = MobileNetV2(
#     weights='imagenet',
#     include_top=False,
#     input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
# )

# # Freeze base model layers
# base_model.trainable = False

# # Add custom head
# inputs = tf.keras.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
# x = base_model(inputs, training=False)
# x = GlobalAveragePooling2D()(x)
# x = Dense(256, activation='relu')(x)
# x = Dropout(0.3)(x)
# outputs = Dense(num_classes, activation='softmax')(x)

# model = Model(inputs, outputs)

# # Compile model
# model.compile(
#     optimizer=Adam(learning_rate=LEARNING_RATE),
#     loss='categorical_crossentropy',
#     metrics=['accuracy']
# )

# # Callbacks
# checkpoint = ModelCheckpoint(
#     'models/hand_gesture/best_model',
#     monitor='val_accuracy',
#     save_best_only=True,
#     mode='max'
# )

# early_stopping = EarlyStopping(
#     monitor='val_loss',
#     patience=10,
#     restore_best_weights=True
# )

# # Train model
# history = model.fit(
#     train_generator,
#     steps_per_epoch=train_generator.samples // BATCH_SIZE,
#     epochs=EPOCHS,
#     validation_data=val_generator,
#     validation_steps=val_generator.samples // BATCH_SIZE,
#     callbacks=[checkpoint, early_stopping]
# )

# # Evaluate on test set
# test_loss, test_acc = model.evaluate(test_generator)
# print(f"\nTest accuracy: {test_acc:.4f}")

# # Save the final model
# model.save('models/hand_gesture/final_model')
# print("Model saved successfully")

# # Save class names
# with open('models/hand_gesture/class_names.txt', 'w') as f:
#     f.write('\n'.join(class_names))