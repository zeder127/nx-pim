import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { IColumnHeader, WorkItem } from '@pim/data';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WitService } from '../../../http';
import { getWitTypeClass } from '../../utils/wit-class';

@Component({
  selector: 'pim-header-editor',
  templateUrl: './header-editor.component.html',
  styleUrls: ['./header-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderEditorComponent implements OnInit {
  public header: IColumnHeader; // TODO generic with IHeader
  public selectedSourceId: string;
  public filteredSources: WorkItem[];
  public selectedSource: WorkItem;
  constructor(
    private dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    private witService: WitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const originalHeader: IColumnHeader = this.dialogConfig.data;
    this.header = {
      ...originalHeader,
    };
    // TODO depending on source type
    if (this.header.linkedSourceId) {
      this.witService
        .getWorkItemById(this.header.linkedSourceId as number)
        .subscribe((wit) => {
          this.selectedSource = wit;
          this.cdr.markForCheck();
        });
    }
  }

  public filterSources({ query }) {
    this.witService.queryWit(query).subscribe((wits) => {
      this.filteredSources = [...wits];
      this.cdr.markForCheck();
    });
  }

  public onSelect(wit: WorkItem) {
    this.header.linkedSourceId = wit.id;
    this.header.data = wit;
    this.selectedSource = wit;
    if (!this.header.title) {
      this.header.title = wit.title;
    }
  }

  public getColorClass(wit: WorkItem): string {
    return getWitTypeClass(wit);
  }

  public save() {
    this.dialogRef.close({ ...this.header });
  }
}
