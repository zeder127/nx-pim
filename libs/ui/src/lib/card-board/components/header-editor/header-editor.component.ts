import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pim-header-editor',
  templateUrl: './header-editor.component.html',
  styleUrls: ['./header-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderEditorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
