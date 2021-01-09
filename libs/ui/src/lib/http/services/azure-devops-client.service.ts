import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { devops_host, organization, project } from '../constants/auzre-endpoint';
import { RequestOptions } from '../models/http.model';

/**
 * Http client to call Azure DevOps REST api
 */
@Injectable({
  providedIn: 'root',
})
export class AzureDevopsClientService {
  constructor(private httpClient: HttpClient) {}

  /** Send a HttpGet request to get objects */
  public fetchAll<T>(partialUrl: string, options?: RequestOptions): Observable<T> {
    return this.httpClient.get<T>(this.buildUrl(partialUrl), options);
  }

  /** Send a HttpPost request to get objects */
  public fetchByPost<T>(
    partialUrl: string,
    payload: unknown,
    options?: RequestOptions
  ): Observable<T> {
    return this.httpClient.post<T>(this.buildUrl(partialUrl), payload, options);
  }

  private buildUrl(path: string): string {
    return `${devops_host}/${organization}/${project}/${path}`;
  }
}
