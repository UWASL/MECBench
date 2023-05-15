import { ServiceState } from "./service-state.model";

export interface InitStorageResponse {
    cifss: ServiceState;
    storage: ServiceState;
}
