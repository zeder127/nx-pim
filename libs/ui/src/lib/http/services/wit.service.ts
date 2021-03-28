import { Injectable } from '@angular/core';
import { WitType, WorkItem } from '@pim/data';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  AzureDevopsClientService,
  JsonPatchDocument,
} from './azure-devops-client.service';
import { WitStateService } from './wit-state.service';

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
  constructor(
    private devOpsClient: AzureDevopsClientService,
    private state: WitStateService
  ) {}

  public getWorkItems(ids: number[]): Observable<WorkItem[]> {
    return this.devOpsClient
      .fetchByPost(`_apis/wit/workitemsbatch`, {
        ids: ids,
        fields: ['System.Id', 'System.Title', 'System.WorkItemType', 'System.Tags'],
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
      } [System.TeamProject] = @project AND [System.State] IN ('New', 'In Progress', 'Proposed', 'New', 'Active', 'Approved', 'Committed', 'To Do', 'Doing') order by [Backlog Priority], [System.Id]`,
    };

    return this.doQuery(payload);
  }

  public queryWit(query: string): Observable<WorkItem[]> {
    const payload = {
      query: `SELECT [System.Id],[System.WorkItemType],[System.Title],[System.AssignedTo],[System.State],[System.Tags] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.State] IN ('New', 'In Progress', 'Proposed', 'New', 'Active', 'Approved', 'Committed', 'To Do', 'Doing') AND ( [System.Title] CONTAINS WORDS '${query}' ${
        Number.isInteger(parseInt(query)) ? 'OR [System.Id] = ' + query : ''
      })`,
    };
    return this.doQuery(payload);
  }

  public updateIteration(id: number, newIterationPath: string): Observable<WorkItem> {
    return this.doUpdate(id, [
      {
        op: 'add',
        path: '/fields/System.IterationPath',
        value: newIterationPath,
      },
    ]);
  }

  public updateTeam(id: number, newTeamName: string): Observable<WorkItem> {
    return this.doUpdate(id, [
      {
        op: 'add',
        path: '/fields/System.AreaPath',
        value: newTeamName,
      },
    ]);
  }

  public updateIterationAndTeam(
    id: number,
    newIterationPath: string,
    newTeamName: string
  ): Observable<WorkItem> {
    return this.doUpdate(id, [
      {
        op: 'add',
        path: '/fields/System.IterationPath',
        value: newIterationPath,
      },
      {
        op: 'add',
        path: '/fields/System.AreaPath',
        value: newTeamName,
      },
    ]);
  }

  public addNewItem(type: WitType, title: string, team: string): Observable<WorkItem> {
    const payload = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: title,
      },
      {
        op: 'add',
        path: '/fields/System.AreaPath',
        value: team,
      },
    ];

    if (type === WitType.Enabler || type === WitType.Delivery) {
      payload.push({
        op: 'add',
        path: '/fields/System.Tags',
        value: type.toLocaleLowerCase(),
      });
      type = WitType.PBI;
    }

    return this.devOpsClient
      .post<AzureWorkItem>(`_apis/wit/workitems/$${type}`, payload, {
        headers: { 'content-type': 'application/json-patch+json' },
      })
      .pipe(map((awi) => this.toWorkItem(awi)));
  }

  public open(id: number) {
    window.open(`${this.devOpsClient.baseUrl}/_workitems/edit/${id}`);
  }

  private doQuery(payload: unknown) {
    return this.devOpsClient.fetchByPost('_apis/wit/wiql', payload).pipe(
      switchMap((result: { workItems: Array<{ id: number }> }) => {
        const ids = result.workItems.map((wi) => {
          return wi.id;
        });
        if (ids.length === 0) return of([]);
        return this.getWorkItems(ids);
      })
    );
  }

  private doUpdate(id: number, newValues: JsonPatchDocument[]): Observable<WorkItem> {
    return this.devOpsClient
      .patch<AzureWorkItem>(`_apis/wit/workitems/${id}`, newValues, {
        headers: { 'content-type': 'application/json-patch+json' },
      })
      .pipe(map((awi) => this.toWorkItem(awi)));
  }

  private toWorkItem(awi: AzureWorkItem): WorkItem {
    const wit = {
      id: awi.id,
      title: awi.fields['System.Title'] as string,
      type: awi.fields['System.WorkItemType'] as WitType,
      tags: (awi.fields['System.Tags'] as string)?.split(', '),
      url: awi.url,
      rev: awi.rev,
    };

    this.state.insertAndUpdateWit(wit.id, wit);
    return wit;
  }
}
