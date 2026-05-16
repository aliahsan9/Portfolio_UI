import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdfalconDetailComponent } from './prodfalcon-detail.component';

describe('ProdfalconDetailComponent', () => {
  let component: ProdfalconDetailComponent;
  let fixture: ComponentFixture<ProdfalconDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdfalconDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdfalconDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
