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
import { SortableEvent, SortableOptions } from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionBuilderService,
  ConnectionRef,
} from '../../../connection/connection-builder.service';
import { WitService } from '../../../http';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { Sortable_Group_Name, Source_ID_Prefix } from '../../constants';
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
  public sortableOptions: SortableOptions;

  @Input('cards') cardsSeqHandle: IFluidHandle<SharedObjectSequence<ICard>>;
  @Output() load = new EventEmitter<number[]>(); // linkedWitIds of the cards loaded in this card-container
  @Output() insert = new EventEmitter<ICard[]>(); // the new cards inserted
  // @Output() insertBySync = new EventEmitter<ICard[]>(); // the new cards inserted by Sync
  @Output() delete = new EventEmitter<ICard[]>(); // linkedWitId of the cards to remove
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
    this.sortableOptions = {
      group: Sortable_Group_Name,
      dragClass: 'sortable-drag',
      ghostClass: 'sortable-ghost',
      easing: 'cubic-bezier(1, 0, 0, 1)', // seems it doesn't work
      forceFallback: true,
      onAdd: this.onAdd,
      onRemove: this.onRemove,
      onUpdate: this.onUpdate,
    };

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

  // TODO multi delete
  public removeCard(card: ICard, index: number) {
    // remove from SharedObjectSequence
    this.cardsSeq.removeRange(index, index + 1);
    this.delete.emit([card]);
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
  private onAdd = (event: SortableEvent) => {
    const newId = event.item.id.replace(Source_ID_Prefix, '');
    this.updateAndInsertCard([parseInt(newId)], this.cardsSeq, event.newIndex);
  };
  private onRemove = (event: SortableEvent) => {
    const cardToRemove = this.cardsSeq.getItems(event.oldIndex, event.oldIndex + 1)[0];
    this.removeCard(cardToRemove, event.oldIndex);
  };
  private onUpdate = (event: SortableEvent) => {
    this.moveItemInSequence(event.oldIndex, event.newIndex);
  };

  private moveItemInSequence(oldIndex: number, newIndex: number) {
    const itemsToMove = this.cardsSeq.getItems(oldIndex, oldIndex + 1);
    this.cardsSeq.removeRange(oldIndex, oldIndex + 1);
    this.updateAndInsertCard(
      itemsToMove.map((item) => item.linkedWitId),
      this.cardsSeq,
      newIndex
    );
  }

  private updateAndInsertCard(
    cardIds: number[],
    seq: SharedObjectSequence<ICard>,
    currentIndex: number
  ) {
    this.witService.getWorkItems(cardIds).subscribe((wits) => {
      const updatedCards = wits.map((wit) => toCard(wit));
      seq.insert(currentIndex, updatedCards);
      this.insert.emit(updatedCards);
    });
  }

  // public dragStart(event: CdkDragStart<ICard>) {
  //   this.relatedConnections = this.connectionBuilder.getRelatedConnections(
  //     `${event.source.data.linkedWitId}`
  //   );
  //   this.relatedConnections.forEach((ref) => {
  //     // remove related connections
  //     ref.line.remove();
  //   });
  // }

  // public dragMove(event: CdkDragMove<ICard>) {
  //   const draggedCard = event.source.data;
  //   const draggedPreviewElement: HTMLElement = document.querySelector(
  //     '.cdk-drag-preview'
  //   );

  //   if (!this.draggingConnections) {
  //     this.draggingConnections = this.relatedConnections.map((ref) => {
  //       // replace line with a new one that updates position while dragging
  //       if (ref.connection.startPointId === `${draggedCard.linkedWitId}`) {
  //         ref.line = this.connectionBuilder.drawLine(
  //           draggedPreviewElement,
  //           document.getElementById(ref.connection.endPointId)
  //         );
  //       } else {
  //         ref.line = this.connectionBuilder.drawLine(
  //           document.getElementById(ref.connection.startPointId),
  //           draggedPreviewElement
  //         );
  //       }
  //       return ref;
  //     });
  //   }

  //   this.draggingConnections.forEach((ref) => ref.line.position());

  //   // update non-related connetions
  //   this.connectionBuilder
  //     .getNonRelatedConnections(`${event.source.data.linkedWitId}`)
  //     .forEach((ref) => {
  //       ref.line.position(); // update position
  //     });
  // }

  // public dragDropped(event: CdkDragDrop<ICard>) {
  //   // Have to use setTimeout, because at this moment, the dropped item has not been rendered on Dom.
  //   // Without setTimeout, all lines will get wrong startPoint or endPoint.
  //   setTimeout(() => {
  //     this.connectionBuilder.redrawConnections(`${event.item.data.linkedWitId}`); // Re-draw all related lines
  //   }, 0);
  //   this.draggingConnections.forEach((ref) => ref.line.remove());
  //   this.draggingConnections = undefined;
  // }
  // *******************************************************/
  // ****************** End: Drag and Drop *****************/
  // *******************************************************/
}
