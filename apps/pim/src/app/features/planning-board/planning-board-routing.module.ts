import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SyncBoardComponent } from './sync-board/sync-board.component';
import { TeamBoardComponent } from './team-board/team-board.component';

const routes: Routes = [
  {
    path: 'sync',
    component: SyncBoardComponent,
  },
  {
    path: 'team/:teamName',
    component: TeamBoardComponent,
  },
  {
    path: '**',
    redirectTo: 'team/1',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningBoardRoutingModule { }
