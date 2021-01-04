import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Team, WorkItem } from '@pim/data';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesListComponent implements OnInit {
  public selectedTeam: Team;

  @Input() sources: WorkItem[];
  @Input() teams: Team[];

  constructor() {}

  ngOnInit(): void {}
}
