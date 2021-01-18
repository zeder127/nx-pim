import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IColumnHeader } from '@pim/data';

@Component({
  selector: 'pim-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnHeaderComponent implements OnInit {
  @Input('model') colHeader: IColumnHeader;
  @Input() linkedSourceType: 'team' | 'workitem' = 'team';
  constructor() {
    //
  }

  ngOnInit(): void {
    //
  }
}
