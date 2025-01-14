import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as DevOps from '../constants/auzre-endpoint';
import { RequestOptions } from '../models/http.model';

// https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/work%20items/update?view=azure-devops-rest-5.1#jsonpatchdocument
export interface JsonPatchDocument {
  op: 'add' | 'remove' | 'replace' | 'test';
  path: string;
  value: unknown;
}

/**
 * Http client to call Azure DevOps REST api
 */
@Injectable({
  providedIn: 'root',
})
export class AzureDevopsClientService {
  constructor(private httpClient: HttpClient) {}

  public get baseUrl() {
    return `${DevOps.host}/${DevOps.organization}/${DevOps.project}`;
  }

  /** Send a HttpGet request to get objects */
  public fetchAll<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.httpClient.get<T>(this.buildUrl(path), options);
  }

  /** Use a provided Url to send a HttpGet request to get objects */
  public fetchByUrl<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.httpClient.get<T>(url, options);
  }

  /** Send a HttpPost request to get objects */
  public fetchByPost<T>(
    path: string,
    payload: unknown,
    options?: RequestOptions
  ): Observable<T> {
    return this.httpClient.post<T>(this.buildUrl(path), payload, options);
  }

  public getSingle<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.httpClient.get<T>(this.buildUrl(path), options);
  }

  /** Send a HttpPatch request to update a object */
  public patch<T>(
    path: string,
    payload: unknown,
    options?: RequestOptions
  ): Observable<T> {
    return this.httpClient.patch<T>(this.buildUrl(path), payload, options);
  }

  /** Send a HttpPost request to create a new object */
  public post<T>(
    path: string,
    payload: unknown,
    options?: RequestOptions
  ): Observable<T> {
    return this.httpClient.post<T>(this.buildUrl(path), payload, options);
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path}?api-version=${DevOps.api_version}`;
  }
}
