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
import { AutoUnsubscriber } from '@pim/ui';
import { Observable } from 'rxjs';
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
  public currentUser: Coworker;
  public piBoards$: Observable<ICardBoardBase[]>;
  private piName: string;

  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private boardSyncService: BoardSyncService,
    private boardSettingsServcie: BoardSettingsService,
    private authService: MsalService
  ) {
    super();
    // TODO muss be constructor?
    this.typesAllowedToSync = this.boardSettingsServcie.cardTypesAllowedToSync;
  }

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piBoards$ = this.piService.getBoardBasesOfPI(this.piName);
    this.piService
      .getProgramBoardOfPI(this.piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((board) => {
        this.cardBoard = board;
        this.currentUser = {
          name: this.authService.getAccount().name,
          id: this.authService.getAccount().accountIdentifier,
          boardId: board.id,
        };
      });
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
        this.boardSyncService.syncProgramBoardRemoveEvent(
          event as SyncRemoveEvent,
          this.piName
        );
        break;
    }
  }
}
