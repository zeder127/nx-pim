import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardSwitcherComponent } from './board-switcher.component';

describe('BoardSwitcherComponent', () => {
  let component: BoardSwitcherComponent;
  let fixture: ComponentFixture<BoardSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardSwitcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
