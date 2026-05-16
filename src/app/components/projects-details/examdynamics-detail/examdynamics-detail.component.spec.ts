import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamdynamicsDetailComponent } from './examdynamics-detail.component';

describe('ExamdynamicsDetailComponent', () => {
  let component: ExamdynamicsDetailComponent;
  let fixture: ComponentFixture<ExamdynamicsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamdynamicsDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamdynamicsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
