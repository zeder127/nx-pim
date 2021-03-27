import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import {
  CardBoardDDS,
  CardType,
  Coworker,
  ICardBoardBase,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { AutoUnsubscriber, TeamService } from '@pim/ui';
import { Observable } from 'rxjs';
import { PiService } from '../../../shared/services/pi.service';
import { BoardSettingsService } from '../services/board-settings.service';
import { BoardSyncService } from '../services/board-sync.service';

@Component({
  selector: 'pim-team-board',
  templateUrl: './team-board.component.html',
  styleUrls: ['./team-board.component.scss'],
})
export class TeamBoardComponent extends AutoUnsubscriber implements OnInit {
  public cardBoard: CardBoardDDS;
  public typesAllowedToSync: CardType[];
  public piName: string;
  public teamId: string;
  public currentUser: Coworker;
  public piBoards$: Observable<ICardBoardBase[]>;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private boardSyncService: BoardSyncService,
    private teamService: TeamService,
    private boardSettingsServcie: BoardSettingsService,
    private authService: MsalService
  ) {
    super();
    this.typesAllowedToSync = this.boardSettingsServcie.cardTypesAllowedToSync;
  }

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    const teamName = this.route.snapshot.paramMap.get('teamName');
    this.piBoards$ = this.piService.getBoardBasesOfPI(this.piName);
    this.piService
      .getTeamBoardOfPI(this.piName, teamName)
      .pipe(this.autoUnsubscribe())
      .subscribe((board) => {
        this.cardBoard = board;
        this.currentUser = {
          name: this.authService.getAccount().name,
          id: this.authService.getAccount().accountIdentifier,
          boardId: board.id,
        };
      });
    this.teamService
      .getSingleByKey('name', teamName)
      .pipe(this.autoUnsubscribe())
      .subscribe((team) => (this.teamId = team.id));
  }

  public syncWithProgramBoard(event: SyncEvent) {
    switch (event.type) {
      case SyncType.Insert:
        this.boardSyncService.syncTeamBoardInsertEvent(
          event as SyncInsertEvent,
          this.piName,
          this.teamId
        );
        break;
      case SyncType.Remove:
        this.boardSyncService.syncTeamBoardRemoveEvent(
          event as SyncRemoveEvent,
          this.piName
        );
        break;
    }
  }
}
