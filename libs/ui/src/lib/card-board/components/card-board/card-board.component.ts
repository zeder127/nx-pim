import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Card, CardBoard, ColumnHeader, RowHeader } from '@pim/data';
import { groupBy } from 'lodash';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';


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
      text: 'pbi 1-1-1',
      linkedWitId: 3,
      x: 1,
      y: 1,
    },
    {
      text: 'pbi 1-1-2',
      linkedWitId: 7,
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
      text: 'pbi 2-1-1',
      linkedWitId: 5,
      x: 1,
      y: 2,
    },
    {
      text: 'pbi 2-1-2',
      linkedWitId: 8,
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
  connections: [
    {
      startPointId: '6',
      endPointId: '4'
        },
    {
      startPointId: '3',
      endPointId: '8'
    }
  ],
};

@Component({
  selector: 'pim-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
  providers: [ConnectionBuilderService]
})
export class CardBoardComponent implements OnInit, AfterViewInit {
  @Input('model') board: CardBoard = DemoBoard;

  public rows: RowData[] = [];
  public columns: ColumnHeader[] = [];
  constructor(private connectionBuilder: ConnectionBuilderService) {}

  ngOnInit(): void {
    this.columns = this.board.columnHeaders;
    this.rows = this.initRowData(this.board);
  }

  ngAfterViewInit(): void {
    this.connectionBuilder.create(this.board.connections);
  }

  private initRowData(board: CardBoard): RowData[] {
    return board.rowHeaders.map((rHeader, rIndex) => {
      return {
        header: rHeader,
        data: groupBy(
          board.cards.filter((card) => card.y === rIndex + 1),
          'x'
        ),
      };
    });
  }
}
