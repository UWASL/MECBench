#!/bin/env python3

import flask
import os
import sys
import pathlib
import store_results

app = flask.Flask(__name__)

DATASET_URL = ''
# aws s3 cp "$dataset_URL" cppimp/build/dataset.tar.gz && \
# tar -xzf cppimp/build/dataset.tar.gz -C cppimp/build/
# TODO: clean old dataset to avoid mixing old and new datasets
def download_dataset(url):
    os.system(f'aws s3 cp {url} cppimp/build/dataset.tar.gz && tar -xzf cppimp/build/dataset.tar.gz -C cppimp/build/')


# Experiment_name Selector SUT_address Storage_address File_storage_address Config_ID Dataset_URL Scenario
@app.route('/run_experiment', methods=['POST'])
def start_lg():
    global DATASET_URL
    json_data = flask.request.get_json()
    experiment_name = json_data['experiment_name']
    eid = experiment_name
    selector = json_data['selector']
    sut_address = json_data['sut_address']
    storage_address = json_data['storage_address']
    file_storage_address = json_data['file_storage_address']
    config_id = json_data['config_id']
    dataset_url = json_data['dataset_url']
    scenario = json_data['scenario']
    args = json_data.get('args', [])
    output=os.path.join(os.getcwd(), "cppimp/build")

    os.system(f'wget "http://{file_storage_address}/{config_id}" --output-document=cppimp/build/mlperf.conf')
    
    if dataset_url != DATASET_URL:
        download_dataset(dataset_url)
        DATASET_URL = dataset_url

    # cd cppimp/build && ./loadgen $scenario $sut_address
    os.system(f'cd cppimp/build && ./loadgen {scenario} {sut_address} {" ".join(args)}')
    # cd ../../ && python3 store_results.py "$eid" "$selector" "$output" "http://$storage_address"
    storage_address = f"http://{storage_address}"
    qps, latencies = store_results.process_summary(output)
    store_results.upload_qps(eid, selector, qps, storage_address)
    store_results.upload_latencies(eid, selector, latencies, storage_address)
    return {"eid": eid, "selector": selector}


import time
import signal
def shutdown_server():
    pid = os.getpid()
    time.sleep(0.5)
    os.kill(pid, signal.SIGINT)

@app.route('/stop', methods=['POST'])
def exit_flask():
    import threading
    threading.Thread(target=shutdown_server).start()
    return "", 200

if __name__=="__main__":
    app.run(host='0.0.0.0', port=8088, debug=True)