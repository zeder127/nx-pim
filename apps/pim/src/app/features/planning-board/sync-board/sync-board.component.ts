import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardBoardDDS } from '@pim/data';
import { PiService } from '../../../shared/services/pi.service';

// const API_WITS = 'https://dev.azure.com/xw-sandbox/pi-manager-dev/_apis/wit/workitems?ids=1';
// const ME ='https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'pim-sync-board',
  templateUrl: './sync-board.component.html',
  styleUrls: ['./sync-board.component.scss'],
})
export class SyncBoardComponent implements OnInit {
  public cardBoard: CardBoardDDS;
  constructor(private route: ActivatedRoute, private piService: PiService) {}

  ngOnInit() {
    const piName = this.route.snapshot.paramMap.get('piName');
    this.piService
      .getProgrammBoardOfPI(piName)
      .subscribe((board) => (this.cardBoard = board));
  }
}
