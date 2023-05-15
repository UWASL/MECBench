"""
uspp backend
"""
import numpy as np
import USPP.segwscribb_dev as segwscribb_dev
import time

# pylint: disable=unused-argument,missing-docstring,useless-super-delegation
import backend


class USPPQuery():
    def __init__(self, image: np.ndarray,
                 scribble=None, minLabels=3, nChannel=100,
                 lr=0.001, stepsize_sim=1, stepsize_con=1,
                 stepsize_scr=0.5, maxIter=200, hidden_layers=3) -> None:
        self.image: np.ndarray = image
        self.scribble = scribble
        self.minLabels = minLabels
        self.nChannel = nChannel
        self.lr = lr
        self.stepsize_sim = stepsize_sim
        self.stepsize_con = stepsize_con
        self.stepsize_scr = stepsize_scr
        self.maxIter = maxIter
        self.hidden_layers = hidden_layers


class BackendUSPP(backend.Backend):
    def __init__(self):
        super(BackendUSPP, self).__init__()

    def version(self):
        return "-"

    def name(self):
        return "uspp"

    def image_format(self):
        return "NHWC"

    def load(self, model_path=None, inputs=None, outputs=None, **xargs):
        self.outputs = ["output"]
        self.inputs = ["input"]
        return self

    def parse_query(self, query: bytes) -> USPPQuery:
        print("Here")
        d1 = int.from_bytes(query[:8], byteorder="big")
        d2 = int.from_bytes(query[8:16], byteorder="big")
        c = int.from_bytes(query[16:17], byteorder="big")
        img = query[17:]
        img = np.frombuffer(img, dtype=np.uint8)
        img.shape = (d1, d2, c)
        return USPPQuery(img)

    def predict(self, feed: dict):
        feed = feed[self.inputs[0]]
        res = segwscribb_dev.segment(feed.image, scribble=feed.scribble, minLabels=feed.minLabels,
                                    nChannel=feed.nChannel, lr=feed.lr, stepsize_sim=feed.stepsize_sim,
                                    stepsize_con=feed.stepsize_con, stepsize_scr=feed.stepsize_scr,
                                    maxIter=feed.maxIter, hidden_layers=feed.hidden_layers)
        return res
