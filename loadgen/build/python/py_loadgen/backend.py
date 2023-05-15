"""
abstract backend class
"""


# pylint: disable=unused-argument,missing-docstring

class Backend():
    def __init__(self):
        self.inputs = []
        self.outputs = []

    def version(self):
        raise NotImplementedError("Backend:version")

    def name(self):
        raise NotImplementedError("Backend:name")

