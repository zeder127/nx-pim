import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '@pim/data';
/**
 * Dummy component to redirect to a planning board
 */
@Component({
  selector: 'pim-board-switcher',
  templateUrl: './board-switcher.component.html',
  styleUrls: ['./board-switcher.component.scss'],
})
export class BoardSwitcherComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const piName = this.activatedRoute.snapshot.paramMap.get('piName');
    const boardName = this.activatedRoute.snapshot.paramMap.get('boardName');
    this.router.navigateByUrl(
      `/planning/${piName}/board${
        !boardName || boardName === Constants.Default_Program_Board_Name
          ? ''
          : '/' + boardName
      }`
    );
  }
}
