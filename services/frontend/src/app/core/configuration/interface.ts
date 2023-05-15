export interface LoadGenConfiguration {
    num_threads: string;
    max_duration: string;
    min_duration: string;
    target_qps: string;
    mode: string;
    samples_per_query: string;
    max_async_queries: string;
    dataset_id: string;
    scenario: string;
    repeats?: number;
}

export interface SUTConfiguration {
    [prop: string]: any;
    modelThreads: number;
    model: string;
    runtime: string;
    consumerThreads: number;
}

export interface NetworkEmulationConfiguration {
    enabled: boolean;
    delay: string;
    bandwidth: string;
    jitter: string;
    loss_rate: string;
}

export interface MECBenchConfiguration {
    loadgen?: LoadGenConfiguration;
    sut?: SUTConfiguration;
    network_client?: NetworkEmulationConfiguration;
    network_server?: NetworkEmulationConfiguration;
}

