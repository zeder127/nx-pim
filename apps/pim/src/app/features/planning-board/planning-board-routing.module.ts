import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SyncBoardComponent } from './sync-board/sync-board.component';

const routes: Routes = [
  {
    path: 'sync',
    component: SyncBoardComponent,
  },
  {
    path: '**',
    redirectTo: 'sync',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningBoardRoutingModule { }
