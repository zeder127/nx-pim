import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICardBoard, Iteration, Team } from '@pim/data';
import { BoardDDS } from '../../../fluid/pim.dataobject';
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
  public cardBoardJsonable: ICardBoard;

  private piName: string;
  // private pimDO: PimDataObject;

  constructor(private route: ActivatedRoute, private piService: PiService) {}

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService.getProgrammBoardOfPI(this.piName).subscribe((board) => {
      this.cardBoard = board;
      this.updateBoard();
    });
  }

  addNewCard() {
    const boardDDS: BoardDDS = this.cardBoard.dds as BoardDDS;
    boardDDS.cards.insert(0, [
      {
        linkedWitId: 99,
        x: 1,
        y: 2,
        text: 'test',
      },
    ]);

    this.updateBoard();
  }
  updateBoard() {
    this.cardBoardJsonable = this.piService.toCardBoard(this.cardBoard.id);
  }
}
