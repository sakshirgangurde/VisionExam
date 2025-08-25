# # train_yolo.py
# import torch
# from yolov5 import train, val

# # Configuration
# data_config = {
#     'train': 'dataset/images/train',
#     'val': 'dataset/images/val',
#     'nc': 9,  # Number of classes
#     'names': ['one', 'two', 'three', 'four']
# }

# # Training parameters
# train.run(
#     data='data.yaml',
#     imgsz=640,
#     batch_size=16,
#     epochs=100,
#     weights='yolov5s.pt',
#     device='0'  # GPU
# )

# # Validate
# val.run(
#     data='data.yaml',
#     weights='runs/train/exp/weights/best.pt',
#     batch_size=8
# )