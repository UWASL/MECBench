"""
onnxruntime backend (https://github.com/microsoft/onnxruntime)
"""

# pylint: disable=unused-argument,missing-docstring,useless-super-delegation

import backend
import numpy as np
import onnxruntime as rt
import preprocess


class BackendOnnxruntime(backend.Backend):
    def __init__(self):
        super(BackendOnnxruntime, self).__init__()

    def version(self):
        return rt.__version__

    def name(self):
        """Name of the runtime."""
        return "onnxruntime"

    def image_format(self):
        """image_format. For onnx it is always NCHW."""
        return "NCHW"

    def load(self, model_path, inputs=None, outputs=None, threads=0, shape=300, gpu=False, **kwargs):
        """Load model and find input/outputs from the model file."""
        opt = rt.SessionOptions()
        # enable level 3 optimizations
        # FIXME: enable below once onnxruntime 0.5 is released
        # opt.set_graph_optimization_level(3)
        # opt.inter_op_num_threads = 1
        opt.log_severity_level = 3
        opt.intra_op_num_threads = threads
        providers = None
        if gpu:
            providers = ["CUDAExecutionProvider"]
        self.sess = rt.InferenceSession(model_path, opt, providers=providers)
        # get input and output names
        if not inputs:
            self.inputs = [meta.name for meta in self.sess.get_inputs()]
        else:
            self.inputs = inputs
        if not outputs:
            self.outputs = [meta.name for meta in self.sess.get_outputs()]
        else:
            self.outputs = outputs
        self.shape = (1, int(shape), int(shape), 3)
        return self
    
    def parse_query(self, items: bytes, preprocessed=True) -> np.ndarray:
        if not preprocessed:
            items = preprocess.convert_to_np(items)
        else:
            items = np.frombuffer(items, np.uint8)
        items.shape = self.shape
        return items

    def serialize_response(self, res: np.ndarray) -> bytes:
        """
        (1,)        float32 number of objects
        (1, 100, 4) float32 bounding boxes
        (1, 100)    float32 confidence
        (1, 100)    float32 classes (labels)
        """
        results = res[0].tobytes() + res[2].tobytes() + res[3].tobytes() + res[1].tobytes()
        return results

    def predict(self, feed):
        """Run the prediction."""
        feed = {self.inputs[0]: feed}
        return self.sess.run(self.outputs, feed)
