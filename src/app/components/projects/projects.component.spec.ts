import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicProjectsComponent } from './projects.component';


describe('ProjectsComponent', () => {
  let component: PublicProjectsComponent;
  let fixture: ComponentFixture<PublicProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
