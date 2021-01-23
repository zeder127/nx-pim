import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CardBoardDDS,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { AutoUnsubscriber, TeamService } from '@pim/ui';
import { PiService } from '../../../shared/services/pi.service';
import { BoardSyncService } from '../services/board-sync.service';

@Component({
  selector: 'pim-team-board',
  templateUrl: './team-board.component.html',
  styleUrls: ['./team-board.component.scss'],
})
export class TeamBoardComponent extends AutoUnsubscriber implements OnInit {
  public cardBoard: CardBoardDDS;
  public piName: string;
  public teamId: string;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private boardSyncService: BoardSyncService,
    private teamService: TeamService
  ) {
    super();
  }

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    const teamName = this.route.snapshot.paramMap.get('teamName');
    this.piService
      .getTeamBoardOfPI(this.piName, teamName)
      .pipe(this.autoUnsubscribe())
      .subscribe((board) => (this.cardBoard = board));
    this.teamService
      .getSingleByKey('name', teamName)
      .pipe(this.autoUnsubscribe())
      .subscribe((team) => (this.teamId = team.id));
  }

  public syncWithProgrammBoard(event: SyncEvent) {
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
