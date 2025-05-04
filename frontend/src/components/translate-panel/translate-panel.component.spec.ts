import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatePanelComponent } from './translate-panel.component';

describe('TranslatePanelComponent', () => {
  let component: TranslatePanelComponent;
  let fixture: ComponentFixture<TranslatePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslatePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslatePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
