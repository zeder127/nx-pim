import { Component, Input, OnInit } from '@angular/core';
import { ICard, Team } from '@pim/data';
import { difference, unionWith } from 'lodash';
import { SortableOptions } from 'sortablejs';
import { TeamService } from '../../../http';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { Sortable_Group_Name, Source_ID_Prefix } from '../../constants';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
})
export class SourcesListComponent extends AutoUnsubscriber implements OnInit {
  public selectedTeam: Team;
  public filterText: string;
  public teams: Team[];
  public idPrefix = Source_ID_Prefix;
  private mappedSourceIds: number[] = [];
  public cloneOption: SortableOptions = {
    group: {
      name: Sortable_Group_Name,
      pull: 'clone',
      put: false,
    },
    sort: false,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    forceFallback: true,
    draggable: '.available',
  };

  /**
   * Source cards to be dragged onto board
   */
  @Input('sources') sourceCards: ICard[];

  constructor(private boardService: BoardService, private teamService: TeamService) {
    super();
  }

  ngOnInit(): void {
    this.teamService
      .getAll()
      .pipe(this.autoUnsubscribe())
      .subscribe((teams) => {
        this.teams = teams;
        this.selectedTeam = teams.find(
          (team) => this.boardService.currentTeamName === team.name
        );
      });

    this.boardService.cardsLoad$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = ids;
    });

    this.boardService.cardsInsert$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = unionWith(this.mappedSourceIds, ids);
    });

    this.boardService.cardsRemove$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = difference(this.mappedSourceIds, ids);
    });
  }

  public isMapped(sourceId: number): boolean {
    return this.mappedSourceIds.includes(sourceId);
  }

  public onTeamChange(selectedTeam: Team) {
    console.log(`🚀 ~ SourcesListComponent ~ selectedTeam`, selectedTeam);
  }
}
