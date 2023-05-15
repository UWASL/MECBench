import array
import time
import numpy as np
import mlperf_loadgen as lg
import threading
from queue import Queue
import math
import basic_pb2
import basic_pb2_grpc
import grpc

import random
import socket
import pickle
import asyncio
# TODO: remove dependency
import cli_colors

import logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("main")

class Item:
    """An item that we queue for processing by the thread pool."""

    def __init__(self, query_id, content_id, img, label=None):
        self.query_id = query_id
        self.content_id = content_id
        self.img: np.ndarray = img
        self.label = label
        self.start = time.time()


class RunnerBase:

    time_taken = []
    pickling = []
    coms = []
    batches = 0
    samples = 0

    def __init__(self, model, ds, threads, post_proc=None, max_batchsize=128, timeout=1, **_):
        self.take_accuracy = False
        self.ds = ds
        self.model = model
        self.post_process = post_proc
        self.threads = threads
        self.take_accuracy = False
        self.max_batchsize = max_batchsize
        self.result_timing = []
        self.timeout = timeout

    def handle_tasks(self, tasks_queue):
        pass

    def start_run(self, result_dict, take_accuracy):
        self.result_dict = result_dict
        self.result_timing = []
        self.take_accuracy = take_accuracy
        self.post_process.start()

    def predict(self, qitem: Item):
        s = time.time()
        results = self.model.predict({self.model.inputs[0]: qitem.img})
        e = time.time()
        self.time_taken.append(e-s)
        return results

    def run_one_item(self, qitem):
        # run the prediction
        processed_results = []
        try:
            results = self.predict(qitem)
            processed_results = self.post_process(results, qitem.content_id, qitem.label, self.result_dict)
            
            if self.take_accuracy:
                self.post_process.add_results(processed_results)
                self.result_timing.append(time.time() - qitem.start)
        except Exception as ex:  # pylint: disable=broad-except
            src = [self.ds.get_item_loc(i) for i in qitem.content_id]
            log.error("thread: failed on contentid=%s, %s", src, ex)
            # since post_process will not run, fake empty responses
            processed_results = [[]] * len(qitem.query_id)
        finally:
            response_array_refs = []
            response = []
            for idx, query_id in enumerate(qitem.query_id):
                response_array = array.array("B", np.array(processed_results[idx], np.float32).tobytes())
                response_array_refs.append(response_array)
                bi = response_array.buffer_info()
                # request timeout
                if len(processed_results[idx]) > 0 and processed_results[idx][0] == -1:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], lg.InvalidSize()))
                else:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], bi[1]))
            lg.QuerySamplesComplete(response)

    def enqueue(self, query_samples):
        idx = [q.index for q in query_samples]
        query_id = [q.id for q in query_samples]
        self.samples += len(query_samples)
        self.batches += math.ceil(len(query_samples)/self.max_batchsize)
        if len(query_samples) < self.max_batchsize:
            data, label = self.ds.get_samples(idx)
            self.run_one_item(Item(query_id, idx, data, label))
        else:
            bs = self.max_batchsize
            for i in range(0, len(idx), bs):
                data, label = self.ds.get_samples(idx[i:i+bs])
                self.run_one_item(Item(query_id[i:i+bs], idx[i:i+bs], data, label))

    def finish(self):
        import pandas as pd
        p_df = pd.DataFrame(self.pickling, columns=["Pickle", "Unpickle"])
        c_df = pd.DataFrame(self.coms)
        t_df = pd.DataFrame(self.time_taken)
        p_df.to_csv("pickling.csv")
        c_df.to_csv("communication.csv")
        t_df.to_csv("inference.csv")
        pass

class QueueRunner(RunnerBase):

    def __init__(self, model, ds, threads, post_proc=None, max_batchsize=128, **_):
        super().__init__(model, ds, threads, post_proc, max_batchsize)
        self.tasks = Queue(maxsize=threads * 4)
        self.workers = []
        self.result_dict = {}
        self._start_threads()
        
    def _start_threads(self):
        for _ in range(self.threads):
            worker = threading.Thread(target=self.handle_tasks, args=(self.tasks,))
            worker.daemon = True
            self.workers.append(worker)
            worker.start()

    def handle_tasks(self, tasks_queue):
        """Worker thread."""
        while True:
            qitem = tasks_queue.get()
            if qitem is None:
                # None in the queue indicates the parent want us to exit
                tasks_queue.task_done()
                break
            self.run_one_item(qitem)
            tasks_queue.task_done()

    def enqueue(self, query_samples):
        idx = [q.index for q in query_samples]
        query_id = [q.id for q in query_samples]
        self.samples += len(query_samples)
        self.batches += math.ceil(len(query_samples)/self.max_batchsize)
        if len(query_samples) < self.max_batchsize:
            data, label = self.ds.get_samples(idx)
            self.tasks.put(Item(query_id, idx, data, label))
        else:
            bs = self.max_batchsize
            for i in range(0, len(idx), bs):
                ie = i + bs
                data, label = self.ds.get_samples(idx[i:ie])
                self.tasks.put(Item(query_id[i:ie], idx[i:ie], data, label))

    def finish(self):
        # exit all threads
        for _ in self.workers:
            self.tasks.put(None)
        for worker in self.workers:
            worker.join()
        super().finish()

# TODO: Re-structure inheritance to write the remote functionality once

class RemoteRunnerBase(RunnerBase):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, SUT_address="localhost:8086", timeout=None, **_):
        super().__init__(None, ds, threads, post_proc=post_proc, max_batchsize=max_batchsize)
        self.timeout = timeout
        self.connect(SUT_address)
    
    def connect(self, SUT_address):
        self.SUT_address = SUT_address
        self.channel = grpc.insecure_channel(SUT_address)
        self.stub = basic_pb2_grpc.BasicServiceStub(self.channel)

    def predict(self, qitem: Item):
        request = basic_pb2.RequestItem(items=qitem.img[0].tobytes(), id=qitem.content_id[0])
        try:
            response: basic_pb2.ItemResult = self.stub.InferenceItem(request, timeout = self.timeout) 
            result = [[r] for r in response.results]
            return result
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
                cli_colors.color_print(f"gRPC Error: {e.code()}", cli_colors.MAGENTA)
                return [None]*len(qitem.img)

    
class RemoteQueueRunner(QueueRunner):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, SUT_address="localhost:8086", timeout=None, **_):
        super().__init__(None, ds, threads, post_proc=post_proc, max_batchsize=max_batchsize)
        self.timeout = timeout
        self.connect(SUT_address)
    
    def connect(self, SUT_address):
        self.SUT_address = SUT_address
        self.channel = grpc.insecure_channel(SUT_address)
        self.stub = basic_pb2_grpc.BasicServiceStub(self.channel)

    def predict(self, qitem: Item):
        s = time.time()
        item_pickle = pickle.dumps(qitem.img)
        p1 = time.time()
        request = basic_pb2.RequestItem(items=item_pickle)
        try:
            response: basic_pb2.ItemResult = self.stub.InferenceItem(request, timeout=self.timeout)
            p2 = time.time()
            result, time_taken = pickle.loads(response.results)
            e = time.time()
            self.time_taken.append(time_taken)
            self.coms.append(p2 - p1 - time_taken)
            self.pickling.append((p1 - s, e - p2))
            return result
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
                return [None]*len(qitem.img)

class AsyncRemoteQueueRunner(QueueRunner):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, SUT_address="localhost:8086", timeout=None, max_outgoing=2, **_):
        super().__init__(None, ds, threads=0, post_proc=post_proc, max_batchsize=max_batchsize)
        self.threads = threads
        self.timeout = timeout
        self.max_outgoing = max_outgoing
        self.connect(SUT_address)
    
        for _ in range(self.threads):
            worker = threading.Thread(target=self.intermediate_handler, args=(self.tasks,))
            worker.daemon = True
            self.workers.append(worker)
            worker.start()

    def connect(self, SUT_address):
        self.SUT_address = SUT_address
        self.channel = grpc.insecure_channel(SUT_address)
        self.stub = basic_pb2_grpc.BasicServiceStub(self.channel)

    def predict(self, qitem: Item):
        s = time.time()
        item_pickle = pickle.dumps(qitem.img)
        p1 = time.time()
        request = basic_pb2.RequestItem(items=item_pickle)
        try:
            response: basic_pb2.ItemResult = self.stub.InferenceItem(request, timeout=self.timeout)
            p2 = time.time()
            result, time_taken = pickle.loads(response.results)
            e = time.time()
            self.time_taken.append(time_taken)
            self.coms.append(p2 - p1 - time_taken)
            self.pickling.append((p1 - s, e - p2))
            return result
        except grpc.RpcError as e:
            if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
                return [None]*len(qitem.img)

    async def handle_tasks(self, tasks_queue:Queue, max_outgoing=2):
        """Worker thread."""
        future_list = []
        broken = False
        while not broken or len(future_list) > 1:
            while len(future_list) < max_outgoing and not broken:
                try:
                    timeout = 1 if len(future_list) > 0 else None
                    qitem: Item = tasks_queue.get(timeout=timeout)
                    if qitem is None:
                        broken = True
                        # None in the queue indicates the parent want us to exit
                        tasks_queue.task_done()
                        break
                    else:
                        future = asyncio.Future()
                        asyncio.ensure_future(self.run_one_item(qitem, future))
                        future_list.append(future)
                except:
                    break
            if len(future_list) > 0:
                done, pending = await asyncio.wait(future_list, return_when=asyncio.FIRST_COMPLETED)
                future_list = list(pending)
                for _ in range(len(done)):
                    tasks_queue.task_done()

    def intermediate_handler(self, tasks_queue):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.handle_tasks(tasks_queue, self.max_outgoing))
        loop.close()

    def enqueue(self, query_samples):
        idx = [q.index for q in query_samples]
        query_id = [q.id for q in query_samples]
        self.samples += len(query_samples)
        self.batches += math.ceil(len(query_samples)/self.max_batchsize)
        if len(query_samples) < self.max_batchsize:
            data, label = self.ds.get_samples(idx)
            self.tasks.put(Item(query_id, idx, data, label))
        else:
            bs = self.max_batchsize
            for i in range(0, len(idx), bs):
                ie = i + bs
                data, label = self.ds.get_samples(idx[i:ie])
                self.tasks.put(Item(query_id[i:ie], idx[i:ie], data, label))

    async def run_one_item(self, qitem, future: asyncio.Future):
        # run the prediction
        processed_results = []
        try:

            results = self.predict(qitem)            
            processed_results = self.post_process(results, qitem.content_id, qitem.label, self.result_dict)
            
            if self.take_accuracy:
                self.post_process.add_results(processed_results)
                self.result_timing.append(time.time() - qitem.start)
        except Exception as ex:  # pylint: disable=broad-except
            src = [self.ds.get_item_loc(i) for i in qitem.content_id]
            log.error("thread: failed on contentid=%s, %s", src, ex)
            # since post_process will not run, fake empty responses
            processed_results = [[]] * len(qitem.query_id)
        finally:
            response_array_refs = []
            response = []
            for idx, query_id in enumerate(qitem.query_id):
                response_array = array.array("B", np.array(processed_results[idx], np.float32).tobytes())
                response_array_refs.append(response_array)
                bi = response_array.buffer_info()
                # request timeout
                if len(processed_results[idx]) > 0 and processed_results[idx][0] == -1:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], lg.InvalidSize()))
                else:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], bi[1]))
            lg.QuerySamplesComplete(response)
            future.set_result(1)

    def finish(self):
        # exit all threads
        for _ in self.workers:
            self.tasks.put(None)
        for worker in self.workers:
            worker.join()
        super().finish()

class StreamerQueueRunner(QueueRunner):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, 
    SUT_address="localhost:8086", timeout=None, max_outgoing=2,**_):
        super().__init__(None, ds, threads, post_proc=post_proc, max_batchsize=max_batchsize, **_)
        self.timeout = timeout
        self.max_outgoing = max_outgoing
        self.SUT_address = SUT_address
        self.connect()

        def _start_threads(self):
            for _ in range(self.threads):
                worker = threading.Thread(target=self.handle_tasks, args=(self.tasks, self.max_outgoing))
                worker.daemon = True
                self.workers.append(worker)
                worker.start()

    def connect(self):
        self.channel = grpc.insecure_channel(self.SUT_address)
    
    def get_new_stub(self):
        stub = basic_pb2_grpc.BasicServiceStub(self.channel)
        return stub
    
    def get_request_generator(self, pending_queue: Queue):
        while True:
            qitem, id = pending_queue.get()
            if qitem is None:
                # None in the queue indicates the parent want us to exit
                pending_queue.task_done()
                break
            item_pickle = pickle.dumps(qitem.img)
            yield basic_pb2.RequestItem(items=item_pickle, id=id)


    def process_response(self, response, qitem_cache):
        qitem = Item(query_id=qitem_cache[0], content_id=qitem_cache[1], img=None, label=qitem_cache[2])
        qitem.start = qitem_cache[3]
        response, _ = pickle.loads(response.results)
        try:
            processed_results = self.post_process(response, qitem.content_id, qitem.label, self.result_dict)
            if self.take_accuracy:
                    self.post_process.add_results(processed_results)
                    self.result_timing.append(time.time() - qitem.start)
        except Exception as ex:  # pylint: disable=broad-except
            src = [self.ds.get_item_loc(i) for i in qitem.content_id]
            log.error("thread: failed on contentid=%s, %s", src, ex)
            # since post_process will not run, fake empty responses
            processed_results = [[]] * len(qitem.query_id)
        finally:
            response_array_refs = []
            response = []
            for idx, query_id in enumerate(qitem.query_id):
                response_array = array.array("B", np.array(processed_results[idx], np.float32).tobytes())
                response_array_refs.append(response_array)
                bi = response_array.buffer_info()
                # request timeout
                if len(processed_results[idx]) > 0 and processed_results[idx][0] == -1:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], lg.InvalidSize()))
                else:
                    response.append(lg.QuerySampleResponse(query_id, bi[0], bi[1]))
            lg.QuerySamplesComplete(response)


    def consume(self, stub, requests_iter, cache):
            responses = stub.StreamInferenceItem(requests_iter)
            try:
                for response in responses:
                        self.process_response(response, cache[response.id])
                        del cache[response.id]
            except Exception as e:
                    cli_colors.color_print(e, cli_colors.RED)
                
    def handle_tasks(self, tasks_queue, max_outgoing=2):
        """Worker thread."""
        pending_queue = Queue()
        requestGenerator = self.get_request_generator(pending_queue)
        cache = {}
        stub = self.get_new_stub()
        consumer = threading.Thread(target=self.consume, args=(stub, requestGenerator, cache))
        consumer.daemon = True
        consumer.start()
        broken = False
        while not broken:
            while len(cache) < max_outgoing and not broken:
                try:
                    qitem: Item = tasks_queue.get()
                    id = random.randint(1, 99999999)
                    pending_queue.put((qitem, id))
                    cache[id] = None if qitem is None else (qitem.query_id, qitem.content_id, qitem.label, qitem.start)
                    if qitem is None:
                        broken = True
                        pending_queue.put((None, None))
                        break
                except Exception as e:
                    cli_colors.color_print(e, cli_colors.YELLOW)
                    break
        consumer.join()

class TCPRemoteRunnerBase(RunnerBase):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, SUT_address="localhost:8086"):
        super().__init__(None, ds, threads, post_proc=post_proc, max_batchsize=max_batchsize)
        self.connect(SUT_address)
    
    def connect(self, SUT_address):
        ip, port = SUT_address.split(":")
        self.server = (ip, int(port))
        self.sockfd = socket.socket(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP)
        self.sockfd.connect(self.server)

    def predict(self, qitem: Item):
        s = time.time()
        payload = pickle.dumps(qitem.img, protocol=0)
        size = len(payload)
        size_bytes = size.to_bytes(4, 'big')
        self.sockfd.send(size_bytes + payload)
        res_size = self.sockfd.recv(4, socket.MSG_WAITALL)
        res = self.sockfd.recv(int.from_bytes(res_size, 'big'), socket.MSG_WAITALL)
        e = time.time()
        self.time_taken.append(e-s)
        return pickle.loads(res)

class TCPRemoteQueueRunner(QueueRunner):
    def __init__(self, ds, threads, post_proc=None, max_batchsize=128, SUT_address="localhost:8086"):
        super().__init__(None, ds, threads, post_proc=post_proc, max_batchsize=max_batchsize)
        self.connect(SUT_address)
    
    def connect(self, SUT_address):
        ip, port = SUT_address.split(":")
        self.server = (ip, int(port))
        self.sockfd = socket.socket(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP)
        self.sockfd.connect(self.server)

    def predict(self, qitem: Item):
        payload = pickle.dumps(qitem.img, protocol=0)
        size = len(payload)
        size_bytes = size.to_bytes(4, 'big')
        
        self.sockfd.send(size_bytes + payload)
        res_size = self.sockfd.recv(4, socket.MSG_WAITALL)
        res = self.sockfd.recv(int.from_bytes(res_size, 'big'), socket.MSG_WAITALL)
        return pickle.loads(res)