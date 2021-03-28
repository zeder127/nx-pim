import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SortablejsModule } from 'ngx-sortablejs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { UtilModule } from '../util/util.module';
import { CardBoardToolbarComponent } from './components/card-board-toolbar/card-board-toolbar.component';
import { CardBoardComponent } from './components/card-board/card-board.component';
import { CardContainerComponent } from './components/card-container/card-container.component';
import { CardComponent } from './components/card/card.component';
import { ColumnHeaderComponent } from './components/column-header/column-header.component';
import { HeaderEditorComponent } from './components/header-editor/header-editor.component';
import { NewItemEditorComponent } from './components/new-item-editor/new-item-editor.component';
import { RowHeaderComponent } from './components/row-header/row-header.component';
import { SourcesListComponent } from './components/sources-list/sources-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatSidenavModule,
    MatCardModule,
    DragDropModule,
    CardModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    SortablejsModule,
    ButtonModule,
    MenuModule,
    ToolbarModule,
    DynamicDialogModule,
    AutoCompleteModule,
    InputTextareaModule,
    PanelModule,
    UtilModule,
    SlideMenuModule,
  ],
  declarations: [
    CardBoardComponent,
    CardContainerComponent,
    CardComponent,
    SourcesListComponent,
    RowHeaderComponent,
    ColumnHeaderComponent,
    CardBoardToolbarComponent,
    HeaderEditorComponent,
    NewItemEditorComponent,
  ],
  exports: [CardBoardComponent, TableModule],
})
export class CardBoardModule {}
