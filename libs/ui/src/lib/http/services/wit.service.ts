import { Injectable } from '@angular/core';
import { WorkItem } from '@pim/data';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  AzureDevopsClientService,
  JsonPatchDocument,
} from './azure-devops-client.service';

interface AzureWorkItem {
  id: number;
  fields: Record<string, unknown>;
  url: string;
  rev: number;
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
      .fetchByPost(`/_apis/wit/workitemsbatch`, {
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

  public getWorkItemById(id: number): Observable<WorkItem> {
    return this.devOpsClient
      .getSingle<AzureWorkItem>(`_apis/wit/workitems/${id}`)
      .pipe(map((awi) => this.toWorkItem(awi)));
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

    return this.devOpsClient.fetchByPost('_apis/wit/wiql', payload).pipe(
      switchMap((result: { workItems: Array<{ id: number }> }) => {
        const ids = result.workItems.map((wi) => {
          return wi.id;
        });
        return this.getWorkItems(ids);
      })
    );
  }

  public updateIteration(id: number, newIterationPath: string): Observable<WorkItem> {
    return this.getWorkItemById(id).pipe(
      switchMap((wi) => {
        return this.update(wi.id, [
          {
            op: 'test',
            path: '/rev',
            value: wi.rev,
          },
          {
            op: 'replace',
            path: '/fields/System.IterationPath',
            value: newIterationPath,
          },
        ]);
      })
    );
  }

  public open(id: number) {
    window.open(`${this.devOpsClient.baseUrl}/_workitems/edit/${id}`);
  }

  private update(id: number, payload: JsonPatchDocument[]): Observable<WorkItem> {
    return this.devOpsClient
      .patch<AzureWorkItem>(`_apis/wit/workitems/${id}`, payload, {
        headers: { 'content-type': 'application/json-patch+json' },
      })
      .pipe(map((awi) => this.toWorkItem(awi)));
  }

  private toWorkItem(awi: AzureWorkItem): WorkItem {
    return {
      id: awi.id,
      title: awi.fields['System.Title'] as string,
      type: awi.fields['System.WorkItemType'] as string,
      url: awi.url,
      rev: awi.rev,
    };
  }
}
