import { Component, OnInit } from '@angular/core';
import { DataObjectRefService } from './fluid/data-object-ref.service';

@Component({
  selector: 'pim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'PI Manager';
  isIframe = false;

  constructor(private dor: DataObjectRefService) {}

  async ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    const dataObject = await this.dor.getInstanceAsync();
    console.log('🚀 ~ dataObject', dataObject);
  }
}
