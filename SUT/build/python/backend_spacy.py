"""

"""

# pylint: disable=unused-argument,missing-docstring,useless-super-delegation

import backend
import spacy
import multiprocessing as mp
import srsly, traceback
import functools
from spacy.tokens.underscore import Underscore
from spacy.language import _AnyContext
from typing import cast


class BackendSpaCy(backend.Backend):
    def __init__(self):
        super(BackendSpaCy, self).__init__()

    def version(self):
        return spacy.__version__

    def name(self):
        """Name of the runtime."""
        return "SpaCy"

    def image_format(self):
        return None

    def load(self, model_path, threads, **kwargs):
        self.model = spacy.load(model_path)
        self.processes = []
        self.idle = mp.Queue()
        self.pipes = []

        for name, proc in self.model.pipeline:
            kwargs = {}
            # Allow component_cfg to overwrite the top-level kwargs.
            kwargs.setdefault("batch_size", 1)
            f = functools.partial(
                self._pipe,
                proc=proc,
                name=name,
                kwargs={},
                default_error_handler=self.model.default_error_handler,
            )
            self.pipes.append(f)

        for i in range(threads):
            worker_receiver, worker_sender = mp.Pipe(False)
            builder_receiver, builder_sender = mp.Pipe(False)
            proc = mp.Process(
                target=self._apply_pipes_qs,
                args=(
                    self._ensure_doc_with_context,
                    self.pipes,
                    worker_receiver,
                    builder_sender,
                    Underscore.get_state(),
                ),
            )
            self.processes.append((i, builder_receiver, worker_sender, proc))
            self.idle.put(i)
            proc.daemon = True
            proc.start()
            
        return self
    
    def parse_query(self, items: bytes, preprocessed=True) -> str:
        items = items.decode("utf-8")
        return [items]

    def serialize_response(self, res) -> bytes:
        """
        res list[(doc_id, token_text, token_pos)]: list of SpaCy tokens
        return (bytes): type(1B) + len(1B) + bytes  
        """
        results = b""
        for doc_id, token_text, token_pos in res:
            results += token_pos.to_bytes(1, "big") + len(token_text).to_bytes(1, "big") + token_text.encode("utf-8")
        return results

    def predict(self, feed):
        i = self.idle.get()
        tid, receiver, sender, _ = self.processes[i]
        sender.send((feed, [cast(_AnyContext, None)], tid, i))
        token_list = receiver.recv()
        self.idle.put(i)
        return token_list


    def _ensure_doc_with_context(self,
        doc_like, context
    ) -> any:
        """Call _ensure_doc to generate a Doc and set its context object."""
        doc = self.model._ensure_doc(doc_like)
        doc._context = context
        return doc

    def _apply_pipes_qs(self,
        ensure_doc,
        pipes,
        receiver: mp.Pipe,
        sender: mp.Pipe,
        underscore_state,
    ) -> None:
        Underscore.load_state(underscore_state)
        while True:
            try:
                texts, ctx, cid, id = receiver.recv()
                texts_with_ctx = list(zip(texts, ctx))
                docs = (
                    ensure_doc(doc_like, context) for doc_like, context in texts_with_ctx
                )
                for pipe in pipes:
                    docs = pipe(docs)
                res = []
                for i, doc in enumerate(docs):
                    for token in doc:
                        res.append((i, token.text, token.pos))
                sender.send(res)
            except Exception:
                error_msg = [(None, None, srsly.msgpack_dumps(traceback.format_exc()))]
                padding = [(None, None, None)] * (len(texts_with_ctx) - 1)
                sender.send(((error_msg + padding), cid, id))

    def _pipe(self,
        docs,
        proc,
        name: str,
        default_error_handler,
        kwargs,
    ) -> any:
        if hasattr(proc, "pipe"):
            yield from proc.pipe(docs, **kwargs)
        else:
            # We added some args for pipe that __call__ doesn't expect.
            kwargs = dict(kwargs)
            error_handler = default_error_handler
            if hasattr(proc, "get_error_handler"):
                error_handler = proc.get_error_handler()
            for arg in ["batch_size"]:
                if arg in kwargs:
                    kwargs.pop(arg)
            for doc in docs:
                try:
                    doc = proc(doc, **kwargs)  # type: ignore[call-arg]
                    yield doc
                except Exception as e:
                    error_handler(name, proc, [doc], e)

