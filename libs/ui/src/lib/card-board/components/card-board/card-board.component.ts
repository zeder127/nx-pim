import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IValueChanged } from '@fluidframework/map';
import { SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoardDDS,
  ICard,
  IColumnHeader,
  IConnection,
  IRowHeader,
  WorkItem,
} from '@pim/data';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { WitService } from '../../../http';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
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
export class CardBoardComponent extends AutoUnsubscriber implements OnInit {
  @Input('model') board: CardBoardDDS;
  /**
   * Event will be triggered, when all cells has been loaded.
   */
  @Output() load = new EventEmitter();

  public sourceCards: ICard[];
  public rows: IRowHeader[] = [];
  public columns: IColumnHeader[] = [];
  public connections: IConnection[] = [];
  private loadedCellsCount = 0;
  private mappedSourceIds: number[] = [];
  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private witService: WitService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.columns = this.board.columnHeaders.getItems(0);
    this.connections = [...this.board.connections.values()];
    console.log(`🚀 ~ CardBoardComponent ~ this.connections`, this.connections);
    this.rows = this.board.rowHeaders.getItems(0);

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

    this.board.connections.on('valueChanged', (event: IValueChanged) => {
      // if true, one item muss be deleted
      if (event.previousValue && !this.board.connections.has(event.key)) {
        this.connectionBuilder.remove(event.previousValue as IConnection);
        this.connectionBuilder.update$.next();
      }
    });
  }

  private toCard(wi: WorkItem): ICard {
    return {
      text: wi.title,
      linkedWitId: wi.id,
      x: undefined,
      y: undefined,
    } as ICard;
  }

  public getCell(row: number, col: number): IFluidHandle<SharedObjectSequence<ICard>> {
    return this.board.cells.getCell(row, col);
  }

  public onLoad(mappedSourceIds: number[]) {
    // Counter for loaded cells.
    this.loadedCellsCount++;

    // hold the source ids that have been mapped on board.
    this.mappedSourceIds = this.mappedSourceIds.concat(mappedSourceIds ?? []);

    // all cells have been loaded
    if (this.loadedCellsCount === this.columns.length * this.rows.length) {
      this.boardService.cardsLoad$.next(this.mappedSourceIds);
      this.load.emit();
      this.connectionBuilder.initConnections(this.connections);
    }
  }

  public onInsert(ids: number[]) {
    this.boardService.cardsInsert$.next(ids);
  }

  public onRemove(ids: number[]) {
    this.boardService.cardsRemove$.next(ids);

    // remove related connections from DDS
    ids.forEach((id) => {
      [...this.board.connections.entries()].forEach((value) => {
        const key = value[0];
        const conn = value[1];
        if (conn.endPointId === `${id}` || conn.startPointId === `${id}`) {
          this.board.connections.delete(key);
        }
      });
    });
  }

  public onDragOut(ids: number[]) {
    this.boardService.cardsRemove$.next(ids);
  }

  public updateConnections() {
    this.connectionBuilder.update$.next();
  }
}
