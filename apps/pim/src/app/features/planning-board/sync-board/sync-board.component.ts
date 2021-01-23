import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CardBoardDDS,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { AutoUnsubscriber } from '@pim/ui';
import { PiService } from '../../../shared/services/pi.service';
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
  private piName: string;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private boardSyncService: BoardSyncService
  ) {
    super();
  }

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService
      .getProgrammBoardOfPI(this.piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((board) => (this.cardBoard = board));
  }

  public onSync(event: SyncEvent) {
    switch (event.type) {
      case SyncType.Insert:
        this.syncInsertEvent(event as SyncInsertEvent);
        break;
      case SyncType.Remove:
        this.syncRemoveEvent(event as SyncRemoveEvent);
        break;
    }
  }

  private syncInsertEvent(event: SyncInsertEvent) {
    this.boardSyncService.syncProgramBoardInsertEvent(event, this.piName);
  }

  private syncRemoveEvent(event: SyncRemoveEvent) {
    this.boardSyncService.syncProgrammBoardRemoveEvent(event, this.piName);
  }
}
