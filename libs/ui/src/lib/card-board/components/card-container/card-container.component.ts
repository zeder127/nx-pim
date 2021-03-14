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
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { WitService } from '../../../http';
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
  public sortableOptions: SortableOptions;

  @Input('cards') cardsSeqHandle: IFluidHandle<SharedObjectSequence<ICard>>;
  @Output() load = new EventEmitter<number[]>(); // linkedWitIds of the cards loaded in this card-container
  @Output() insert = new EventEmitter<ICard[]>(); // the new cards inserted
  @Output() update = new EventEmitter<number[]>();

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
      onChange: this.onChange,
    };
    if (!this.cardsSeqHandle) {
      //this.cdr.markForCheck();
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
      console.log(`🚀 ~ loadCardsSeq in onChanges`);
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
  public deleteCard(card: ICard, index: number) {
    this.cardsSeq.removeRange(index, index + 1);
    this.delete.emit([card]);
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
  }

  private isSelf(event: SequenceEvent) {
    return this.fluidLoaderService.clientId === event.clientId;
  }

  // TODO move d&d code into a directive
  // *******************************************************/
  // **************** Start: Drag and Drop *****************/
  // *******************************************************/
  private onAdd = (event: SortableEvent) => {
    const newId = event.item.id.replace(Source_ID_Prefix, '');
    this.updateAndInsertCard([parseInt(newId)], this.cardsSeq, event.newIndex);
  };

  private onRemove = (event: SortableEvent) => {
    this.cardsSeq.removeRange(event.oldIndex, event.oldIndex + 1);
  };

  private onUpdate = (event: SortableEvent) => {
    // drag the last item and drop it at the last position again, no need to move it in sequence
    if (event.oldIndex === this.cards.length - 1 && event.newIndex === this.cards.length)
      return;
    this.moveItemInSequence(event.oldIndex, event.newIndex);
  };

  public onChange = () => {
    this.connectionBuilder.update$.next();
  };

  private moveItemInSequence(oldIndex: number, newIndex: number) {
    const itemsToMove = this.cardsSeq.getItems(oldIndex, oldIndex + 1);
    this.cardsSeq.remove(oldIndex, oldIndex + 1);

    // try to avoid invalidRang error
    const seqLength = this.cardsSeq.getLength();
    if (newIndex === seqLength + itemsToMove.length) newIndex = seqLength;
    this.cardsSeq.insert(newIndex, itemsToMove);
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

  // *******************************************************/
  // ****************** End: Drag and Drop *****************/
  // *******************************************************/
}
