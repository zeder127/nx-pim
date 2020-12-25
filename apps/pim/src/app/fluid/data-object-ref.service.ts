import { Injectable } from '@angular/core';
import { PiDataObject } from './pi.dataobject';

@Injectable({
  providedIn: 'root',
})
export class DataObjectRefService {
  public instance: PiDataObject;
}
