import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import { CardType, ICard } from '@pim/data';
import { FluidLoaderService, PimDataObjectHelper } from '@pim/data/fluid';
import { toCard } from '@pim/data/util';
import { Options, SortableEvent } from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { WitStateService } from '../../../http/services/wit-state.service';
import { AutoUnsubscriber } from '../../../util/base/auto-unsubscriber';
import { Sortable_Group_Name, Source_ID_Prefix } from '../../constants';
import { BoardService } from '../../services/board.service';

/**
 * Container component in every cell of board, to hold a list of cards
 */
@Component({
  selector: 'pim-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContainerComponent extends AutoUnsubscriber
  implements OnInit, OnChanges, OnDestroy {
  public cardsSeq: SharedObjectSequence<ICard>;
  private loadedCardsCount = 0;
  public cards: ICard[] = [];
  public containerId: string;
  public sortableOptions: Options;

  @Input('cards') cardsSeqHandle: IFluidHandle<SharedObjectSequence<ICard>>;
  @Output() load = new EventEmitter<number[]>(); // linkedWitIds of the cards loaded in this card-container
  @Output() insert = new EventEmitter<ICard[]>(); // the new cards inserted
  @Output() delete = new EventEmitter<[ICard[], boolean]>(); // the cards to remove, flag for isMoving
  @Output() update = new EventEmitter<number[]>();

  constructor(
    private boardService: BoardService,
    private witState: WitStateService,
    private connectionBuilder: ConnectionBuilderService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private fluidLoaderService: FluidLoaderService
  ) {
    super();
    this.containerId = uuidv4();
  }

  async ngOnInit() {
    this.sortableOptions = {
      group: Sortable_Group_Name,
      dragClass: 'sortable-drag',
      ghostClass: 'sortable-ghost',
      filter: '.btn-drag-handle',
      easing: 'cubic-bezier(1, 0, 0, 1)', // seems it doesn't work
      forceFallback: true,
      onAdd: this.onAdd,
      onRemove: this.onRemove,
      onUpdate: this.onUpdate,
      onChange: this.updateConnection,
      onStart: this.onDragStart,
    };
    if (!this.cardsSeqHandle) {
      return; // TODO remove, only for debug
    }
    await this.loadCardsSeq();

    // If no card in container, have to emit load event manully
    if (this.cardsSeq.getItemCount() === 0) {
      this.load.next();
      this.load.complete();
    }
  }

  private async loadCardsSeq() {
    this.cardsSeq = await this.cardsSeqHandle.get();
    this.cardsSeq.on('sequenceDelta', this.onCardsSeqChange);
    this.doUpdate();
  }

  async ngOnChanges({ cardsSeqHandle }: SimpleChanges) {
    if (
      cardsSeqHandle &&
      !cardsSeqHandle.isFirstChange() &&
      !cardsSeqHandle.previousValue &&
      cardsSeqHandle.currentValue &&
      cardsSeqHandle.currentValue?.IFluidHandle
    ) {
      await this.loadCardsSeq();
      this.load.next();
      this.load.complete();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.cardsSeq?.off('sequenceDelta', this.onCardsSeqChange);
  }

  private onCardsSeqChange = (event: SequenceDeltaEvent) => {
    this.zone.run(() => {
      const deltaCards = PimDataObjectHelper.getItemsFromSequenceDeltaEvent<ICard>(event);
      this.doUpdate(deltaCards);
    });
  };

  // TODO
  public addCard() {
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
  public deleteCard(card: ICard, index: number) {
    this.cardsSeq.removeRange(index, index + 1);
    this.delete.emit([[card], false]);
  }

  public openSourceUrl(id: number) {
    this.boardService.openSourceUrl(id);
  }

  // TODO: only update deltaCards
  private doUpdate(deltaCards?: ICard[]) {
    this.cards = this.cardsSeq.getRange(0);
    // makeForChange doesn't work here, there would be timing problem with drawing a line.
    this.cdr.detectChanges();
    this.update.emit(this.cards.map((c) => c.linkedWitId));
    this.connectionBuilder.update$.next();
  }

  // TODO move d&d code into a directive
  // *******************************************************/
  // **************** Start: Drag and Drop *****************/
  // *******************************************************/
  private onAdd = (event: SortableEvent) => {
    // NOTE Using setTimeout to let onAdd triggered after onRemove
    // As described in doc, onAdd should happen after onRemove, but it doesn't
    // https://github.com/SortableJS/ngx-sortablejs#how-it-works
    setTimeout(() => {
      const newId = event.item.id.replace(Source_ID_Prefix, '');
      this.insertCard([parseInt(newId)], this.cardsSeq, event.newIndex);
    }, 0);
  };

  private onRemove = (event: SortableEvent) => {
    const cardsToRemove = this.cardsSeq.getRange(event.oldIndex, event.oldIndex + 1);
    this.cardsSeq.removeRange(event.oldIndex, event.oldIndex + 1);
    this.delete.emit([cardsToRemove, true]);
  };

  private onUpdate = (event: SortableEvent) => {
    // drag the last item and drop it at the last position again, no need to move it in sequence
    if (event.oldIndex === this.cards.length - 1 && event.newIndex === this.cards.length)
      return;
    this.moveItemInSequence(event.oldIndex, event.newIndex);
  };

  private onDragStart = (event: SortableEvent) => {
    // dragged element get the same id as target element, have to set its id with a suffix
    // in order to avoid drawing wrong lines while dragging
    const draggedElement = document.querySelector('.sortable-chosen.sortable-drag');
    draggedElement.id += '$';
  };

  // Make updateing connections smoother
  // Tried to move code to ConnectionBuilder,
  // but there is a side-effect on drag&drop
  private iterationCount = 0;
  private repeater;
  private updateConnection = () => {
    this.connectionBuilder.update$.next();
    if (this.iterationCount++ > 20) {
      cancelAnimationFrame(this.repeater);
      this.iterationCount = 0;
    } else {
      this.repeater = requestAnimationFrame(this.updateConnection);
    }
  };

  private moveItemInSequence(oldIndex: number, newIndex: number) {
    const itemsToMove = this.cardsSeq.getItems(oldIndex, oldIndex + 1);
    this.cardsSeq.remove(oldIndex, oldIndex + 1);

    // try to avoid invalidRang error
    const seqLength = this.cardsSeq.getLength();
    if (newIndex === seqLength + itemsToMove.length) newIndex = seqLength;
    this.cardsSeq.insert(newIndex, itemsToMove);
  }

  private insertCard(
    cardIds: number[],
    seq: SharedObjectSequence<ICard>,
    currentIndex: number
  ) {
    const insertedCards = cardIds.map((id) => toCard(this.witState.getWitById(id)));
    seq.insert(currentIndex, insertedCards);
    this.insert.emit(insertedCards);
  }

  // *******************************************************/
  // ****************** End: Drag and Drop *****************/
  // *******************************************************/
}
