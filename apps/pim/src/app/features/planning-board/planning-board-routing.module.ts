import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardSwitcherComponent } from '../../shared/components/board-switcher/board-switcher.component';
import { SyncBoardComponent } from './sync-board/sync-board.component';
import { TeamBoardComponent } from './team-board/team-board.component';

const routes: Routes = [
  {
    path: `:piName/board`,
    component: SyncBoardComponent,
  },
  {
    path: ':piName/board/:teamName',
    component: TeamBoardComponent,
  },
  {
    path: `:piName/board-switcher/:boardName`,
    component: BoardSwitcherComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard', // FIXME
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanningBoardRoutingModule {}
