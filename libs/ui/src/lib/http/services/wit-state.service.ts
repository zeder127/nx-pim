import { Injectable } from '@angular/core';
import { WorkItem } from '@pim/data';

@Injectable({
  providedIn: 'root',
})
export class WitStateService {
  private _witsMap = new Map<number, WorkItem>();

  public getWitById(id: number) {
    return this._witsMap.get(id);
  }

  public insertAndUpdateWit(id: number, value: WorkItem) {
    this._witsMap.set(id, value);
  }
}
