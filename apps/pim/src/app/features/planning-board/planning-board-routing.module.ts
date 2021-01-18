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
    path: ':piName/team-board/:teamName',
    component: TeamBoardComponent,
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
