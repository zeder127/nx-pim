import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardBoardComponent } from './components/card-board/card-board.component';
import { CardContainerComponent } from './components/card-container/card-container.component';
import { CardComponent } from './components/card/card.component';
import { SourcesListComponent } from './components/sources-list/sources-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSidenavModule,
    TableModule,
    DropdownModule,
  ],
  declarations: [
    CardBoardComponent,
    CardContainerComponent,
    CardComponent,
    SourcesListComponent,
  ],
  exports: [CardBoardComponent, TableModule],
})
export class CardBoardModule {}
