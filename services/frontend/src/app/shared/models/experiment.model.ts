export interface ExperimentLatency {
    experiment_id: string;
    latencies: string;
    selector: string;
}

export interface ExperimentQps {
    experiment_id: string;
    qps: string;
    selector: string;
}

export interface Experiments {
    experiments: string[];
}
