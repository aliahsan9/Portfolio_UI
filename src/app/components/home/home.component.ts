import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from '../about/about.component';
import { SkillsComponent } from '../skills/skills.component';
import { PublicProjectsComponent } from '../projects/projects.component';
import { ServicesComponent } from '../services/services.component';
import { TestimonialComponent } from '../testimonial/testimonial.component';
import { ContactComponent } from '../contact/contact.component';

interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface TechBadge {
  icon: string;
  label: string;
}

interface SkillLogo {
  src: string;
  name: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    ServicesComponent,
    AboutComponent,
    SkillsComponent,
    PublicProjectsComponent,
    TestimonialComponent,
    ContactComponent,
  ],
})
export class HomeComponent {
  readonly calendlyUrl =
    'https://calendly.com/aliahsan8751/free-discovery-call-web-software-projects';

  readonly skills: SkillLogo[] = [
    { src: 'assets/icons/angular.avif', name: 'Angular' },
    { src: 'assets/icons/dotnet.avif', name: '.NET' },
    { src: 'assets/icons/sql.avif', name: 'SQL Server' },
    { src: 'assets/icons/azure.avif', name: 'Azure' },
    { src: 'assets/icons/ts.avif', name: 'TypeScript' },
    { src: 'assets/icons/js.avif', name: 'JavaScript' },
    { src: 'assets/icons/html.avif', name: 'HTML' },
    { src: 'assets/icons/css.avif', name: 'CSS' },
    { src: 'assets/icons/bootstrap.avif', name: 'Bootstrap' },
    { src: 'assets/icons/tailwind.avif', name: 'Tailwind CSS' },
    { src: 'assets/icons/github.avif', name: 'GitHub' },
    { src: 'assets/icons/figma.avif', name: 'Figma' },
    { src: 'assets/icons/leetcode.avif', name: 'LeetCode' },
  ];

  readonly orbitBadges: TechBadge[] = [
    { icon: 'bi-braces', label: 'Angular' },
    { icon: 'bi-window-stack', label: '.NET Core' },
    { icon: 'bi-database', label: 'SQL Server' },
    { icon: 'bi-cloud', label: 'Azure' },
  ];

  readonly socialLinks: SocialLink[] = [
    { icon: 'bi-github', url: 'https://github.com/aliahsan9', label: 'GitHub' },
    {
      icon: 'bi-linkedin',
      url: 'https://www.linkedin.com/in/ali-ahsan-6895a9315',
      label: 'LinkedIn',
    },
    {
      icon: 'bi-envelope-fill',
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=aliahsan.dev1@gmail.com',
      label: 'Email Me',
    },
  ];
}
