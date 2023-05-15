import numpy as np
import cv2

def convert_to_np(data: bytes):
    """
    Convert data to numpy array
    """
    img = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(img, cv2.IMREAD_COLOR)
    return image
    