import { Component, Input, OnInit } from '@angular/core';
import { ICard, Team } from '@pim/data';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
})
export class SourcesListComponent implements OnInit {
  public selectedTeam: Team;
  public filterText: string;

  @Input('sources') sourceCards: ICard[];

  @Input() teams: Team[];

  constructor() {}

  ngOnInit(): void {
    console.log(`🚀 ~ SourcesListComponent ~ sourceCards`, this.sourceCards);
  }
}
