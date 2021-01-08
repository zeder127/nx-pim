import { Injectable } from '@angular/core';
import { WorkItem } from '@pim/data';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AzureDevopsClientService } from './azure-devops-client.service';

interface AzureWorkItem {
  id: number;
  fields: Record<string, unknown>;
  url: string;
}

interface WitQueryFilter {
  team?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WitService {
  constructor(private devOpsClient: AzureDevopsClientService) {}

  public getWorkItems(ids: number[]): Observable<WorkItem[]> {
    return this.devOpsClient
      .fetchByPost(`/_apis/wit/workitemsbatch?api-version=5.1`, {
        ids: ids,
        fields: ['System.Id', 'System.Title', 'System.WorkItemType'],
      })
      .pipe(
        map((result: { value: AzureWorkItem[] }) => {
          return result.value.map((v) => {
            return this.toWorkItem(v);
          });
        })
      );
  }

  // TODO more flexible filter
  public queryWitByFilter(filter: WitQueryFilter) {
    const payload = {
      query: `SELECT [System.Id] FROM WorkItems WHERE ${
        filter.type ? `[System.WorkItemType]  IN ('${filter.type}') AND` : ''
      } ${
        filter.team ? `([System.AreaPath] = '${filter.team}') AND` : ''
      } [System.State] IN ('New', 'In Progress', 'Proposed', 'New', 'Active', 'Approved', 'Committed', 'To Do', 'Doing') order by [Backlog Priority], [System.Id]`,
    };

    return this.devOpsClient.fetchByPost('_apis/wit/wiql?api-version=5.1', payload).pipe(
      switchMap((result: { workItems: Array<{ id: number }> }) => {
        const ids = result.workItems.map((wi) => {
          return wi.id;
        });
        return this.getWorkItems(ids);
      })
    );
  }

  private toWorkItem(awi: AzureWorkItem): WorkItem {
    return {
      id: awi.fields['System.Id'] as number,
      title: awi.fields['System.Title'] as string,
      type: awi.fields['System.WorkItemType'] as string,
      url: awi.url,
    };
  }
}