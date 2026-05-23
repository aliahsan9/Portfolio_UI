import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AboutComponent } from '../about/about.component';
import { SkillsComponent } from '../skills/skills.component';
import { PublicProjectsComponent } from '../projects/projects.component';
import { ServicesComponent } from '../services/services.component';
import { TestimonialComponent } from '../testimonial/testimonial.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ServicesComponent,
    AboutComponent,
    SkillsComponent,
    PublicProjectsComponent,
    TestimonialComponent,
    ContactComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  readonly skills: readonly string[] = [
    'assets/icons/angular.avif',
    'assets/icons/dotnet.avif',
    'assets/icons/sql.avif',
    'assets/icons/leetcode.avif',
    'assets/icons/github.avif',
    'assets/icons/azure.avif',
    'assets/icons/html.avif',
    'assets/icons/css.avif',
    'assets/icons/bootstrap.avif',
    'assets/icons/tailwind.avif',
    'assets/icons/js.avif',
    'assets/icons/ts.avif',
    'assets/icons/figma.avif',
  ];

  readonly duplicatedSkills = [
    ...this.skills,
    ...this.skills
  ];

  trackBySkill(index: number, item: string): string {
    return item;
  }
}