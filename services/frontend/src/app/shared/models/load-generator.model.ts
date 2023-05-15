import { NetEmConfig } from './network-emulation.model';
import { ServiceState } from './service-state.model';

export interface LoadGenServerRequest {
    netem?: NetEmConfig;
    args?: any[]; // TODO: use the appropriate type
}

export interface LoadGenServerResponse {
    lg_server: ServiceState;
}

export interface LoadGenJobRequest {
    models: LoadGenConfig[];
    dataset_id: string;
    scenario: string;
    repeats?: number;
    netem?: NetEmConfig;
}

export interface LoadGenInstanceRequest {
    models: LoadGenConfig[];
    dataset_id: string;
    scenario: string;
    repeats?: number;
}

export interface Config {
    num_threads: string;
    max_duration: string;
    min_duration: string;
    target_qps: string;
    mode: string;
    samples_per_query: string;
    max_async_queries: string;
}

export interface Scenario {
    scenario_name: string;
    config: Config;
}

export interface LoadGenConfig {
    model_name: string;
    scenarios: Scenario[];
}
