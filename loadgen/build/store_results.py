import json
import requests
import os
import argparse

def upload_qps(eid, selector, qps, storage_address):
    url = f"{storage_address}/qps"
    request_data = {
            "qps": qps,
            "experiment_id": eid,
            "selector": selector
            }
    req = requests.post(url, json=request_data)


def upload_latencies(eid, selector, latencies, storage_address):
    url = f"{storage_address}/latencies"
    request_data = {
            "latencies": latencies,
            "experiment_id": eid,
            "selector": selector
            }
    req = requests.post(url, json=request_data)

def process_summary(path):
    summary_path = os.path.join(path, "mlperf_log_summary.json")
    with open(summary_path, "r") as f:
        data = json.load(f)
    qps = data["qps"]
    latencies = data["latencies"]
    return qps, latencies


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("eid",
                        type=str,
                        help="The ID of the experiment that this job is a part of.")
    parser.add_argument("selector",
                        type=str,
                        help="The ID/selector of the current job.")
    parser.add_argument("output",
                        type=str,
                        help="The path of the summary log \"mlperf_log_summary.json\"")
    parser.add_argument("address",
                        type=str,
                        default="http://localhost:8086",
                        help="The address:port of the storage service")
    args = parser.parse_args()
    return args

def main():
    args = parse_args()
    qps, latencies = process_summary(args.output)
    upload_qps(args.eid, args.selector, qps, args.address)
    upload_latencies(args.eid, args.selector, latencies, args.address)


if __name__ == "__main__":
    main()
