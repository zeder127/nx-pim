import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoard,
  ICard,
  IColumnHeader,
  IConnection,
  IRowHeader,
  WorkItem,
} from '@pim/data';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { WitService } from '../../../http';
import { BoardService } from '../../services/board.service';

export interface RowData {
  header: IRowHeader;
  data: { [key: string]: IFluidHandle<SharedObjectSequence<ICard>> };
}

/**
 * Basic card board, supports live synchronisation and svg lines between cards
 */
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

  public sourceCards: ICard[];
  public rows: IRowHeader[] = [];
  public columns: IColumnHeader[] = [];
  public connections: IConnection[] = [];
  private loadedCellsCount = 0;
  constructor(
    // private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private witService: WitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.columns = this.board.columnHeaders.getRange(0);
    this.connections = this.board.connections.getRange(0);
    this.rows = this.board.rowHeaders.getRange(0);

    this.witService
      .queryWitByFilter({
        type: 'Product Backlog Item',
        team: 'pi-manager-dev\\Backend', // TODO dynamical value, team that current user belongs tos
      })
      .subscribe((workItems) => {
        this.sourceCards = workItems.map((wi) => this.toCard(wi));
        console.log(`🚀 ~ CardBoardComponent ~ workItems`, workItems);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.connectionBuilder.clear();
  }

  private toCard(wi: WorkItem): ICard {
    return {
      text: wi.title,
      linkedWitId: wi.id,
      x: undefined,
      y: undefined,
    } as ICard;
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

  public updateConnections() {
    this.connectionBuilder.update$.next();
  }
}
