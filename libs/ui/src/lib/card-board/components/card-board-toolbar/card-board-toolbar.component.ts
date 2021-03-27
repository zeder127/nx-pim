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
  public settingMenuItems: MenuItem[];
  constructor(private boardService: BoardService) {
    super();
    this.settingMenuItems = [
      {
        label: 'Show lines',
      },
      {
        label: 'Show last editor',
      },
    ];
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
    this.boardService.availableBoards$
      .pipe(this.autoUnsubscribe())
      .subscribe((boardBases) => {
        this.boardItems = boardBases.map((base) => {
          const shouldDisabled = base.name === this.currentBoardName;
          if (shouldDisabled)
            return {
              label: base.name,
              disabled: shouldDisabled,
            };
          else
            return {
              label: base.name,
              routerLink: this.getRouterLink(base.name),
            };
        });
      });
  }
  // FIXME Workaround to force reload a CardBoardComponent
  // It would be better to re-use CardBoardComponent
  private getRouterLink(boardName): string {
    return `${
      this.currentBoardName === Constants.Default_Program_Board_Name ? '' : `../`
    }../switcher/${boardName}`;
  }

  public toggleWitSidebar() {
    this.toggleSidebar.emit();
    this.sidenavOpened = !this.sidenavOpened;
  }
}
