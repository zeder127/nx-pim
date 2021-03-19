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
  implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @Input('model') board: CardBoardDDS;
  @Input() type: 'program' | 'team' = 'program';
  @Input() typesAllowedToSync: CardType[];
  @Input('coworker') currentUser: Coworker;

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
  private scrollableBoardBody: HTMLElement;
  private mappedSourceIds: number[] = [];
  public bodyRowHeights: number[] = [];

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

    this.boardService.currentPiName = this.route.snapshot.paramMap.get('piName');
    this.boardService.currentTeamName = this.route.snapshot.paramMap.get('teamName');
    this.boardService.connectionInsert$
      .pipe(this.autoUnsubscribe())
      .subscribe((newConnection) => {
        const newKey = `${newConnection.startPointId}-${newConnection.endPointId}`;
        if (!this.board.connections.has(newKey))
          this.board.connections.set(newKey, newConnection);
      });

    this.board.connections.on('valueChanged', this.onConnectionValueChanged);
    this.board.coworkers.on('valueChanged', this.onCoworkerValueChanged);
    this.board.columnHeaders.on('sequenceDelta', this.onColumnHeaderSeqChanged);

    if (!this.board.coworkers.has(this.currentUser.id))
      this.board.coworkers.set(this.currentUser.id, this.currentUser);
    this.boardService.coworkers$.next([...this.board.coworkers.values()]);
  }

  ngAfterViewInit(): void {
    // insert a row
    this.bodyRowRefs.changes.pipe(this.autoUnsubscribe()).subscribe(() => {
      this.setBodyRowHeights(this.bodyRowRefs);
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
    this.connectionBuilder.update$.next();
    if (this.iterationCount++ > 20) {
      cancelAnimationFrame(this.repeater);
      this.iterationCount = 0;
    } else {
      this.repeater = requestAnimationFrame(this.updateConnection);
    }
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
    if (this.loaded && cardIds.length > 0) this.connectionBuilder.update$.next(true);
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
