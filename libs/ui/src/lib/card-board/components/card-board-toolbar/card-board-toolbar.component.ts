import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { Constants } from '@pim/data';
import { MenuItem } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AutoUnsubscriber } from '../../../util';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'pim-card-board-toolbar',
  templateUrl: './card-board-toolbar.component.html',
  styleUrls: ['./card-board-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBoardToolbarComponent extends AutoUnsubscriber implements OnInit {
  @Output() toggleSidebar = new EventEmitter();
  public boardItems: MenuItem[];
  public sidenavOpened = false;

  constructor(private boardService: BoardService) {
    super();
  }

  get currentBoardName() {
    return this.boardService.currentBoardName;
  }

  get coworkerMenuItems$(): Observable<MenuItem[]> {
    return this.boardService.coworkers$.asObservable().pipe(
      switchMap((coworkers) => {
        return of(
          coworkers.map((coworker) => {
            return { label: coworker.name } as MenuItem;
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.boardService.availableBoards$.pipe(this.autoUnsubscribe()).subscribe(
      (boardBases) =>
        (this.boardItems = boardBases.map((base) => {
          return {
            label: base.name,
            disabled: base.name === this.currentBoardName,
            routerLink: this.getRouterLink(base.name),
          };
        }))
    );
  }

  private getRouterLink(boardName): string {
    return `../${
      boardName === Constants.Default_Programm_Board_Name
        ? Constants.Default_Programm_Board_Path
        : Constants.Default_Team_Board_Path
    }/${boardName}`;
  }

  public toggleWitSidebar() {
    this.toggleSidebar.emit();
    this.sidenavOpened = !this.sidenavOpened;
  }
}
