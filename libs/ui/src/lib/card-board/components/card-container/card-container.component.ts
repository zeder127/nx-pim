import { CdkDragDrop, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import { ICard } from '@pim/data';
import { v4 as uuidv4 } from 'uuid';
import {
  ConnectionBuilderService,
  ConnectionRef,
} from '../../../connection/connection-builder.service';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss'],
})
export class CardContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  private relatedConnections: ConnectionRef[] = [];
  private draggingConnections: ConnectionRef[];
  public cardsSeq: SharedObjectSequence<ICard>;
  private loadedCardsCount = 0;
  public cards: ICard[] = [];

  @Input('cards') cardsSeqHandle: IFluidHandle<SharedObjectSequence<ICard>>;
  @Output() load = new EventEmitter();

  constructor(
    private boardService: BoardService,
    private connectionBuilder: ConnectionBuilderService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.cardsSeq = await this.cardsSeqHandle.get();
    this.cardsSeq.on('sequenceDelta', (event: SequenceDeltaEvent) => {
      console.log(`🚀 ~ CardContainer ~ SequenceDeltaEvent`, event);
      this.update(true);
    });
    this.update();
  }

  ngAfterViewInit(): void {
    console.log(`🚀 ~ CardContainerComponent ~ ngAfterViewInit()`);
  }

  ngOnDestroy(): void {
    this.connectionBuilder.clear();
  }

  public addCard() {
    const DemoCard: ICard = {
      id: uuidv4(),
      text: `New card ${Math.floor(Math.random() * 10)}`,
      linkedWitId: 100,
      x: undefined, // TODO
      y: undefined, // TODO
    };
    this.cardsSeq.insert(this.cardsSeq.getItemCount(), [DemoCard]);
    this.update(true);
  }

  public onLoad() {
    this.loadedCardsCount++;
    if (this.loadedCardsCount === this.cardsSeq.getItemCount()) {
      this.load.emit();
    }
  }

  public removeCard(card: ICard) {
    const indexToRemove = this.cards.findIndex((c) => c.id === card.id);
    if (indexToRemove > -1) this.cardsSeq.removeRange(indexToRemove, indexToRemove + 1);
  }

  private update(detechChanges?: boolean) {
    this.cards = this.cardsSeq.getRange(0);
    this.connectionBuilder.updatePositions();
    if (detechChanges) this.cdr.detectChanges();
  }

  // *******************************************************/
  // **************** Start: Drag and Drop *****************/
  // *******************************************************/
  public drop(event: CdkDragDrop<ICard[]>) {
    if (event.previousContainer === event.container) {
      this.moveItemInSequence(
        event.container.data as never,
        event.previousIndex,
        event.currentIndex
      );
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
    previousSeq: SharedObjectSequence<ICard>,
    currentSeq: SharedObjectSequence<ICard>,
    previousIndex: number,
    currentIndex: number
  ) {
    const itemsToMove = previousSeq.getItems(previousIndex, previousIndex + 1);
    previousSeq.removeRange(previousIndex, previousIndex + 1);
    currentSeq.insert(currentIndex, itemsToMove);
  }

  private moveItemInSequence(
    seq: SharedObjectSequence<ICard>,
    previousIndex: number,
    currentIndex: number
  ) {
    const itemsToMove = seq.getItems(previousIndex, previousIndex + 1);
    seq.removeRange(previousIndex, previousIndex + 1);
    seq.insert(currentIndex, itemsToMove);
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
      this.connectionBuilder.redrawConnections(`${event.item.data.linkedWitId}`); // Re-draw all lines
    }, 0);
    this.draggingConnections.forEach((ref) => ref.line.remove());
    this.draggingConnections = undefined;
  }
  // *******************************************************/
  // ****************** End: Drag and Drop *****************/
  // *******************************************************/
}
