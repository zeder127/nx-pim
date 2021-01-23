import { Injectable } from '@angular/core';
import { SharedObjectSequence } from '@fluidframework/sequence';
import { CardBoardDDS, ICard, SyncInsertEvent, SyncRemoveEvent } from '@pim/data';
import { toCard } from '@pim/data/util';
import { AutoUnsubscriber, TeamService, WitService } from '@pim/ui';
import { differenceBy } from 'lodash';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PiService } from '../../../shared/services/pi.service';

@Injectable({
  providedIn: 'root',
})
export class BoardSyncService extends AutoUnsubscriber {
  constructor(
    private piService: PiService,
    private teamService: TeamService,
    private witService: WitService
  ) {
    super();
  }

  public syncProgramBoardInsertEvent(event: SyncInsertEvent, piName: string) {
    this.teamService
      .getSingleByKey('id', event.linkedSourceId)
      .pipe(
        this.autoUnsubscribe(),
        switchMap((team) => {
          const teamName = team.name;
          return forkJoin([
            this.piService.getTeamBoardOfPI(piName, teamName),
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
        const cardSequence = await teamBoard.cells.getCell(rowNumber, 0).get();
        this.insertCardInCell(cardSequence, newCards);
      });
  }

  public syncProgrammBoardRemoveEvent(event: SyncRemoveEvent, piName: string) {
    this.teamService
      .getSingleByKey('id', event.linkedSourceId)
      .pipe(
        this.autoUnsubscribe(),
        switchMap((team) => {
          const teamName = team.name;
          return this.piService.getTeamBoardOfPI(piName, teamName);
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

  public syncTeamBoardInsertEvent(
    event: SyncInsertEvent,
    piName: string,
    teamId: string
  ) {
    forkJoin([
      this.piService.getProgrammBoardOfPI(piName),
      this.witService.getWorkItems(event.linkedWitIds),
    ]).subscribe(async (result) => {
      const programmBoard = result[0];
      const newCards = result[1].map((wit) => toCard(wit));
      const rowNumber = programmBoard.rowHeaders
        .getItems(0)
        .findIndex((r) => r.linkedIterationId === event.linkedIterationId);
      const colNumber = programmBoard.columnHeaders
        .getItems(0)
        .findIndex((c) => c.linkedSourceId === teamId);
      const cardSequence = await programmBoard.cells.getCell(rowNumber, colNumber).get();
      this.insertCardInCell(cardSequence, newCards);
    });
  }

  public syncTeamBoardRemoveEvent(event: SyncRemoveEvent, piName: string) {
    this.piService
      .getProgrammBoardOfPI(piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((programmBoard) => {
        const rowNumber = programmBoard.rowHeaders
          .getItems(0)
          .findIndex((r) => r.linkedIterationId === event.linkedIterationId);
        event.linkedWitIds.forEach((witId) => {
          this.removeCardFromRow(witId, rowNumber, programmBoard);
        });
      });
  }

  private insertCardInCell(cardSequence: SharedObjectSequence<ICard>, newCards: ICard[]) {
    const diffCards = this.findDiffCard(cardSequence.getItems(0), newCards);
    if (diffCards.length > 0) {
      const targetSequenceLength = cardSequence.getItemCount();
      targetSequenceLength > 0
        ? cardSequence.insert(targetSequenceLength, diffCards)
        : cardSequence.insert(0, diffCards);
    }
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

  private findDiffCard(sourceCards: ICard[], newCards: ICard[]): ICard[] {
    return differenceBy(newCards, sourceCards, 'linkedWitId');
  }
}
