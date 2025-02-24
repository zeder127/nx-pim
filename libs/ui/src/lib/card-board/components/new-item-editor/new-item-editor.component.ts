import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Team, WitType, WorkItem } from '@pim/data';
import { WitService } from '../../../http';

@Component({
  selector: 'pim-new-item-editor',
  templateUrl: './new-item-editor.component.html',
  styleUrls: ['./new-item-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewItemEditorComponent implements OnInit {
  public sourceTypes = [
    { label: 'Product Backlog Item', type: WitType.PBI },
    { label: 'Enabler', type: WitType.Enabler },
    { label: 'Delivery', type: WitType.Delivery },
    { label: 'Feature', type: WitType.Feature },
  ];
  public selectedSourceType = this.sourceTypes[0];
  public title: string;

  @Input() team: Team;
  @Output() added = new EventEmitter<WorkItem>();

  constructor(private witService: WitService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  public addNewItem() {
    this.witService
      .addNewItem(
        this.selectedSourceType.type,
        this.title,
        `${this.team.projectName}\\${this.team.name}`
      )
      .subscribe((wit) => {
        this.added.emit(wit);
        this.title = undefined;
        this.cdr.markForCheck();
      });
  }
}
