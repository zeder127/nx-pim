import { Injectable } from '@angular/core';
import { SharedMap } from '@fluidframework/map';
import { WorkItem } from '@pim/data';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AzureDevopsClientService } from './azure-devops-client.service';
import { PimDataObjectRefService } from './data-object-ref.service';

@Injectable({
  providedIn: 'root',
})
export class WorkItemPoolService {
  private workItemsSharedMap: SharedMap;

  constructor(
    private pimDORef: PimDataObjectRefService,
    private devOpsClient: AzureDevopsClientService
  ) {
    this.workItemsSharedMap = this.pimDORef.instance.workItems;
  }

  /**
   * Get all work items from PimDataObject
   */
  public getAll(): WorkItem[] {
    return [...this.workItemsSharedMap.values()];
  }

  /**
   * Get a work item from PimDataObject by a given Id
   */
  public getWorkItemById(id: string): WorkItem {
    return this.workItemsSharedMap.get(id);
  }

  /**
   * Synchronise work items in PimDataObject with Azure Devpos and the SharedMap that holds work items will be updated
   * @param ids Optinal, ids of work items to be sychronised. If empty, all work items in PimDataObject will be updated.
   */
  public syncWithSource(ids?: string[]): Observable<WorkItem[]> {
    const workItemIds = (ids ?? [...this.workItemsSharedMap.keys()]).map<number>((key) =>
      parseInt(key)
    );
    return this.devOpsClient
      .getWorkItems(workItemIds)
      .pipe(tap((workItems) => workItems.forEach((workItem) => this.add(workItem))));
  }

  public add(workItem: WorkItem) {
    this.workItemsSharedMap.set(`${workItem.id}`, workItem);
  }

  public delete(workItem: WorkItem) {
    this.workItemsSharedMap.delete(`${workItem.id}`);
  }
}
