import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICard, Team, WorkItem } from '@pim/data';
import { toCard } from '@pim/data/util';
import { difference, unionWith } from 'lodash';
import { SortableOptions } from 'sortablejs';
import { TeamService, WitService } from '../../../http';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { Sortable_Group_Name, Source_ID_Prefix } from '../../constants';
import { BoardService } from '../../services/board.service';
import { getColorByType } from '../../utils/card-type-style';

@Component({
  selector: 'pim-sources-list',
  templateUrl: './sources-list.component.html',
  styleUrls: ['./sources-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesListComponent extends AutoUnsubscriber implements OnInit {
  private mappedSourceIds: number[] = [];
  public selectedTeam: Team;
  public filterText: string;
  public sourceCards: ICard[];
  public idPrefix = Source_ID_Prefix;
  public teams: Team[];
  public newItemEditorOpened = false;
  public showTeamFilter = false;

  public cloneOption: SortableOptions = {
    group: {
      name: Sortable_Group_Name,
      pull: 'clone',
      put: false,
    },
    sort: false,
    ghostClass: 'li-sortable-ghost',
    dragClass: 'li-sortable-drag',
    forceFallback: true,
    draggable: '.available',
  };

  /**
   * Source cards to be dragged onto board
   */

  constructor(
    private boardService: BoardService,
    private witService: WitService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {
    super();
  }

  ngOnInit(): void {
    const teamName = this.route.snapshot.paramMap.get('teamName');
    this.showTeamFilter = !teamName;
    this.teamService
      .getAll()
      .pipe(this.autoUnsubscribe())
      .subscribe((teams) => {
        this.teams = !teamName
          ? teams
          : teams.filter((team) => this.boardService.currentTeamName === team.name);
        this.selectedTeam = this.teams[0];
        this.loadSourceCardsOfTeam(this.selectedTeam);
      });

    this.boardService.cardsLoad$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = ids;
      this.cdr.markForCheck();
    });

    this.boardService.cardsInsert$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = unionWith(this.mappedSourceIds, ids);
      this.cdr.markForCheck();
    });

    this.boardService.cardsRemove$.pipe(this.autoUnsubscribe()).subscribe((ids) => {
      this.mappedSourceIds = difference(this.mappedSourceIds, ids);
      this.cdr.markForCheck();
    });
  }

  private loadSourceCardsOfTeam(team: Team) {
    const teamPath = `${team.projectName}\\${team.name}`;
    this.witService // TODO remove dependency of witservice, move it into boardservice
      .queryWitByFilter({
        //type: 'Feature',
        //type: WitType.PBI,
        team: teamPath,
      })
      .subscribe((workItems) => {
        this.sourceCards = workItems.map((wi) => toCard(wi));
        this.cdr.markForCheck();
      });
  }

  public isMapped(sourceId: number): boolean {
    return this.mappedSourceIds.includes(sourceId);
  }

  public onTeamChange(selectedTeam: Team) {
    this.loadSourceCardsOfTeam(selectedTeam);
  }

  public getBorderLeftColorOf(card: ICard) {
    return getColorByType(card.type);
  }

  public onAddNewItem(wit: WorkItem) {
    this.loadSourceCardsOfTeam(this.selectedTeam);
  }

  // TODO only workaround, expecting a solution with pure css
  @HostListener('window:resize')
  public calcSourceListHeight() {
    const containerHeight = document.querySelector('.mat-drawer-inner-container')
      ?.clientHeight;
    const toolbarHeight = document.querySelector('pim-sources-list .p-toolbar')
      ?.clientHeight;
    const filterHeight = document.querySelector('pim-sources-list .filter')?.clientHeight;

    return containerHeight - toolbarHeight - filterHeight;
  }

  public get filteredSourceCards() {
    if (!this.filterText) return this.sourceCards;
    return this.sourceCards?.filter((card) =>
      `${card.linkedWitId} ${card.text}`.includes(this.filterText)
    );
  }
}
