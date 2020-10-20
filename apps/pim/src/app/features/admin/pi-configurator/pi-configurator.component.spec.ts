import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiConfiguratorComponent } from './pi-configurator.component';

describe('PiConfiguratorComponent', () => {
  let component: PiConfiguratorComponent;
  let fixture: ComponentFixture<PiConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PiConfiguratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PiConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
