import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IColumnHeader } from '@pim/data';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'pim-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnHeaderComponent implements OnInit, AfterViewInit {
  @Input('model') colHeader: IColumnHeader;
  @Input() linkedSourceType: 'team' | 'workitem' = 'team';
  @Output() insertColLeft = new EventEmitter();
  @Output() insertColRight = new EventEmitter();
  @Output() deleteCol = new EventEmitter();
  @ViewChild('menu') menuComp: Menu;
  public menuItems: MenuItem[];
  constructor(private cdr: ChangeDetectorRef) {
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  public toggle(event: MouseEvent) {
    this.menuComp.toggle(event);
    // Have to detect changes, otherwise menu popup doesn't show,
    // if this column was added by another client.
    this.cdr.detectChanges();
  }

  private edit = () => {
    alert('TODO...');
  };
}
