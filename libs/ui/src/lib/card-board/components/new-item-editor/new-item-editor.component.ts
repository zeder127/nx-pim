import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pim-new-item-editor',
  templateUrl: './new-item-editor.component.html',
  styleUrls: ['./new-item-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewItemEditorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
