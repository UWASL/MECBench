import { Injectable } from '@angular/core';
import { CreateProfileRequest, Profile } from './interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiPaths } from 'api-paths';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    constructor(private http: HttpClient) {}

    getProfiles(): Observable<{ profiles: Profile[]}> {
        return this.http.get<{ profiles: Profile[]}>(apiPaths.profiles.getAll);
    }

    createProfile(payload: CreateProfileRequest): Observable<any> {
        return this.http.post(apiPaths.profiles.create, payload);
    }

    deleteProfile(id: number): Observable<any> {
        return this.http.delete(apiPaths.profiles.delete.replace('{id}', id.toString()));
    }

    updateProfile(id: number, payload: CreateProfileRequest): Observable<any> {
        return this.http.put(apiPaths.profiles.update.replace('{id}', id + ''), payload);
    }
}
