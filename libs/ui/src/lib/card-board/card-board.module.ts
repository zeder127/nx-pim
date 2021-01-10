import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CardBoardComponent } from './components/card-board/card-board.component';
import { CardContainerComponent } from './components/card-container/card-container.component';
import { CardComponent } from './components/card/card.component';
import { SourcesListComponent } from './components/sources-list/sources-list.component';
import { RowHeaderComponent } from './components/row-header/row-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSidenavModule,
    TableModule,
    DropdownModule,
    InputTextModule,
  ],
  declarations: [
    CardBoardComponent,
    CardContainerComponent,
    CardComponent,
    SourcesListComponent,
    RowHeaderComponent,
  ],
  exports: [CardBoardComponent, TableModule],
})
export class CardBoardModule {}
