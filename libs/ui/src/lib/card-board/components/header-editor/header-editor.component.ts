import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { IColumnHeader, WorkItem } from '@pim/data';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WitService } from '../../../http';

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
  }

  public filterSources({ query }) {
    this.witService.queryWit(query).subscribe((wits) => {
      this.filteredSources = [...wits];
      this.cdr.markForCheck();
    });
  }

  public getWitTypeClass(wit: WorkItem): string {
    switch (wit.type) {
      case 'Feature':
        return 'feature';
        break;
      case 'Product Backlog Item':
        return 'pbi';
        break;
    }
  }

  public save() {
    this.dialogRef.close({ ...this.header });
  }
}
