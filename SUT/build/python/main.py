#!/usr/bin/env python3

import threading
from typing import Iterator, List
import basic_pb2
import basic_pb2_grpc
import grpc
import pickle

# TODO: replace with typer
import argparse

from queue import Queue
from enum import Enum
from concurrent import futures
import os
import multiprocessing as mp
from multiprocessing.pool import ThreadPool

class Task(str, Enum):
    DownloadModel = 'download'
    Serve = 'serve'


def download_model(task_args: List[str]):
    import model_downloader
    parser = argparse.ArgumentParser()
    parser.add_argument('--runtime', type=str, help="The runtime of the model")
    parser.add_argument('--model', type=str, help="The model to serve")
    parser.add_argument('--model-out', type=str, help="The path to save the model")
    args = parser.parse_args(task_args)
    runtime = args.runtime
    model = args.model
    full_data = model_downloader.download_model(runtime, model)
    with open(args.model_out, 'wb') as f:
        f.write(full_data)


def get_backend(backend):
    if backend == "tensorflow":
        from backend_tf import BackendTensorflow
        backend = BackendTensorflow()
    elif backend == "onnxruntime":
        from backend_onnxruntime import BackendOnnxruntime
        backend = BackendOnnxruntime()
    elif backend == "null":
        from backend_null import BackendNull
        backend = BackendNull()
    elif backend == "pytorch":
        from backend_pytorch import BackendPytorch
        backend = BackendPytorch()
    elif backend == "pytorch-native":
        from backend_pytorch_native import BackendPytorchNative
        backend = BackendPytorchNative()
    elif backend == "tflite":
        from backend_tflite import BackendTflite
        backend = BackendTflite()
    elif backend == "uspp":
        from backend_uspp import BackendUSPP
        backend = BackendUSPP()
    elif backend == "spacy":
        from backend_spacy import BackendSpaCy
        backend = BackendSpaCy()
    else:
        raise ValueError("unknown backend: " + backend)
    return backend


class BasicServiceServicer(basic_pb2_grpc.BasicServiceServicer):
    model = None
    def __init__(self, backend, model_path, inputs, outputs, threads=0, consumers_per_client=3, model_shape=300, gpu=False) -> None:
        self.model = backend.load(model_path, inputs=inputs, outputs=outputs, threads=threads, shape=model_shape, gpu=gpu)
        self.model_path = model_path
        self.backend = backend
        self.outputs = outputs
        self.inputs = inputs
        self.threads = threads
        self.consumers_per_client = consumers_per_client
        super().__init__()

    def InferenceItem(self, request: basic_pb2.RequestItem, context: grpc.ServicerContext):
        items = self.backend.parse_query(request.items, request.preprocessed)
        results = self.model.predict(items)
        results = self.backend.serialize_response(results)
        response: basic_pb2.ItemResult = basic_pb2.ItemResult(results=results, id=request.id, size=len(results))
        return response
    
    def _inferenceItem(self, request: basic_pb2.RequestItem):
        try:
            items = self.backend.parse_query(request.items, request.preprocessed)
            results = self.model.predict(items)
            results = self.backend.serialize_response(results)
            response: basic_pb2.ItemResult = basic_pb2.ItemResult(results=results, id=request.id, size=len(results))
            return response
        except Exception as e:
            print(e)
            raise e
            
    def _pullFromQueue(self, request_queue: Queue, result_queue: Queue):
        while True:
            request = request_queue.get()
            if request is None:
                return
            result_queue.put(self._inferenceItem(request))

    def _putToQueue(self, request_iterator: Iterator[basic_pb2.RequestItem], request_queue: Queue):
        for request in request_iterator:
            request_queue.put(request)
    
    def _handleRequestIterator(self, request_iterator: Iterator[basic_pb2.RequestItem]):
        result_queue = mp.Queue()
        request_queue = mp.Queue()
        consumers = [mp.Process(target=self._pullFromQueue, args=(request_queue, result_queue)) for _ in range(self.consumers_per_client)]
        builder = mp.Process(target=self._putToQueue, args=(request_iterator, request_queue))
        print("Started")
        builder.start()
        for consumer in consumers:
            consumer.daemon = True
            consumer.start()
        while True:
            if not builder.is_alive():
                for _ in range(self.consumers_per_client):   
                    request_queue.put(None)
            if True in [c.is_alive() for c in consumers] or not result_queue.empty():
                try:
                    yield result_queue.get(block=False)
                except:
                    pass
            else:
                return


    def StreamInferenceItem(self, request_iterator, context):
        for request in request_iterator:
            yield self._inferenceItem(request)

    def StreamInferenceItem(self, request_iterator, context):
        with ThreadPool(processes=self.consumers_per_client) as p:
            iter = p.imap_unordered(self._inferenceItem, request_iterator)
            for res in iter:
                yield res


    def ChangeThreads(self, request, context):
        n = request.threads
        if n == self.threads:
            return basic_pb2.ThreadReply(ok=True)
        self.model = self.backend.load(self.model_path, self.inputs, self.outputs, n)
        
        self.threads = n
        return basic_pb2.ThreadReply(ok=True)



def get_args(extra_args: List[str]):
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-threads", type=int, default=0,
                        help="the number of threads the model should run for inferencing a single query")
    parser.add_argument("--model-path", type=str, help="the path to the model", required=False)
    parser.add_argument("--model", type=str, help="the name of the model to serve", required=False)
    parser.add_argument("--model-shape", type=str, help="The dimensions of the images processed by the model", required=False, default=300)
    parser.add_argument("--runtime", type=str, help="the runtime name", default="onnxruntime")
    parser.add_argument("--consumer-threads", type=int, default=2,
                        help="the number of consumer threads each client gets")
    parser.add_argument("--worker-threads", type=int, default=32,
                        help="the number of worker processes allocated by grpc")
    parser.add_argument("--inputs", help="model inputs, comma separated", required=False, default=None)
    parser.add_argument("--outputs", help="model outputs, comma separated", required=False, default='num_detections:0,detection_boxes:0,detection_scores:0,detection_classes:0')
    parser.add_argument("--gpu", help="use gpu", action="store_true")
    args = parser.parse_args(extra_args)
    if args.model_path is None and args.model is None:
        raise Exception("Either --model-path or --model needs to be provided")
    if args.inputs is not None:
        args.inputs = args.inputs.split(",")
    if args.outputs is not None:
        args.outputs = args.outputs.split(",")
    return args

def serve(extra_args: List[str]):
    args = get_args(extra_args)
    runtime = args.runtime
    if args.model_path is not None:
        model_path = args.model_path
    else:
        model_path = args.model
    
    if not os.path.exists(model_path):
        print("Model not found, downloading...")
        if args.model is None:
            raise Exception("Model name not provided")
        model = args.model
        download_model(["--model", model, "--runtime", runtime, "--model-out", model_path])
            
    backend = get_backend(runtime)
    print("Listening on [0.0.0.0:8086]...")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=args.worker_threads))
    basic_pb2_grpc.add_BasicServiceServicer_to_server(
        BasicServiceServicer(backend, model_path, args.inputs, args.outputs, threads=args.model_threads, consumers_per_client=args.consumer_threads, model_shape=args.model_shape, gpu=args.gpu), server)
    server.add_insecure_port('0.0.0.0:8086')
    server.start()
    server.wait_for_termination()


def main():
    import sys
    parser = argparse.ArgumentParser()

    serve(sys.argv[1:])

if __name__ == '__main__':
    main()