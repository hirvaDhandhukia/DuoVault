import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModeComponent } from './translate-mode.component';

describe('TranslateModeComponent', () => {
  let component: TranslateModeComponent;
  let fixture: ComponentFixture<TranslateModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslateModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslateModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
