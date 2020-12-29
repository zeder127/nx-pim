import { Component, Input, OnInit } from '@angular/core';
import { ICard } from '@pim/data';

@Component({
  selector: 'pim-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() card: ICard;
  constructor() {
    //
  }

  ngOnInit(): void {
    //
  }
}
