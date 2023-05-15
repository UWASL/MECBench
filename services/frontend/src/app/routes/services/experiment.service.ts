import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExperimentLatency, ExperimentQps, Experiments } from '@shared/models/experiment.model';
import { apiPaths } from 'api-paths';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExperimentService {
    constructor(private http: HttpClient) {}

    getExperimentLatencies(eid: string): Observable<ExperimentLatency[]> {
        return this.http.get<ExperimentLatency[]>(apiPaths.storage.latencies.replace('{eid}', eid));
    }

    getExperimentQps(eid: string): Observable<ExperimentQps[]> {
        return this.http.get<ExperimentQps[]>(apiPaths.storage.qps.replace('{eid}', eid));
    }

    getExperiments(): Observable<Experiments> {
        return this.http.get<Experiments>(apiPaths.storage.experiments);
    }
}
