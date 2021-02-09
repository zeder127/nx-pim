import { animate, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CardType, ICard } from '@pim/data';

@Component({
  selector: 'pim-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('cardInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CardComponent implements OnInit, AfterViewInit {
  @Input() card: ICard;
  /**
   * Event will be triggered, when this card has been loaded.
   */
  @Output() load = new EventEmitter();
  @Output() remove = new EventEmitter<ICard>();
  @Output() open = new EventEmitter<number>();

  @HostBinding('class')
  get typeClass() {
    return 'card-type-class';
  }

  @HostBinding('style.border-left-color')
  get borderLeftColor() {
    // TODO Setting: CardType Color
    switch (this.card.type) {
      case CardType.Delivery:
        return '#fbbc3d';
      case CardType.Enabler:
        return '#7ace64';
      case CardType.Feature:
        return '#602f70';
      case CardType.Milestone:
        return '#ec001d';
      default:
        return '#009ccc';
    }
  }

  ngOnInit(): void {
    //
  }

  ngAfterViewInit(): void {
    this.load.emit();
  }

  public openSourceUrl(id: number) {
    this.open.emit(id);
  }

  public onRemove() {
    this.remove.emit(this.card);
  }
}
