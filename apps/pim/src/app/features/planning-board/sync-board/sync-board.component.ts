import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardBoard } from '@pim/data';
import { AzureDevopsClientService } from '../../../shared/services/azure-devops-client.service';
import { PiService } from '../../../shared/services/pi.service';

// const API_WITS = 'https://dev.azure.com/xw-sandbox/pi-manager-dev/_apis/wit/workitems?ids=1';
// const ME ='https://graph.microsoft.com/v1.0/me';

@Component({
  selector: 'pim-sync-board',
  templateUrl: './sync-board.component.html',
  styleUrls: ['./sync-board.component.scss'],
})
export class SyncBoardComponent implements OnInit {
  public cardBoard: CardBoard;
  private piName: string;
  constructor(
    private route: ActivatedRoute,
    private piService: PiService,
    private devopsClient: AzureDevopsClientService
  ) {}

  ngOnInit() {
    this.piName = this.route.snapshot.paramMap.get('piName');
    this.piService.getProgrammBoardOfPI(this.piName).subscribe((board) => {
      this.cardBoard = board;
      this.devopsClient
        .queryWitByFilter({
          type: 'Product Backlog Item',
          team: 'pi-manager-dev\\Backend',
        })
        .subscribe((workItems) => console.log(workItems));
    });
  }
}
