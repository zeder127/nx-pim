import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CardBoardDDS,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { toCard } from '@pim/data/util';
import { AutoUnsubscriber, TeamService, WitService } from '@pim/ui';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PiService } from '../../../shared/services/pi.service';

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
    private teamService: TeamService,
    private witService: WitService
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
  private syncRemoveEvent(event: SyncRemoveEvent) {
    this.teamService
      .getSingleByKey('id', event.linkedSourceId)
      .pipe(
        this.autoUnsubscribe(),
        switchMap((team) => {
          const teamName = team.name;
          return this.piService.getTeamBoardOfPI(this.piName, teamName);
        })
      )
      .subscribe((teamBoard) => {
        const rowNumber = teamBoard.rowHeaders
          .getItems(0)
          .findIndex((r) => r.linkedIterationId === event.linkedIterationId);

        event.linkedWitIds.forEach((witId) => {
          this.removeCardFromRow(witId, rowNumber, teamBoard);
        });
      });
  }
  private async removeCardFromRow(
    witId: number,
    rowNumber: number,
    teamBoard: CardBoardDDS
  ) {
    teamBoard.columnHeaders.getItems(0).forEach(async (col, index) => {
      const targetSequence = await teamBoard.cells.getCell(rowNumber, index).get();
      const cardIndex = targetSequence
        .getItems(0)
        .findIndex((c) => c.linkedWitId === witId);
      if (cardIndex > -1) {
        targetSequence.remove(cardIndex, cardIndex + 1);
        return;
      }
    });
  }

  private syncInsertEvent(event: SyncInsertEvent) {
    this.teamService
      .getSingleByKey('id', event.linkedSourceId)
      .pipe(
        this.autoUnsubscribe(),
        switchMap((team) => {
          const teamName = team.name;
          return forkJoin([
            this.piService.getTeamBoardOfPI(this.piName, teamName),
            this.witService.getWorkItems(event.linkedWitIds),
          ]);
        })
      )
      .subscribe(async (result) => {
        const teamBoard = result[0];
        const newCards = result[1].map((wit) => toCard(wit));
        const rowNumber = teamBoard.rowHeaders
          .getItems(0)
          .findIndex((r) => r.linkedIterationId === event.linkedIterationId);
        // NOTE Sync from ProgrammBoard to TeamBoard, ProgrammBoard doesn't know the new Item should be insert which column in TeamBoard
        // Just insert to the first column on TeamBoard, so colNumber is 0.
        const targetSequence = await teamBoard.cells.getCell(rowNumber, 0).get();
        const targetSequenceLength = targetSequence.getItemCount();
        targetSequenceLength > 0
          ? targetSequence.insert(targetSequenceLength - 1, newCards)
          : targetSequence.insert(0, newCards);
      });
  }
}
