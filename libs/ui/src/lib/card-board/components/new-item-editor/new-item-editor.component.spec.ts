import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemEditorComponent } from './new-item-editor.component';

describe('NewItemEditorComponent', () => {
  let component: NewItemEditorComponent;
  let fixture: ComponentFixture<NewItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewItemEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
