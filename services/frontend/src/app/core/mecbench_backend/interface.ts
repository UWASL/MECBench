import { SUTConfiguration, NetworkEmulationConfiguration, LoadGenConfiguration } from "@core/configuration/interface";

export interface CreateProfileRequest {
    loadgen?: LoadGenConfiguration;
    sut?: SUTConfiguration;
    network_client?: NetworkEmulationConfiguration;
    network_server?: NetworkEmulationConfiguration;
    name: string;
    description?: string;
}

export interface Profile extends CreateProfileRequest {
    id: number;
}
