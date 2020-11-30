import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';

import { PlanningBoardRoutingModule } from './planning-board-routing.module';
import { SyncBoardComponent } from './sync-board/sync-board.component';
import { TeamBoardComponent } from './team-board/team-board.component';

@NgModule({
  declarations: [SyncBoardComponent, TeamBoardComponent],
  imports: [
    CommonModule,
    PlanningBoardRoutingModule,
    TableModule
  ]
})
export class PlanningBoardModule { }
