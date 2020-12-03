import { Component, Input, OnInit } from '@angular/core';

import * as _ from 'lodash';

import {
  Card, CardBoard, ColumnHeader, RowHeader
} from '../../../../../../data/src/lib/card-board';

export interface RowData {
  header: RowHeader;
  data: { [key: string]: Card[] };
}

const DemoBoard: CardBoard = {
  name: 'demo board',
  columnHeaders: [
    {
      text: 'column1',
      description: null,
      linkedWitId: null,
      id: '1',
    },
    {
      text: 'column2',
      description: '',
      linkedWitId: null,
      id: '4',
    },
  ],
  rowHeaders: [
    {
      text: 'row1',
      description: '',
      linkedIterationId: null,
      id: '2',
    },
    {
      text: 'row2',
      description: '',
      linkedIterationId: null,
      id: '5',
    },
  ],
  cards: [
    {
      text: 'pbi 1-1',
      linkedWitId: 3,
      x: 1,
      y: 1,
    },
    {
      text: 'pbi 1-2',
      linkedWitId: 4,
      x: 2,
      y: 1,
    },
    {
      text: 'pbi 2-1',
      linkedWitId: 5,
      x: 1,
      y: 2,
    },
    {
      text: 'pbi 2-2',
      linkedWitId: 6,
      x: 2,
      y: 2,
    },
  ],
  connections: [],
};

@Component({
  selector: 'pim-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
})
export class CardBoardComponent implements OnInit {
  @Input('model') board: CardBoard = DemoBoard;

  public rows: RowData[] = [];
  public columns: ColumnHeader[] = [];
  constructor() {}

  ngOnInit(): void {
    this.columns = this.board.columnHeaders;
    this.rows = this.initRowData(this.board);
  }
  private initRowData(board: CardBoard): RowData[] {
    return board.rowHeaders.map((rHeader, rIndex) => {
      return {
        header: rHeader,
        data: _.groupBy(
          board.cards.filter((card) => card.y === rIndex + 1),
          'x'
        ),
      };
    });
  }
}
