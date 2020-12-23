import { Component, OnInit } from '@angular/core';
import { PiDataObject } from './fluid/board.dataobject';
import { PiContainerFactory } from './fluid/container-code';
import { FluidLoaderService } from './fluid/fluid-loader.service';

@Component({
  selector: 'pim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'PI Manager';
  isIframe = false;

  constructor(private fluidService: FluidLoaderService) {}

  async ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    const dataObject = await this.fluidService.loadDataObject<PiDataObject>(
      PiContainerFactory
    );
    console.log(
      '🚀 ~ file: app.component.ts ~ line 22 ~ AppComponent ~ ngOnInit ~ dataObject',
      dataObject
    );
  }
}
