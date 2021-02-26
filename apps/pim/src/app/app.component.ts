import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'pim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  title = 'PI Manager';
  isIframe = false;

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
  }
}
