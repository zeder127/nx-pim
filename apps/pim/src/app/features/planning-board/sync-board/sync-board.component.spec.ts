import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncBoardComponent } from './sync-board.component';

describe('SyncBoardComponent', () => {
  let component: SyncBoardComponent;
  let fixture: ComponentFixture<SyncBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyncBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
