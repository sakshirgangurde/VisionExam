# import cv2
# import numpy as np
# import torch
# from flask import Flask, request, jsonify

# app = Flask(__name__)

# # Load YOLOv5 model (custom trained for hand gestures)
# model = torch.hub.load('ultralytics/yolov5', 'custom', path='hand_gesture_yolov5.pt')

# # Gesture class mapping
# GESTURE_MAP = {
#     0: 'one',
#     1: 'two',
#     2: 'three',
#     3: 'four',
# }

# @app.route('/detect', methods=['POST'])
# def detect():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image provided'}), 400
    
#     # Read and preprocess image
#     file = request.files['image']
#     img_bytes = file.read()
#     img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    
#     # Run YOLO detection
#     results = model([img])
    
#     # Process results
#     detections = []
#     for *xyxy, conf, cls in results.xyxy[0]:
#         if conf > 0.7:  # Confidence threshold
#             detections.append({
#                 'gesture': GESTURE_MAP[int(cls)],
#                 'confidence': float(conf),
#                 'bbox': [float(x) for x in xyxy]
#             })
    
#     return jsonify({'detections': detections})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)