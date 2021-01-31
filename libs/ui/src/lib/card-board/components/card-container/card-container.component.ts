import {
  CdkDragDrop,
  CdkDragEnter,
  CdkDragMove,
  CdkDragStart,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { MergeTreeDeltaType } from '@fluidframework/merge-tree';
import {
  SequenceDeltaEvent,
  SequenceEvent,
  SharedObjectSequence,
} from '@fluidframework/sequence';
import { CardType, ICard } from '@pim/data';
import { FluidLoaderService, PimDataObjectHelper } from '@pim/data/fluid';
import { toCard } from '@pim/data/util';
import { SortableOptions } from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionBuilderService,
  ConnectionRef,
} from '../../../connection/connection-builder.service';
import { WitService } from '../../../http';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { BoardService } from '../../services/board.service';

const Drag_Out = 'dragOut';

/**
 * Container component in every cell of board, to hold a list of cards
 */
@Component({
  selector: 'pim-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContainerComponent extends AutoUnsubscriber implements OnInit {
  private relatedConnections: ConnectionRef[] = [];
  private draggingConnections: ConnectionRef[];
  public cardsSeq: SharedObjectSequence<ICard>;
  private loadedCardsCount = 0;
  public cards: ICard[] = [];
  public containerId: string;
  public sortableOptions: SortableOptions = {
    group: 'card-container',
    dragClass: 'sortable-drag',
    ghostClass: 'sortable-ghost',
    easing: 'cubic-bezier(1, 0, 0, 1)', // seems it doesn't work
    forceFallback: true,
  };

  @Input('cards') cardsSeqHandle: IFluidHandle<SharedObjectSequence<ICard>>;
  @Output() load = new EventEmitter<number[]>(); // linkedWitIds of the cards loaded in this card-container
  @Output() insert = new EventEmitter<ICard[]>(); // the new cards inserted
  // @Output() insertBySync = new EventEmitter<ICard[]>(); // the new cards inserted by Sync
  @Output() remove = new EventEmitter<ICard[]>(); // linkedWitId of the cards to remove
  // TODO check, maybe remove, only for connections
  @Output() dragOut = new EventEmitter<ICard[]>(); // linkedWitId of the cards to drag into another card-container

  constructor(
    private boardService: BoardService,
    private witService: WitService,
    private connectionBuilder: ConnectionBuilderService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private fluidLoaderService: FluidLoaderService
  ) {
    super();
    this.containerId = uuidv4();
  }

  get ids() {
    return this.cards.map((c) => c.linkedWitId).join(', ');
  }

  async ngOnInit() {
    this.cardsSeq = await this.cardsSeqHandle.get();

    this.cardsSeq.on('sequenceDelta', (event: SequenceDeltaEvent) => {
      // Event is occuring outside of Angular, have to run in ngZone for korrect changedetection
      this.zone.run(() => {
        this.doUpdate();
        const deltaCards = PimDataObjectHelper.getItemsFromSequenceDeltaEvent<ICard>(
          event
        );

        // TODO to delete??
        // if (event.opArgs.op.type === MergeTreeDeltaType.INSERT) {
        //   this.insertBySync.emit(deltaCards);
        // }
        if (event.opArgs.op.type === MergeTreeDeltaType.REMOVE) {
          if (event.opArgs.op.register === Drag_Out) {
            // TODO still useful for connections?
            this.dragOut.emit(deltaCards);
          } else {
            // TODO to delete??
            //this.remove.emit(deltaCards);
          }
        }
      });
    });

    this.doUpdate();

    // If no card in container, have to emit load event manully
    if (this.cardsSeq.getItemCount() === 0) this.load.next();
  }

  public addCard() {
    // this.witService.createWit();
    const DemoCard: ICard = {
      id: uuidv4(),
      text: `New card ${Math.floor(Math.random() * 10)}`,
      linkedWitId: 10000 + Math.floor(Math.random() * 10),
      type: CardType.PBI,
      x: undefined, // TODO
      y: undefined, // TODO
    };
    this.cardsSeq.insert(this.cardsSeq.getItemCount(), [DemoCard]);
    this.doUpdate();
  }

  public onLoad() {
    this.loadedCardsCount++;
    if (this.loadedCardsCount === this.cardsSeq.getItemCount()) {
      const cards = this.cardsSeq.getRange(0);
      this.load.emit(cards.map((c) => c.linkedWitId));
    }
  }

  public removeCard(card: ICard) {
    // remove from SharedObjectSequence
    const indexToRemove = this.cards.findIndex((c) => c.linkedWitId === card.linkedWitId);
    if (indexToRemove > -1) this.cardsSeq.removeRange(indexToRemove, indexToRemove + 1);
    this.remove.emit([card]);
  }

  public openSourceUrl(id: number) {
    this.boardService.openSourceUrl(id);
  }

  private doUpdate() {
    this.cards = this.cardsSeq.getRange(0);
    this.cdr.markForCheck();
    this.connectionBuilder.update$.next();
  }

  private isSelf(event: SequenceEvent) {
    return this.fluidLoaderService.clientId === event.clientId;
  }

  // *******************************************************/
  // **************** Start: Drag and Drop *****************/
  // *******************************************************/
  public drop(event: CdkDragDrop<ICard[]>) {
    if (event.previousContainer.connectedTo === event.container.connectedTo) {
      // Index really changed
      if (event.previousIndex !== event.currentIndex) {
        this.moveItemInSequence(event.previousIndex, event.currentIndex);
      }
    } else {
      this.transferSequenceItem(
        event.previousContainer.data as never,
        event.container.data as never,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  private transferSequenceItem(
    previousSeq: SharedObjectSequence<ICard> | Array<ICard>,
    currentSeq: SharedObjectSequence<ICard>,
    previousIndex: number,
    currentIndex: number
  ) {
    let cardsToMove: ICard[];
    if (Array.isArray(previousSeq)) {
      // dragged from source-list
      cardsToMove = [previousSeq[previousIndex]];
    } else {
      // dragged from another card-container
      cardsToMove = previousSeq.getItems(previousIndex, previousIndex + 1);
      // Use 'cut' instead of 'remove': possible to set a register name.
      // Using it to tell other client, card will be just moved to another CardContainer.
      // Its related connection should not be removed
      previousSeq.cut(previousIndex, previousIndex + 1, Drag_Out);
    }
    this.updateAndInsertCard(cardsToMove, currentSeq, currentIndex);
  }

  private moveItemInSequence(previousIndex: number, currentIndex: number) {
    const itemToMove = this.cardsSeq.getItems(previousIndex, previousIndex + 1);
    this.cardsSeq.removeRange(previousIndex, previousIndex + 1);
    this.updateAndInsertCard(itemToMove, this.cardsSeq, currentIndex);
  }

  private updateAndInsertCard(
    itemToMove: ICard[],
    seq: SharedObjectSequence<ICard>,
    currentIndex: number
  ) {
    this.witService
      .getWorkItems(itemToMove.map((c) => c.linkedWitId))
      .subscribe((wits) => {
        const updatedCards = wits.map((wit) => toCard(wit));
        seq.insert(currentIndex, itemToMove);
        this.insert.emit(updatedCards);
      });
  }

  dragContainerEnter(event: CdkDragEnter) {
    console.log(`🚀 ~ CardContainerComponent ~ event`, event);
  }

  public dragEnter(event: CdkDragEnter<number>) {
    if (event.item.dropContainer.connectedTo === event.container.connectedTo)
      moveItemInArray(this.cards, event.item.data, event.container.data);
  }

  public dragStart(event: CdkDragStart<ICard>) {
    this.relatedConnections = this.connectionBuilder.getRelatedConnections(
      `${event.source.data.linkedWitId}`
    );
    this.relatedConnections.forEach((ref) => {
      // remove related connections
      ref.line.remove();
    });
  }

  public dragMove(event: CdkDragMove<ICard>) {
    const draggedCard = event.source.data;
    const draggedPreviewElement: HTMLElement = document.querySelector(
      '.cdk-drag-preview'
    );

    if (!this.draggingConnections) {
      this.draggingConnections = this.relatedConnections.map((ref) => {
        // replace line with a new one that updates position while dragging
        if (ref.connection.startPointId === `${draggedCard.linkedWitId}`) {
          ref.line = this.connectionBuilder.drawLine(
            draggedPreviewElement,
            document.getElementById(ref.connection.endPointId)
          );
        } else {
          ref.line = this.connectionBuilder.drawLine(
            document.getElementById(ref.connection.startPointId),
            draggedPreviewElement
          );
        }
        return ref;
      });
    }

    this.draggingConnections.forEach((ref) => ref.line.position());

    // update non-related connetions
    this.connectionBuilder
      .getNonRelatedConnections(`${event.source.data.linkedWitId}`)
      .forEach((ref) => {
        ref.line.position(); // update position
      });
  }

  public dragDropped(event: CdkDragDrop<ICard>) {
    // Have to use setTimeout, because at this moment, the dropped item has not been rendered on Dom.
    // Without setTimeout, all lines will get wrong startPoint or endPoint.
    setTimeout(() => {
      this.connectionBuilder.redrawConnections(`${event.item.data.linkedWitId}`); // Re-draw all related lines
    }, 0);
    this.draggingConnections.forEach((ref) => ref.line.remove());
    this.draggingConnections = undefined;
  }
  // *******************************************************/
  // ****************** End: Drag and Drop *****************/
  // *******************************************************/
}
