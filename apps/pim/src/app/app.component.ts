import { Component, OnInit } from '@angular/core';
import { PiContainerFactory } from './fluid/container-code';
import { DataObjectRefService } from './fluid/data-object-ref.service';
import { FluidLoaderService } from './fluid/fluid-loader.service';
import { PiDataObject } from './fluid/pi.dataobject';

@Component({
  selector: 'pim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'PI Manager';
  isIframe = false;
  private documentIdKey = 'pim.document';
  private createNew = false; //change true only for debug

  constructor(
    private fluidService: FluidLoaderService,
    private dor: DataObjectRefService
  ) {}

  async ngOnInit() {
    let documentId = localStorage.getItem(this.documentIdKey);
    if (!documentId) {
      this.createNew = true;
      documentId = Date.now().toString();
      localStorage.setItem(this.documentIdKey, documentId);
    }
    this.isIframe = window !== window.parent && !window.opener;
    const dataObject = await this.fluidService.loadDataObject<PiDataObject>(
      PiContainerFactory,
      documentId,
      this.createNew
    );
    this.dor.instance = dataObject;
    console.log('🚀 ~ dataObject', dataObject);
  }
}
