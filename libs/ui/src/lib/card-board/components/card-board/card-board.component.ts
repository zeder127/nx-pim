import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Card, CardBoard, ColumnHeader, RowHeader } from '@pim/data';
import { groupBy } from 'lodash';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';

export interface RowData {
  header: RowHeader;
  data: { [key: string]: Card[] };
}

@Component({
  selector: 'pim-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
  providers: [ConnectionBuilderService],
})
export class CardBoardComponent implements OnInit, AfterViewInit {
  @Input('model') board: CardBoard;

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
