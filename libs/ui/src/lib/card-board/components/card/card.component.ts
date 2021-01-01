import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ICard } from '@pim/data';

@Component({
  selector: 'pim-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit, AfterViewInit {
  @Input() card: ICard;
  /**
   * Event will be triggered, when this card has been loaded.
   */
  @Output() load = new EventEmitter();
  @Output() remove = new EventEmitter<ICard>();
  constructor() {}

  ngOnInit(): void {
    //
  }

  ngAfterViewInit(): void {
    this.load.emit();
  }

  public onRemove() {
    this.remove.emit(this.card);
  }
}
