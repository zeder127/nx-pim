import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SyncBoardComponent } from './sync-board/sync-board.component';
import { TeamBoardComponent } from './team-board/team-board.component';

const routes: Routes = [
  {
    path: ':piName/programm-board',
    component: SyncBoardComponent,
  },
  {
    path: ':piName/:teamName',
    component: TeamBoardComponent,
  },
  {
    path: '**',
    redirectTo: 'team/1', // FIXME
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanningBoardRoutingModule {}
