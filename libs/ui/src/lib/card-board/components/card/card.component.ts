import { animate, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { CardType, ICard } from '@pim/data';
import LeaderLine from 'leader-line-new';
import { MenuItem } from 'primeng/api';
import { SortableOptions } from 'sortablejs';
import { ConnectionBuilderService } from '../../../connection/connection-builder.service';
import { Connection_Drag_Handle_ID_Prefix } from '../../constants';
import { BoardService } from '../../services/board.service';

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

  public menuItems: MenuItem[] = [
    { label: 'Open', icon: 'pi pi-fw pi-download' },
    { label: 'Remove', icon: 'pi pi-fw pi-time' },
  ];

  public containerOptions: SortableOptions;
  public handleOptions: SortableOptions;
  public idPrefix = Connection_Drag_Handle_ID_Prefix;

  private startElement: HTMLElement;
  private dragAnchor: HTMLElement;
  private draggingConnection: LeaderLine;

  constructor(
    private connectionBuilder: ConnectionBuilderService,
    private renderer: Renderer2,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.containerOptions = { draggable: '.btn-drag-handle' };
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

  public onStart = (event: DragEvent) => {
    this.boardService.dragStartPointId = `${this.card.linkedWitId}`;
    this.startElement = document.getElementById(`${this.card.linkedWitId}`);
    this.initDragAnchor(event.clientX, event.clientY);
  };

  public onDrag = (event: DragEvent) => {
    if (this.draggingConnection) {
      this.setDragAnchorPosition(event.clientX, event.clientY);
      if (event.clientX + event.clientY) this.draggingConnection.position();
    } else {
      this.draggingConnection = this.connectionBuilder.drawLine(
        this.startElement,
        this.dragAnchor
      );
    }
  };

  public onEnd = () => {
    if (this.draggingConnection) {
      this.draggingConnection.remove();
      this.renderer.removeChild(document.body, this.dragAnchor);
      this.draggingConnection = undefined;
    }
  };

  public onDrop = () => {
    this.boardService.dragEndPointId = `${this.card.linkedWitId}`;
    this.boardService.insertNewConnection();
  };

  private initDragAnchor(x: number, y: number) {
    this.dragAnchor = this.renderer.createElement('div');
    this.renderer.setProperty(this.dragAnchor, 'draggable', true);
    this.renderer.appendChild(document.body, this.dragAnchor);
    this.renderer.setStyle(this.dragAnchor, 'position', 'absolute');
    this.setDragAnchorPosition(x, y);
  }

  private setDragAnchorPosition(x: number, y: number) {
    this.renderer.setStyle(this.dragAnchor, 'top', `${y}px`);
    this.renderer.setStyle(this.dragAnchor, 'left', `${x}px`);
  }
}
