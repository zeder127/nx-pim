import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ICard, ICardBoard, IColumnHeader, IRowHeader } from '@pim/data';
import { groupBy } from 'lodash';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { BoardService } from '../../services/board.service';

export interface RowData {
  header: IRowHeader;
  data: { [key: string]: ICard[] };
}

@Component({
  selector: 'pim-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
  providers: [BoardService, ConnectionBuilderService],
})
export class CardBoardComponent implements OnInit, AfterViewInit {
  @Input('model') board: ICardBoard;

  public rows: RowData[] = [];
  public columns: IColumnHeader[] = [];
  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService
  ) {}

  ngOnInit(): void {
    this.columns = this.board.columnHeaders;
    this.rows = this.initRowData(this.board);
  }

  ngAfterViewInit(): void {
    this.connectionBuilder.create(this.board.connections);
  }

  private initRowData(board: ICardBoard): RowData[] {
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
