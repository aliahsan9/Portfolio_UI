import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from "../about/about.component";
import { SkillsComponent } from '../skills/skills.component';
import { PublicProjectsComponent } from '../projects/projects.component';
import { ServicesComponent } from '../services/services.component';
import { TestimonialComponent } from '../testimonial/testimonial.component';
import { ContactComponent } from "../contact/contact.component";

interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface TechBadge {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterModule, ServicesComponent, AboutComponent, SkillsComponent, PublicProjectsComponent, TestimonialComponent, ContactComponent],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    this.skills = [...this.skills, ...this.skills];
  }

  skills: string[] = [
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

  // Orbiting badges around the profile photo — reflects your core stack
  orbitBadges: TechBadge[] = [
    { icon: 'bi-braces', label: 'Angular' },
    { icon: 'bi-window-stack', label: '.NET Core' },
    { icon: 'bi-database', label: 'SQL Server' },
  ];

  // Update these hrefs to your real profiles
  socialLinks: SocialLink[] = [
    { icon: 'bi-github', url: 'https://github.com/', label: 'GitHub' },
    { icon: 'bi-linkedin', url: 'https://linkedin.com/', label: 'LinkedIn' },
    { icon: 'bi-envelope-fill', url: 'mailto:you@example.com', label: 'Email' },
  ];
}