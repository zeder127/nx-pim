import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IValueChanged } from '@fluidframework/map';
import { SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoardDDS,
  CardType,
  ICard,
  IColumnHeader,
  IConnection,
  IRowHeader,
  SyncEvent,
  SyncType,
  Team,
} from '@pim/data';
import * as DataUtil from '@pim/data/util';
import AnimEvent from 'anim-event';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
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
export class CardBoardComponent extends AutoUnsubscriber
  implements OnInit, AfterViewInit, DoCheck {
  @Input('model') board: CardBoardDDS;
  @Input() type: 'program' | 'team' = 'program';
  @Input() typesAllowedToSync: CardType[];

  /**
   * Event will be triggered, when all cells has been loaded.
   */
  @Output() load = new EventEmitter();

  /**
   * Event will be triggered, when the changes of some cards need to be synchronised between SyncBoard and TeamBoard
   */
  @Output() sync = new EventEmitter<SyncEvent>();

  @ViewChildren('bodyRow', { read: ElementRef })
  private bodyRowRefs!: QueryList<ElementRef>;

  @ViewChild('table', { read: ElementRef }) tableElementRef: ElementRef;

  public sourceCards: ICard[];
  public colLinkSourceType: 'team' | 'workitem';
  public teamsOfSources: Team[];

  public get rows(): IRowHeader[] {
    return this.board.rowHeaders.getItems(0) ?? [];
  }
  public get columns(): IColumnHeader[] {
    return this.board.columnHeaders.getItems(0) ?? [];
  }
  public get connections(): IConnection[] {
    return [...this.board.connections.values()];
  }
  private loadedCellsCount = 0;
  private loaded = false;
  private mappedSourceIds: number[] = [];
  public bodyRowHeights: number[] = [];

  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    super();
  }
  ngDoCheck(): void {
    // workaround to solve misalignment issue of p-table
    this.setBodyRowHeights(this.bodyRowRefs);
  }

  ngOnInit(): void {
    if (!this.typesAllowedToSync)
      this.typesAllowedToSync = DataUtil.enumToArray(CardType);
    this.colLinkSourceType = this.type === 'program' ? 'team' : 'workitem';

    this.boardService.currentPiName = this.route.snapshot.paramMap.get('piName');
    this.boardService.currentTeamName = this.route.snapshot.paramMap.get('teamName');
    this.boardService.connectionInsert$
      .pipe(this.autoUnsubscribe())
      .subscribe((newConnection) => {
        const newKey = `${newConnection.startPointId}-${newConnection.endPointId}`;
        if (!this.board.connections.has(newKey))
          this.board.connections.set(newKey, newConnection);
      });

    this.board.connections.on('valueChanged', (event: IValueChanged) => {
      // one connection muss be deleted
      if (event.previousValue && !this.board.connections.has(event.key)) {
        this.connectionBuilder.remove(event.previousValue as IConnection);
        this.connectionBuilder.update$.next();
      }
      // one connection muss be inserted
      if (!event.previousValue) {
        const newConnection = this.board.connections.get(event.key);
        this.connectionBuilder.drawConnection(newConnection);
      }
    });
  }

  ngAfterViewInit(): void {
    // insert a row
    this.bodyRowRefs.changes.pipe(this.autoUnsubscribe()).subscribe(() => {
      this.setBodyRowHeights(this.bodyRowRefs);
    });

    const scrollableBoardBody: HTMLElement = (this.tableElementRef
      .nativeElement as HTMLElement).querySelector(
      '.p-datatable-scrollable-view.p-datatable-unfrozen-view .p-datatable-scrollable-body'
    );
    // reference to https://github.com/anseki/anim-event
    scrollableBoardBody.addEventListener(
      'scroll',
      AnimEvent.add(() => {
        this.connectionBuilder.updateExistingConnections();
      })
    );

    // initiate a line wrapper. All lines will move into this wrapper to avoid 'z-index' issue while scrolling
    this.connectionBuilder.createLineWrapper(scrollableBoardBody);
  }

  private setBodyRowHeights(rowRefs: QueryList<ElementRef>) {
    const oldValueString = this.bodyRowHeights.toString();
    this.bodyRowHeights =
      rowRefs?.map((rowRef) => (rowRef.nativeElement as HTMLElement).offsetHeight) ?? [];
    if (oldValueString !== this.bodyRowHeights.toString()) {
      this.cdr.markForCheck();
    }
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
      this.loaded = true;
      this.connectionBuilder.initConnections(this.connections);
      console.log(`🚀 ~ this.connections`, this.connections);
    }
  }

  public onInsert(cards: ICard[], rowIndex: number, colIndex: number) {
    const cardIds = cards.map((c) => c.linkedWitId);
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;

    this.boardService
      .updateIterationAndTeam(
        cards.map((c) => c.linkedWitId),
        iterationId,
        colLinkedSourceId
      )
      .subscribe();
    this.boardService.cardsInsert$.next(cardIds);

    const cardsToSync = cards.filter((c) => this.typesAllowedToSync.includes(c.type));
    if (cardsToSync.length > 0)
      this.emitSyncEvent(cardsToSync, SyncType.Insert, rowIndex, colIndex);
  }

  public onRemove(cards: ICard[], rowIndex: number, colIndex: number) {
    const ids = cards.map((c) => c.linkedWitId);
    this.boardService.cardsRemove$.next(ids);

    const cardsToSync = cards.filter((c) => this.typesAllowedToSync.includes(c.type));
    if (cardsToSync.length > 0)
      this.emitSyncEvent(cardsToSync, SyncType.Remove, rowIndex, colIndex);

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

  // TODO only update deltaCards
  public onUpdate(cardIds: number[]) {
    if (this.loaded) this.connectionBuilder.redrawConnections(this.connections);
  }

  private emitSyncEvent(
    cardsToSync: ICard[],
    syncType: SyncType,
    rowIndex: number,
    colIndex: number
  ) {
    const iterationId = this.rows[rowIndex].linkedIterationId;
    const colLinkedSourceId = this.columns[colIndex].linkedSourceId;
    this.sync.emit({
      type: syncType,
      cards: cardsToSync,
      linkedIterationId: iterationId,
      linkedSourceId: colLinkedSourceId,
    });
  }
}
