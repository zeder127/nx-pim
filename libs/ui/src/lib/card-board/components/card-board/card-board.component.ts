import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IValueChanged } from '@fluidframework/map';
import { SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoardDDS,
  ICard,
  IColumnHeader,
  IConnection,
  IRowHeader,
  SyncEvent,
  SyncInsertEvent,
  SyncRemoveEvent,
  SyncType,
} from '@pim/data';
import { toCard } from '@pim/data/util';
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
  @Input() type: 'program' | 'team' = 'program';

  /**
   * Event will be triggered, when all cells has been loaded.
   */
  @Output() load = new EventEmitter();

  /**
   * Event will be triggered, when the changes of some cards need to be synchronised between SyncBoard and TeamBoard
   */
  @Output() sync = new EventEmitter<SyncEvent>();

  public sourceCards: ICard[];
  public colLinkSourceType: 'team' | 'workitem';

  public get rows(): IRowHeader[] {
    return this.board.rowHeaders.getItems(0) ?? [];
  }
  public get columns(): IColumnHeader[] {
    return this.board.columnHeaders.getItems(0) ?? [];
  }
  public connections: IConnection[] = [];
  private loadedCellsCount = 0;
  private mappedSourceIds: number[] = [];

  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private witService: WitService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.connections = [...this.board.connections.values()];
    this.colLinkSourceType = this.type === 'program' ? 'team' : 'workitem';

    this.boardService.currentPiName = this.route.snapshot.paramMap.get('piName');
    this.boardService.currentTeamName = this.route.snapshot.paramMap.get('teamName');

    this.witService // TODO remove dependency of witservice, move it into boardservice
      .queryWitByFilter({
        //type: 'Feature',
        type: 'Product Backlog Item',
        team: 'pi-manager-dev\\Backend', // TODO dynamical value, team that current user belongs tos
      })
      .subscribe((workItems) => {
        this.sourceCards = workItems.map((wi) => toCard(wi));
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

  public onInsert(cards: ICard[], rowIndex: number, colIndex: number) {
    const cardIds = cards.map((c) => c.linkedWitId);
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;

    this.boardService.cardsInsert$.next(cardIds);
    this.sync.emit({
      type: SyncType.Insert,
      linkedWitIds: cardIds,
      linkedIterationId: iterationId,
      linkedSourceId: colLinkedSourceId,
    } as SyncInsertEvent);
  }

  public onRemove(ids: number[], rowIndex: number, colIndex: number) {
    this.boardService.cardsRemove$.next(ids);
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;

    this.sync.emit({
      type: SyncType.Remove,
      linkedWitIds: ids,
      linkedIterationId: iterationId,
      linkedSourceId: colLinkedSourceId,
    } as SyncRemoveEvent);
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

  public onDragOut(ids: number[], rowIndex: number, colIndex: number) {
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;
    this.boardService.cardsRemove$.next(ids);
    this.sync.emit({
      type: SyncType.Remove,
      linkedWitIds: ids,
      linkedIterationId: iterationId,
      linkedSourceId: colLinkedSourceId,
    });
  }

  public onDragIn(cards: ICard[], rowIndex: number, colIndex: number) {
    // get current IterationPath and AreaPath(Team)
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;
    this.boardService.updateIterationAndTeam(
      cards.map((c) => c.linkedWitId),
      iterationId,
      colLinkedSourceId
    );

    this.sync.emit({
      type: SyncType.Insert,
      linkedWitIds: cards.map((c) => c.linkedWitId),
      linkedIterationId: iterationId,
      linkedSourceId: colLinkedSourceId,
    });
  }

  public updateConnections() {
    this.connectionBuilder.update$.next();
  }
}
