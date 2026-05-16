import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolManagementDetailComponent } from './school-management-detail.component';

describe('SchoolManagementDetailComponent', () => {
  let component: SchoolManagementDetailComponent;
  let fixture: ComponentFixture<SchoolManagementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolManagementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolManagementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
