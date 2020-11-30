import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pim-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  title = 'PI Manager';
  isIframe = false;

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;
  }
}
