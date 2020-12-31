import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedObjectSequence } from '@fluidframework/sequence';
import { ICard, ICardBoard, Iteration, Team } from '@pim/data';
import { BoardDDS } from '@pim/data/fluid';
import { PiService } from '../../../shared/services/pi.service';

// const API_WITS = 'https://dev.azure.com/xw-sandbox/pi-manager-dev/_apis/wit/workitems?ids=1';
// const ME ='https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'pim-sync-board',
  templateUrl: './sync-board.component.html',
  styleUrls: ['./sync-board.component.scss'],
})
export class SyncBoardComponent implements OnInit {
  public iterations: Iteration[] = [];
  public teams: Team[] = [];
  public cardBoard: ICardBoard;
  public cardBoardJsonable: ICard[];

  private piName: string;
  private boardDDS: BoardDDS;
  private cellSeq: SharedObjectSequence<ICard>;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService.getProgrammBoardOfPI(this.piName).subscribe(async (board) => {
      this.cardBoard = board;
      this.boardDDS = this.cardBoard.dds as BoardDDS;
      const cellSeqHandle = this.boardDDS.matrix.getCell(0, 1);
      if (!cellSeqHandle) {
        alert('Cell (0,1) is empty');
        return;
      }
      this.cellSeq = await cellSeqHandle.get();
      this.cellSeq.on('sequenceDelta', (event) => {
        console.log(`🚀 ~ cellSeq ~ event`, event);
        this.cardBoardJsonable = this.cellSeq.getRange(0);
        this.cdr.detectChanges();
      });
      this.boardDDS.matrix.on('op', (event) => {
        console.log(`🚀 ~ boardDDS ~ event`, event);
      });
    });
  }

  addNewCard(row: number, col: number) {
    this.cellSeq.insert(0, [
      {
        linkedWitId: 99,
        x: 1,
        y: 2,
        text: 'test',
      },
    ]);
  }

  deleteCard() {
    // this.boardDDS.matrix.re(0, 1);
    // this.updateBoard();
  }
}
