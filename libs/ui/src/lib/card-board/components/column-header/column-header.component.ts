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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { HeaderEditorComponent } from '../header-editor/header-editor.component';

@Component({
  selector: 'pim-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class ColumnHeaderComponent extends AutoUnsubscriber
  implements OnInit, AfterViewInit, OnDestroy {
  @Input('model') colHeader: IColumnHeader;
  @Input() linkedSourceType: 'team' | 'workitem' = 'team';
  @Output() insertColLeft = new EventEmitter();
  @Output() insertColRight = new EventEmitter();
  @Output() deleteCol = new EventEmitter();
  @ViewChild('menu') menuComp: Menu;
  public menuItems: MenuItem[];
  private editorDialogRef: DynamicDialogRef;
  constructor(private cdr: ChangeDetectorRef, private dialogService: DialogService) {
    super();
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

  ngOnDestroy() {
    super.ngOnDestroy();
    this.editorDialogRef?.close();
  }

  public toggle(event: MouseEvent) {
    this.menuComp.toggle(event);
    // Have to detect changes, otherwise menu popup doesn't show,
    // if this column was added by another client.
    this.cdr.detectChanges();
  }

  private edit = () => {
    this.editorDialogRef = this.dialogService.open(HeaderEditorComponent, {
      header: `Edit`,
    });

    this.editorDialogRef.onClose
      .pipe(this.autoUnsubscribe())
      .subscribe((model: IColumnHeader) => {
        if (model) this.colHeader = model;
      });
  };
}
