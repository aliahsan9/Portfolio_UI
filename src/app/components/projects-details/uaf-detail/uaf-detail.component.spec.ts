import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UafDetailComponent } from './uaf-detail.component';

describe('UafDetailComponent', () => {
  let component: UafDetailComponent;
  let fixture: ComponentFixture<UafDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UafDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UafDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
