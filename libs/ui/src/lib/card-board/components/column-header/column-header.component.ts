import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IColumnHeader, WorkItem } from '@pim/data';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu } from 'primeng/menu';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { BoardService } from '../../services/board.service';
import { getWitTypeClass } from '../../utils/card-type-style';
import { HeaderEditorComponent } from '../header-editor/header-editor.component';

@Component({
  selector: 'pim-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class ColumnHeaderComponent extends AutoUnsubscriber implements OnInit, OnDestroy {
  @Input('model') colHeader: IColumnHeader;
  @Input() linkedSourceType: 'team' | 'workitem' = 'team';
  @Input() index: string;
  @Output() insertColLeft = new EventEmitter();
  @Output() insertColRight = new EventEmitter();
  @Output() deleteCol = new EventEmitter();
  @Output() modelChange = new EventEmitter<IColumnHeader>();
  @ViewChild('menu') menuComp: Menu;
  public menuItems: MenuItem[];
  public selectedSource: WorkItem;
  private editorDialogRef: DynamicDialogRef;
  constructor(
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
    private boardService: BoardService
  ) {
    super();
  }

  ngOnInit(): void {
    this.selectedSource = this.colHeader.data as WorkItem;
    this.menuItems = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: this.edit,
      },
      {
        label: 'Insert column left',
        icon: 'pi pi-plus',
        command: () => this.insertColLeft.emit(),
      },
      {
        label: 'Insert column right',
        icon: 'pi pi-plus',
        command: () => this.insertColRight.emit(),
      },
      {
        label: 'Delete column',
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
      width: '30%',
      data: this.colHeader,
    });

    this.editorDialogRef.onClose
      .pipe(this.autoUnsubscribe())
      .subscribe((model: IColumnHeader) => {
        if (model) {
          this.colHeader = model;
          this.modelChange.emit(model);
          this.cdr.markForCheck();
        }
      });
  };

  public getColorClass(wit: WorkItem) {
    return getWitTypeClass(wit);
  }

  public openSourceUrl(id: number) {
    this.boardService.openSourceUrl(id);
  }
}
