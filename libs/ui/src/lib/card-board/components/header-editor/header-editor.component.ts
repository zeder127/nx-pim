import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IColumnHeader } from '@pim/data';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'pim-header-editor',
  templateUrl: './header-editor.component.html',
  styleUrls: ['./header-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderEditorComponent implements OnInit {
  public header: IColumnHeader; // TODO generic with IHeader
  public selectedSourceId: string;
  public filteredSources: IColumnHeader[];
  constructor(
    private dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (!this.header) {
      this.header = this.dialogConfig.data as IColumnHeader;
    }
  }

  public filterSources(event) {
    //
  }

  public save() {
    this.dialogRef.close({ ...this.header });
  }
}
