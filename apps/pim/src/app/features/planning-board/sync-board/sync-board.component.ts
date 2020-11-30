import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

const API_WITS = 'https://dev.azure.com/xw-sandbox/pi-manager-dev/_apis/wit/workitems?ids=1';
const ME ='https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'pim-sync-board',
  templateUrl: './sync-board.component.html',
  styleUrls: ['./sync-board.component.scss']
})
export class SyncBoardComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(API_WITS).subscribe(
      wits => {
        console.log("🚀 ~ file: sync-board.component.ts ~ line 17 ~ SyncBoardComponent ~ this.http.get ~ wits", wits);
      },
      (error) => {
        console.error(error);
      }
    );
  }

}
