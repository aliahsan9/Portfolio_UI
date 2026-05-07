import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from "../about/about.component";
import { SkillsComponent } from "../skills/skills.component";
import { PublicProjectsComponent } from "../projects/projects.component";
import { ContactComponent } from "../contact/contact.component";
import { NewsletterComponent } from "../newsletter/newsletter.component";
import { BlogsComponent } from "../blogs/blogs/blogs.component";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterModule, AboutComponent, SkillsComponent, PublicProjectsComponent, ContactComponent, NewsletterComponent, BlogsComponent],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    AOS.init({ duration: 400, once: true });
    this.skills = [...this.skills, ...this.skills];
  }
    skills: string[] = [
    'assets/icons/angular.png',
    'assets/icons/dotnet.png',
    'assets/icons/sql.png',
    'assets/icons/leetcode.png',
    'assets/icons/github.png',
    'assets/icons/azure.png',
    'assets/icons/html.png',
    'assets/icons/css.png',
    'assets/icons/bootstrap.png',
    'assets/icons/tailwind.png',
    'assets/icons/js.png',
    'assets/icons/ts.png',
    'assets/icons/figma.png',
  ];
}
 