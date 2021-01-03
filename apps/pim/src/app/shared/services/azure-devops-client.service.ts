import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkItem } from '@pim/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { devops_host, organization, project } from '../constants/auzre-endpoint';

interface AzureWorkItem {
  id: number;
  fields: Record<string, unknown>;
  url: string;
}

/**
 * Http client to call Azure DevOps REST api
 */
@Injectable({
  providedIn: 'root',
})
export class AzureDevopsClientService {
  constructor(private httpClient: HttpClient) {}

  public getWorkItems(ids: number[]): Observable<WorkItem[]> {
    return this.httpClient
      .post(this.buildUrl(`/_apis/wit/workitemsbatch`), {
        ids: ids,
        fields: ['System.Id', 'System.Title', 'System.WorkItemType'],
      })
      .pipe(
        map((result: { value: AzureWorkItem[] }) => {
          return result.value.map((v) => {
            return {
              id: v.fields['System.Id'] as number,
              title: v.fields['System.Title'] as string,
              type: v.fields['System.WorkItemType'] as string,
              url: v.url,
            } as WorkItem;
          });
        })
      );
  }
  private buildUrl(path: string): string {
    return `${devops_host}/${organization}/${project}/${path}`;
  }
}
