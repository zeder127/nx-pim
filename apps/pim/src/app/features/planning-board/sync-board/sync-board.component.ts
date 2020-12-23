import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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

  constructor(private http: HttpClient, private piService: PiService) {}

  ngOnInit(): void {
    this.piService.getPiConfiguration('test').subscribe((value) => {
      console.log(
        '🚀 ~ file: sync-board.component.ts ~ line 30 ~ SyncBoardComponent ~ this.piService.getPiConfiguration ~ value',
        value
      );
      this.iterations = value.iterations;
      this.teams = value.teams;
    });
  }
}
