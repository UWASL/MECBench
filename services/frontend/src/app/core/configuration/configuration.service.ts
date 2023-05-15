import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    LoadGenConfiguration,
    MECBenchConfiguration,
    NetworkEmulationConfiguration,
    SUTConfiguration,
} from './interface';

@Injectable({ providedIn: 'root' })
export class ConfigurationStoreService {
    private readonly _configuration = new BehaviorSubject<MECBenchConfiguration | undefined>(
        undefined
    );

    configuration$ = this._configuration.asObservable();

    constructor() {}

    getCurrentConfiguration(): MECBenchConfiguration | undefined {
        return this._configuration.getValue();
    }

    setNetworkEmulation(
        serverEmulationConfig: NetworkEmulationConfiguration,
        clientEmulationConfig: NetworkEmulationConfiguration
    ): void {
        this._configuration.next({
            ...this._configuration.getValue(),
            network_server: serverEmulationConfig,
            network_client: clientEmulationConfig,
        });
    }

    setLoadGen(loadGenConfig: LoadGenConfiguration): void {
        this._configuration.next({ ...this._configuration.getValue(), loadgen: loadGenConfig });
    }

    setSUT(sutConfig: SUTConfiguration): void {
        this._configuration.next({ ...this._configuration.getValue(), sut: sutConfig });
    }

    setConfiguration(config: MECBenchConfiguration): void {
        this._configuration.next(config);
    }

    getLoadGen(): LoadGenConfiguration | undefined {
        return this._configuration.getValue()?.loadgen;
    }

    getSUT(): SUTConfiguration | undefined {
        return this._configuration.getValue()?.sut;
    }

    getNetworkEmulation(server: boolean = false): NetworkEmulationConfiguration | undefined {
        if (server) {
            return this._configuration.getValue()?.network_server;
        } else {
            return this._configuration.getValue()?.network_client;
        }
    }
}
