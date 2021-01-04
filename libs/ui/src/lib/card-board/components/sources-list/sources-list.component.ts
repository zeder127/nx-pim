import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { WorkItem } from '@pim/data';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesListComponent implements OnInit {
  @Input() sources: WorkItem[];
  constructor() {}

  ngOnInit(): void {}
}
