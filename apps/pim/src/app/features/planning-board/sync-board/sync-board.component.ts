import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Iteration, Team } from '@pim/data';
import { DemoBoard } from '../../../shared/models/demoBoard';
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
  public cardBoard = DemoBoard;

  private piName: string;

  constructor(private route: ActivatedRoute, private piService: PiService) {}

  ngOnInit(): void {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService.getPiByName(this.piName).subscribe((pi) => {
      console.log(`🚀 ~ SyncBoardComponent ~ pi`, pi);
    });
  }
}
