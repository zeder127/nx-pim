import { Injectable } from '@angular/core';
import { SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoardDDS,
  ICard,
  SyncInsertEvent,
  SyncMoveEvent,
  SyncRemoveEvent,
} from '@pim/data';
import { AutoUnsubscriber, TeamService, WitService } from '@pim/ui';
import { differenceBy } from 'lodash';
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
    this.findTeamBoard(`${event.linkedSourceId}`, piName)
      .pipe(this.autoUnsubscribe())
      .subscribe(async (teamBoard) => {
        const rowNumber = this.findRowNumberOnBoard(teamBoard, event.linkedIterationId);
        // NOTE Sync from ProgramBoard to TeamBoard, ProgramBoard doesn't know the new Item should be insert which column in TeamBoard
        // Just insert to the first column on TeamBoard, so colNumber is 0.
        const cardSequence = await teamBoard.grid.getCell(rowNumber, 0).get();
        this.insertCardInCell(cardSequence, event.cards);
      });
  }

  public syncProgramBoardRemoveEvent(event: SyncRemoveEvent, piName: string) {
    this.findTeamBoard(`${event.linkedSourceId}`, piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((teamBoard) => {
        const rowNumber = this.findRowNumberOnBoard(teamBoard, event.linkedIterationId);
        event.cards.forEach((c) => {
          this.removeCardFromRow(c.linkedWitId, rowNumber, teamBoard, event.isMoving);
        });
      });
  }

  public syncProgramBoardMoveEvent(event: SyncMoveEvent, piName: string) {
    this.findTeamBoard(`${event.linkedSourceId}`, piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((teamBoard) => {
        const rowNumber = this.findRowNumberOnBoard(
          teamBoard,
          event.oldLinkedIterationId
        );
        event.cards.forEach((c) => {
          this.findCardFromRow(
            c.linkedWitId,
            rowNumber,
            teamBoard,
            async (cardSeq, indexInSeq, colNumber) => {
              cardSeq.remove(indexInSeq, indexInSeq + 1);
              const newRowNumber = this.findRowNumberOnBoard(
                teamBoard,
                event.linkedIterationId
              );
              const cardSequenceToInsert = await teamBoard.grid
                .getCell(newRowNumber, colNumber)
                .get();
              this.insertCardInCell(cardSequenceToInsert, event.cards);
            }
          );
        });
      });
  }

  public syncTeamBoardInsertEvent(
    event: SyncInsertEvent,
    piName: string,
    teamId: string
  ) {
    this.piService.getProgramBoardOfPI(piName).subscribe(async (board) => {
      const rowNumber = this.findRowNumberOnBoard(board, event.linkedIterationId);
      const colNumber = board.columnHeaders
        .getItems(0)
        .findIndex((c) => c.linkedSourceId === teamId);
      const cardSequence = await board.grid.getCell(rowNumber, colNumber).get();
      this.insertCardInCell(cardSequence, event.cards);
    });
  }

  public syncTeamBoardRemoveEvent(event: SyncRemoveEvent, piName: string) {
    this.piService
      .getProgramBoardOfPI(piName)
      .pipe(this.autoUnsubscribe())
      .subscribe((programBoard) => {
        const rowNumber = this.findRowNumberOnBoard(
          programBoard,
          event.linkedIterationId
        );
        event.cards.forEach((c) => {
          this.removeCardFromRow(c.linkedWitId, rowNumber, programBoard, event.isMoving);
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

  private removeCardFromRow(
    witId: number,
    rowNumber: number,
    board: CardBoardDDS,
    isMoving: boolean
  ) {
    this.findCardFromRow(witId, rowNumber, board, (cardSeq, indexInSeq) => {
      cardSeq.remove(indexInSeq, indexInSeq + 1);
      if (!isMoving)
        // remove related connections
        [...board.connections.entries()].forEach(([key, conn]) => {
          if (conn.startPointId === `${witId}` || conn.endPointId === `${witId}`) {
            board.connections.delete(key);
          }
        });
    });
  }

  private findTeamBoard(teamId: string, piName: string) {
    return this.teamService
      .getSingleByKey('id', teamId)
      .pipe(switchMap((team) => this.piService.getTeamBoardOfPI(piName, team.name)));
  }

  private async findCardFromRow(
    witId: number,
    rowNumber: number,
    board: CardBoardDDS,
    callback: (
      cardSeq: SharedObjectSequence<ICard>,
      indexInSeq: number,
      columnIndex: number
    ) => void
  ) {
    board.columnHeaders.getItems(0).forEach(async (col, index) => {
      const targetSequence = await board.grid.getCell(rowNumber, index).get();
      const cardIndex = targetSequence
        .getItems(0)
        .findIndex((c) => c.linkedWitId === witId);
      if (cardIndex > -1) {
        callback(targetSequence, cardIndex, index);
        return;
      }
    });
  }

  private findRowNumberOnBoard(board: CardBoardDDS, linkedIterationId: string) {
    return board.rowHeaders
      .getItems(0)
      .findIndex((r) => r.linkedIterationId === linkedIterationId);
  }

  private findDiffCard(sourceCards: ICard[], newCards: ICard[]): ICard[] {
    return differenceBy(newCards, sourceCards, 'linkedWitId');
  }
}
