import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardBoardToolbarComponent } from './card-board-toolbar.component';

describe('CardBoardToolbarComponent', () => {
  let component: CardBoardToolbarComponent;
  let fixture: ComponentFixture<CardBoardToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardBoardToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardBoardToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
