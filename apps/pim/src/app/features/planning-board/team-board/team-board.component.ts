import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardBoardDDS } from '@pim/data';
import { PiService } from '../../../shared/services/pi.service';

@Component({
  selector: 'pim-team-board',
  templateUrl: './team-board.component.html',
  styleUrls: ['./team-board.component.scss'],
})
export class TeamBoardComponent implements OnInit {
  public cardBoard: CardBoardDDS;
  constructor(private route: ActivatedRoute, private piService: PiService) {}

  ngOnInit() {
    const piName = this.route.snapshot.paramMap.get('piName');
    const teamName = this.route.snapshot.paramMap.get('teamName');
    this.piService
      .getTeamBoardOfPI(piName, teamName)
      .subscribe((board) => (this.cardBoard = board));
  }
}
