import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardBoard, ICard, Iteration, Team } from '@pim/data';
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
  public cardBoard: CardBoard;
  public cardBoardJsonable: ICard[];

  private piName: string;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService.getProgrammBoardOfPI(this.piName).subscribe(async (board) => {
      this.cardBoard = board;
    });
  }

  addNewCard(row: number, col: number) {
    console.log(`🚀 ~ SyncBoardComponent ~ col`, col);
    console.log(`🚀 ~ SyncBoardComponent ~ row`, row);
  }

  deleteCard() {
    // this.boardDDS.matrix.re(0, 1);
    // this.updateBoard();
  }
}
