import { NetEmConfig } from "./network-emulation.model";
import { ServiceState } from "./service-state.model";

export interface SutRequest {
    node_selectors?: any; // TODO: use the appropriate type
    netem?: NetEmConfig;
    limits?: ResourceLimits;
    args?: any[]; // TODO: use the appropriate type
}

export interface ResourceLimits {
    cpu: string;
    memory: string;
}

export interface SuteResponse {
    sut: ServiceState;
}
