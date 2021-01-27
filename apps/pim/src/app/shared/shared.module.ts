import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    MultiSelectModule,
    ButtonModule,
  ],
  exports: [FormsModule, InputTextModule, ListboxModule, MultiSelectModule, ButtonModule],
})
export class SharedModule {}
