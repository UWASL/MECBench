
import requests
from requests.models import Response
import tqdm
import os

MODEL_URLS = {
    "onnxruntime":{
        "ssd-mobilenet": "https://zenodo.org/record/4735652/files/ssd_mobilenet_v1_coco_2018_01_28.onnx"
    }
}

def download_model(runtime = "onnxruntime", model = "ssd-mobilenet"):
    try:
        url = MODEL_URLS[runtime][model]
    except:
        raise Exception(f"URL for the model {model} on the backend {runtime} not found")

    response = requests.get(url=url, stream=True)
    if response.status_code != 200:
        raise Exception(f"Get request to {url} failed with status code {response.status_code}")
    length = int(response.headers.get("content-length"))
    # model_bytes = response.content
    full_data = bytearray()

    with tqdm.tqdm(total=int(length)) as pbar:
        for data in response.iter_content(chunk_size=8192):
            pbar.update(len(data))
            full_data += data

    
    return full_data
