import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminResumeComponent } from './manage-resume.component';



describe('ManageResumeComponent', () => {
  let component: AdminResumeComponent;
  let fixture: ComponentFixture<AdminResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
