import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IColumnHeader } from '@pim/data';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'pim-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnHeaderComponent implements OnInit {
  @Input('model') colHeader: IColumnHeader;
  @Input() linkedSourceType: 'team' | 'workitem' = 'team';
  @Output() insertColLeft = new EventEmitter();
  @Output() insertColRight = new EventEmitter();
  @Output() deleteCol = new EventEmitter();
  public menuItems: MenuItem[];
  constructor() {
    //
  }

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Open',
        icon: 'pi pi-pencil',
        command: this.edit,
      },
      {
        label: 'Insert left',
        icon: 'pi pi-plus',
        command: () => this.insertColLeft.emit(),
      },
      {
        label: 'Insert right',
        icon: 'pi pi-plus',
        command: () => this.insertColRight.emit(),
      },
      {
        label: 'Delete',
        icon: 'pi pi-times',
        command: () => this.deleteCol.emit(),
      },
    ];
  }

  private edit = () => {
    alert('TODO...');
  };
}
