import { animate, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SortableOptions } from 'sortablejs';
import {
  ConnectionBuilderService,
  ConnectionRef,
} from '../../../connection/connection-builder.service';
import { AutoUnsubscriber } from '../../../util';
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
export class CardComponent extends AutoUnsubscriber implements OnInit, AfterViewInit {
  @Input() card: ICard;
  /**
   * Event will be triggered, when this card has been loaded.
   */
  @Output() load = new EventEmitter();
  @Output() delete = new EventEmitter<ICard>();
  @Output() open = new EventEmitter<number>();

  @HostBinding('class')
  get typeClass() {
    return `card-${this.card.type}`;
  }

  private readonly defaultMenuItems: MenuItem[] = [
    {
      label: 'Open',
      icon: 'pi pi-reply',
      command: () => this.openSourceUrl(this.card.linkedWitId),
    },
    {
      label: 'Delete Card',
      icon: 'pi pi-times',
      command: () =>
        // Have to use setTimeout, otherwise menu keeps opening after clicking delete menu-item
        setTimeout(() => {
          this.deleteCard();
        }, 0),
    },
  ];

  public containerOptions: SortableOptions;
  public handleOptions: SortableOptions;
  public idPrefix = Connection_Drag_Handle_ID_Prefix;
  public relatedConnRefs: ConnectionRef[];
  public zoomLevel: number;

  private startElement: HTMLElement;
  private dragAnchor: HTMLElement;
  private draggingConnectionRef: ConnectionRef;
  public menuItems: MenuItem[];
  private connectionMenuItems: MenuItem[];
  private menuClose$: Subject<unknown>;

  @HostBinding('style.height')
  private cardHeight: string;

  @HostBinding('style.width')
  @HostBinding('style.maxWidth')
  @HostBinding('style.minWidth')
  private cardWidth: string;

  constructor(
    private connectionBuilder: ConnectionBuilderService,
    private renderer: Renderer2,
    private boardService: BoardService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.containerOptions = { draggable: '.btn-drag-handle' };
    this.zoom.pipe(this.autoUnsubscribe()).subscribe((zoomLevel) => {
      this.zoomLevel = zoomLevel;
      this.cardHeight = `${this.boardService.cardHeightBase * zoomLevel}em`;
      this.cardWidth = `${this.boardService.cardWidthBase * zoomLevel}px`;
      this.cdr.markForCheck();
    });
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

  public initMenuItems() {
    this.menuItems = [...this.defaultMenuItems];
    const relatedConnRefs = this.connectionBuilder.getRelatedConnections(
      `${this.card.linkedWitId}`
    );
    if (relatedConnRefs.length > 0) {
      this.connectionMenuItems = [
        {
          label: 'Delete Line to...',
          icon: 'pi pi-fw pi-times',
          items: this.createConnectionSubmenuItems(relatedConnRefs),
        },
      ];
      this.menuItems.push(...this.connectionMenuItems);
      // Use timeout to avoid overlapping two card menus. One is opening, another is closing,
      // If it happened, the number of menu items would not match the number of related connections
      // And lead to unexpected error
      setTimeout(() => {
        this.addSubmenuItemListner(relatedConnRefs);
      }, 500);
    }
  }

  public resetMenuItems() {
    this.menuItems = [...this.defaultMenuItems];
    this.menuClose$?.next();
    this.menuClose$?.complete();
    this.menuClose$ = undefined;
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

  public get zoom() {
    return this.boardService.zoom$.asObservable();
  }

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

  private createConnectionSubmenuItems(connRefs: ConnectionRef[]): MenuItem[] {
    return connRefs.map((ref) => {
      const cardId =
        ref.connection.startPointId === `${this.card.linkedWitId}`
          ? ref.connection.endPointId
          : ref.connection.startPointId;
      return {
        label: `Work Item ${cardId}`,
        icon: 'pi pi-times',
        title: `Click to delete the dependency on work item ${cardId}`,
        styleClass: 'dependency-menu-item',
        command: () => {
          this.boardService.connectionDelete$.next(ref.connection);
          this.boardService.unMarkCard(ref.connection.startPointId);
          this.boardService.unMarkCard(ref.connection.endPointId);
        },
      } as MenuItem;
    });
  }

  private addSubmenuItemListner(connRefs: ConnectionRef[]) {
    this.menuClose$ = new Subject();
    const menuEle: HTMLElement = document.querySelector('.card-menu');
    const menuItemEles = document.querySelectorAll('.card-menu .dependency-menu-item');
    if (menuItemEles.length === connRefs.length)
      menuItemEles.forEach((ele, index) => {
        fromEvent(ele, 'mouseenter')
          .pipe(takeUntil(this.menuClose$))
          .subscribe(() => {
            menuEle.style.opacity = '0.8';
            const connRef = connRefs[index];
            this.connectionBuilder.markConnection(connRef);
            this.boardService.markCard(connRef.connection.startPointId);
            this.boardService.markCard(connRef.connection.endPointId);
          });
        fromEvent(ele, 'mouseleave')
          .pipe(takeUntil(this.menuClose$))
          .subscribe(() => {
            menuEle.style.opacity = '1';
            const connRef = connRefs[index];
            this.connectionBuilder.unMarkConnection(connRef);
            this.boardService.unMarkCard(connRef.connection.startPointId);
            this.boardService.unMarkCard(connRef.connection.endPointId);
          });
      });
    else
      console.error(
        `Connection menu items did not match with related connections! WorkItem: ${this.card.linkedWitId}, Related connection: ${connRefs.length}`
      );
  }
}
