import { Injectable } from '@angular/core';
import { PiContainerFactory } from './container-code';
import { FluidLoaderService } from './fluid-loader.service';
import { PimDataObject } from './pim.dataobject';

@Injectable({
  providedIn: 'root',
})
export class DataObjectRefService {
  private _instance: PimDataObject;
  private _documentIdKey = 'pim.document';
  private _createNew = false; //change true only for debug

  constructor(private loader: FluidLoaderService) {}

  public get instance() {
    return this._instance;
  }
  public set instance(value) {
    this._instance = value;
  }

  /**
   * Load PI DataObject.
   * @param force boolean. Optional. If true, force to load from server again. Otherwise return an existing instance.
   */
  public async getInstanceAsync(force?: boolean): Promise<PimDataObject> {
    if (this.instance && !force) {
      return Promise.resolve(this.instance);
    }

    let documentId = localStorage.getItem(this._documentIdKey);
    if (!documentId) {
      this._createNew = true;
      documentId = Date.now().toString();
      localStorage.setItem(this._documentIdKey, documentId);
    }
    this.instance = await this.loader.loadDataObject<PimDataObject>(
      PiContainerFactory,
      documentId,
      this._createNew
    );
    return this.instance;
  }
}
