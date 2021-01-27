import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CardBoardDDS,
  CardType,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { AutoUnsubscriber } from '@pim/ui';
import { PiService } from '../../../shared/services/pi.service';
import { BoardSettingsService } from '../services/board-settings.service';
import { BoardSyncService } from '../services/board-sync.service';

// const API_WITS = 'https://dev.azure.com/xw-sandbox/pi-manager-dev/_apis/wit/workitems?ids=1';
// const ME ='https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'pim-sync-board',
  templateUrl: './sync-board.component.html',
  styleUrls: ['./sync-board.component.scss'],
})
export class SyncBoardComponent extends AutoUnsubscriber implements OnInit {
  public cardBoard: CardBoardDDS;
  public typesAllowedToSync: CardType[];
  private piName: string;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private boardSyncService: BoardSyncService,
    private boardSettingsServcie: BoardSettingsService
  ) {
    super();
    // TODO muss be constructor?
    this.typesAllowedToSync = this.boardSettingsServcie.cardTypesAllowedToSync;
  }

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService
      .getProgrammBoardOfPI(this.piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((board) => (this.cardBoard = board));
  }

  public syncWithTeamBoard(event: SyncEvent) {
    switch (event.type) {
      case SyncType.Insert:
        this.boardSyncService.syncProgramBoardInsertEvent(
          event as SyncInsertEvent,
          this.piName
        );
        break;
      case SyncType.Remove:
        this.boardSyncService.syncProgrammBoardRemoveEvent(
          event as SyncRemoveEvent,
          this.piName
        );
        break;
    }
  }
}
