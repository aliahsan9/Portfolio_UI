import { Component, OnInit } from '@angular/core';
// import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from "../about/about.component";
import { SkillsComponent } from '../skills/skills.component';
import { PublicProjectsComponent } from '../projects/projects.component';
import { BlogsComponent } from '../blogs/blogs/blogs.component';
import { NewsletterComponent } from '../newsletter/newsletter.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterModule, AboutComponent, SkillsComponent, PublicProjectsComponent, BlogsComponent, NewsletterComponent],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    // AOS.init({ duration: 10, once: true });
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
}
 