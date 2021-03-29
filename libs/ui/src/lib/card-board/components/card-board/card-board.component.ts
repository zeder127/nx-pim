import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IValueChanged } from '@fluidframework/map';
// import { MergeTreeDeltaType } from '@fluidframework/merge-tree';
// import { ISequencedDocumentMessage } from '@fluidframework/protocol-definitions';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import {
  CardBoardDDS,
  CardType,
  Constants,
  Coworker,
  ICard,
  ICardBoardBase,
  IColumnHeader,
  IConnection,
  IRowHeader,
  SyncEvent,
  SyncType,
  Team,
} from '@pim/data';
import * as DataUtil from '@pim/data/util';
import AnimEvent from 'anim-event';
import { MessageService } from 'primeng/api';
import { merge, Observable, Subject, zip } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { BoardService } from '../../services/board.service';
import { CardContainerComponent } from '../card-container/card-container.component';
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
  implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @Input('model') board: CardBoardDDS;
  @Input() type: 'program' | 'team' = 'program';
  @Input() typesAllowedToSync: CardType[];
  @Input('coworker') currentUser: Coworker;
  @Input('availableBoards') availableBoards$: Observable<ICardBoardBase[]>;

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

  @ViewChildren(CardContainerComponent) cardContainers: QueryList<CardContainerComponent>;

  public sourceCards: ICard[];
  public colLinkSourceType: 'team' | 'workitem';
  public teamsOfSources: Team[];
  public bodyRowHeights: number[] = [];
  public columnWidth: string;
  public frozenWidth: string;
  public colHeaderHeight: string;

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
  private scrollableBoardBody: HTMLElement;
  private mappedSourceIds: number[] = [];
  private syncRemoveForMoving$ = new Subject<SyncEvent>();
  private syncInsertForMoving$ = new Subject<SyncEvent>();

  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private zone: NgZone
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

    this.boardService.availableBoards$ = this.availableBoards$;
    this.boardService.currentPiName = this.route.snapshot.paramMap.get('piName');
    this.boardService.currentTeamName = this.route.snapshot.paramMap.get('teamName');
    this.boardService.currentBoardName = this.board.name;
    this.boardService.connectionInsert$
      .pipe(this.autoUnsubscribe())
      .subscribe((newConnection) => {
        const newKey = `${newConnection.startPointId}-${newConnection.endPointId}`;
        if (!this.board.connections.has(newKey))
          this.board.connections.set(newKey, newConnection);
        // Have to update connection, because sometimes new added connection get some pixels offset
        this.connectionBuilder.update$.next();
      });

    this.boardService.connectionDelete$
      .pipe(this.autoUnsubscribe())
      .subscribe((connToDelete) => {
        const keyToDelete = `${connToDelete.startPointId}-${connToDelete.endPointId}`;
        if (this.board.connections.has(keyToDelete))
          this.board.connections.delete(keyToDelete);
      });

    this.boardService.zoom$
      .asObservable()
      .pipe(this.autoUnsubscribe())
      .subscribe((zoomLevel) => {
        this.columnWidth = `calc(${this.boardService.cardWidthBase}px * 2 * ${zoomLevel} + 8px*2 + 8px + 2px)`;
        this.frozenWidth = `calc(200px * ${zoomLevel})`;
        this.colHeaderHeight = `calc(100px * ${zoomLevel})`;
      });

    // merge move card event for sync between program and team boards
    zip(this.syncRemoveForMoving$, this.syncInsertForMoving$)
      .pipe(
        this.autoUnsubscribe(),
        filter(([removeEvent, insertEvent]) => {
          return (
            removeEvent.cards.map((c) => c.linkedWitId).join() ===
            insertEvent.cards.map((c) => c.linkedWitId).join()
          );
        })
      )
      .subscribe(([removeEvent, insertEvent]) => {
        removeEvent.cards === insertEvent.cards;
        this.sync.emit({
          type: SyncType.Move,
          cards: removeEvent.cards,
          linkedIterationId: insertEvent.linkedIterationId,
          linkedSourceId: insertEvent.linkedSourceId,
          oldLinkedIterationId: removeEvent.linkedIterationId,
          oldLinkedSourceId: removeEvent.linkedSourceId,
          isMoving: true,
        } as SyncEvent);
      });

    this.board.connections.on('valueChanged', this.onConnectionValueChanged);
    this.board.coworkers.on('valueChanged', this.onCoworkerValueChanged);
    this.board.columnHeaders.on('sequenceDelta', this.onColumnHeaderSeqChanged);

    if (!this.board.coworkers.has(this.currentUser.id))
      this.board.coworkers.set(this.currentUser.id, this.currentUser);
    this.boardService.coworkers$.next([...this.board.coworkers.values()]);
  }

  ngAfterViewInit(): void {
    // update a row height after inserting a row or zoom
    merge(this.bodyRowRefs.changes, this.boardService.zoom$.asObservable())
      .pipe(this.autoUnsubscribe())
      .subscribe(() => {
        setTimeout(() => {
          this.setBodyRowHeights(this.bodyRowRefs);
        }, 0);
      });

    this.scrollableBoardBody = (this.tableElementRef
      .nativeElement as HTMLElement).querySelector(
      '.p-datatable-scrollable-view.p-datatable-unfrozen-view .p-datatable-scrollable-body'
    );
    // reference to https://github.com/anseki/anim-event
    this.scrollableBoardBody.addEventListener(
      'scroll',
      this.updateConnectionWithAnimation
    );

    // initiate a line wrapper. All lines will move into this wrapper to avoid 'z-index' issue while scrolling
    this.connectionBuilder.createLineWrapper(this.scrollableBoardBody);
  }

  private updateConnectionWithAnimation = () => {
    AnimEvent.add(() => {
      this.connectionBuilder.update$.next();
    });
  };

  /** Workaround for updating connections while expanding/collaping sidenav */
  private iterationCount = 0;
  private repeater;
  public updateConnection = () => {
    this.connectionBuilder.updateConnectionWithAnimation();
  };

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.board.coworkers.has(this.currentUser.id))
      this.board.coworkers.delete(this.currentUser.id);

    this.board.connections.off('valueChanged', this.onConnectionValueChanged);
    this.board.coworkers.off('valueChanged', this.onCoworkerValueChanged);
    this.board.columnHeaders.off('sequenceDelta', this.onColumnHeaderSeqChanged);

    this.scrollableBoardBody.removeEventListener(
      'scroll',
      this.updateConnectionWithAnimation
    );
  }

  private onConnectionValueChanged = (event: IValueChanged) => {
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
  };

  private onCoworkerValueChanged = (event: IValueChanged) => {
    this.boardService.coworkers$.next([...this.board.coworkers.values()]);
    // ignore self
    if (event.key === this.currentUser.id) return;
    this.zone.run(() => {
      const coworker = this.board.coworkers.get(event.key);
      // one coworker has joined into collaboration
      if (coworker) {
        this.messageService.add({
          severity: 'info',
          summary: '🙋 Hello',
          detail: `${coworker.name}` + ` has joined the board.`,
        });
      } else {
        // one coworker has left
        this.messageService.add({
          severity: 'info',
          summary: '👋 Bye',
          detail: `${(event.previousValue as Coworker).name}` + ` has left the board.`,
        });
      }
    });
  };

  private onColumnHeaderSeqChanged = (event: SequenceDeltaEvent) => {
    this.cdr.detectChanges();
  };

  private setBodyRowHeights(rowRefs: QueryList<ElementRef>) {
    const oldValueString = this.bodyRowHeights.toString();
    this.bodyRowHeights =
      rowRefs?.map((rowRef) => (rowRef.nativeElement as HTMLElement).offsetHeight) ?? [];
    if (oldValueString !== this.bodyRowHeights.toString()) {
      this.cdr.markForCheck();
    }
  }

  public getCell(row: number, col: number): IFluidHandle<SharedObjectSequence<ICard>> {
    return this.board.grid.getCell(row, col);
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
      this.loadWitsOnBoard();
    }
  }
  // In order to update wit-state
  private loadWitsOnBoard() {
    const cardsOnBoard: ICard[] = [];
    this.cardContainers.forEach((cc: CardContainerComponent) =>
      cardsOnBoard.push(...cc.cards)
    );
    this.boardService.loadWits(cardsOnBoard.map((c) => c.linkedWitId));
  }

  public onInsert(
    [cards, isMoving]: [ICard[], boolean],
    rowIndex: number,
    colIndex: number
  ) {
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
    if (cardsToSync.length > 0) {
      const syncInsertEvent = {
        type: SyncType.Insert,
        cards: cardsToSync,
        linkedIterationId: this.rows[rowIndex].linkedIterationId,
        linkedSourceId: this.columns[colIndex].linkedSourceId,
        isMoving,
      } as SyncEvent;
      if (this.type === 'program' && isMoving)
        this.syncInsertForMoving$.next(syncInsertEvent);
      else this.sync.emit(syncInsertEvent);
    }
  }

  public onRemove(
    [cards, isMoving]: [ICard[], boolean],
    rowIndex: number,
    colIndex: number
  ) {
    const ids = cards.map((c) => c.linkedWitId);

    const cardsToSync = cards.filter((c) => this.typesAllowedToSync.includes(c.type));
    if (cardsToSync.length > 0) {
      const syncRemoveEvent = {
        type: SyncType.Remove,
        cards: cardsToSync,
        linkedIterationId: this.rows[rowIndex].linkedIterationId,
        linkedSourceId: this.columns[colIndex].linkedSourceId,
        isMoving,
      };
      if (this.type === 'program' && isMoving)
        this.syncRemoveForMoving$.next(syncRemoveEvent);
      else this.sync.emit(syncRemoveEvent);
    }

    // remove related connections from DDS, if really to delete a card
    if (!isMoving) {
      this.boardService.cardsRemove$.next(ids);
      ids.forEach((id) => {
        [...this.board.connections.entries()].forEach(([key, conn]) => {
          if (conn.endPointId === `${id}` || conn.startPointId === `${id}`) {
            this.board.connections.delete(key);
          }
        });
      });
    }
  }

  public onUpdate(cardIds: number[]) {
    if (this.loaded && cardIds.length > 0) this.connectionBuilder.update$.next();
  }

  public insertColumnAt(position: number) {
    this.board.grid.insertCols(position, 1);
    const newCellValues = [];
    for (let i = 0; i < this.board.grid.rowCount; i++) {
      const tmpSeq = SharedObjectSequence.create<ICard>(this.board.runtime);
      newCellValues.push(tmpSeq.handle as IFluidHandle<SharedObjectSequence<ICard>>);
    }
    this.board.grid.setCells(0, position, 1, newCellValues);

    // Inserting header muss be after inserting a column,
    // In this way could save a lot of unnecessary change detections.
    this.board.columnHeaders.insert(position, [
      { title: Constants.Default_Column_Text, linkedSourceId: undefined },
    ]);
  }

  public deleteColumnAt(position: number) {
    this.board.grid.removeCols(position, 1);
    this.board.columnHeaders.remove(position, position + 1);
  }

  public onColumnChange(index: number, newColHeader: IColumnHeader) {
    const segment = this.board.columnHeaders.getContainingSegment(index);
    let pos = this.board.columnHeaders.getPosition(segment.segment);
    pos = pos === -1 ? index : pos;
    this.board.columnHeaders.remove(pos, pos + 1);
    this.board.columnHeaders.insert(pos, [newColHeader]);
  }
}
