import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsComponent } from './skills.component';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('leads with applied AI, RAG, LLM integration, and agents', () => {
    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.focus-card h2') as NodeListOf<HTMLElement>
    ).map((heading) => heading.textContent?.trim());

    expect(titles).toEqual([
      'Applied AI',
      'LLM integration',
      'Custom RAG',
      'Agents'
    ]);
    expect(fixture.nativeElement.textContent).toContain('Microsoft Agent Framework');
  });
});
