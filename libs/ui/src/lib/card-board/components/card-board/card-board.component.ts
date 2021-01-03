import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { SharedObjectSequence } from '@fluidframework/sequence';
import { CardBoard, ICard, IColumnHeader, IConnection, IRowHeader } from '@pim/data';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { BoardService } from '../../services/board.service';

export interface RowData {
  header: IRowHeader;
  data: { [key: string]: IFluidHandle<SharedObjectSequence<ICard>> };
}

@Component({
  selector: 'pim-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss'],
  providers: [BoardService, ConnectionBuilderService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBoardComponent implements OnInit, OnDestroy {
  @Input('model') board: CardBoard;
  /**
   * Event will be triggered, when all cells has been loaded.
   */
  @Output() load = new EventEmitter();

  public rows: IRowHeader[] = [];
  public columns: IColumnHeader[] = [];
  public connections: IConnection[] = [];
  private loadedCellsCount = 0;
  constructor(
    // private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService
  ) {}

  ngOnInit(): void {
    this.columns = this.board.columnHeaders.getRange(0);
    this.connections = this.board.connections.getRange(0);
    this.rows = this.board.rowHeaders.getRange(0);
  }

  ngOnDestroy(): void {
    this.connectionBuilder.clear();
  }

  public getCell(row: number, col: number) {
    return this.board.cells.getCell(row, col);
  }

  public onLoad() {
    this.loadedCellsCount++;
    if (this.loadedCellsCount === this.columns.length * this.rows.length) {
      this.load.emit();
      this.connectionBuilder.initConnections(this.connections);
    }
  }
}
