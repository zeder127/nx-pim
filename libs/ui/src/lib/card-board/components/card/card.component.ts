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
import { ICard } from '@pim/data';
import AnimEvent from 'anim-event';
import { MenuItem } from 'primeng/api';
import { SortableOptions } from 'sortablejs';
import {
  ConnectionBuilderService,
  ConnectionRef,
} from '../../../connection/connection-builder.service';
import { Connection_Drag_Handle_ID_Prefix } from '../../constants';
import { BoardService } from '../../services/board.service';
import { getBorderLeftColor } from '../../utils/card-type-style';

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
  @Output() delete = new EventEmitter<ICard>();
  @Output() open = new EventEmitter<number>();

  @HostBinding('class')
  get typeClass() {
    return 'card-type-class';
  }

  @HostBinding('style.border-left-color')
  get borderLeftColor() {
    return getBorderLeftColor(this.card.type);
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
  private draggingConnectionRef: ConnectionRef;

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

  public deleteCard() {
    this.delete.emit(this.card);
  }

  public onStart = (event: DragEvent) => {
    this.boardService.dragStartPointId = `${this.card.linkedWitId}`;
    this.startElement = document.getElementById(`${this.card.linkedWitId}`);
    this.initDragAnchor(event.clientX, event.clientY);
  };

  public onDrag = AnimEvent.add((event: DragEvent) => {
    if (this.draggingConnectionRef) {
      this.setDragAnchorPosition(event.clientX, event.clientY);
      if (event.clientX + event.clientY) {
        this.draggingConnectionRef.line.position();
      }
    } else {
      this.draggingConnectionRef = {
        line: this.connectionBuilder.drawLine(this.startElement, this.dragAnchor),
        svg: document.querySelector('body>.leader-line:last-of-type') as SVGElement,
        connection: undefined, // dummy,
      };
    }
  });

  public onEnd = () => {
    if (this.draggingConnectionRef.line) {
      this.connectionBuilder.executeLineRemove(this.draggingConnectionRef);
      this.renderer.removeChild(document.body, this.dragAnchor);
      this.draggingConnectionRef = undefined;
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
