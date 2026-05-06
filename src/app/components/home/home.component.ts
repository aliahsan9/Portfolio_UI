import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AboutComponent } from "../about/about.component";
import { SkillsComponent } from "../skills/skills.component";
import { PublicProjectsComponent } from "../projects/projects.component";
import { ContactComponent } from "../contact/contact.component";
import { NewsletterComponent } from "../newsletter/newsletter.component";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterModule, AboutComponent, SkillsComponent, PublicProjectsComponent, ContactComponent, NewsletterComponent],
})
export class HomeComponent implements OnInit {
  ngOnInit(): void {
    AOS.init({ duration: 900, once: true });
    this.skills = [...this.skills, ...this.skills];
  }
    skills: string[] = [
    'assets/Images/angular.png',
    'assets/Images/dotnet.png',
    'assets/Images/sql.png',
    'assets/Images/leetcode.png',
    'assets/Images/github.png',
    'assets/Images/azure.png',
    'assets/Images/html.png',
    'assets/Images/css.png',
    'assets/Images/bootstrap.png',
    'assets/Images/tailwind.png',
    'assets/Images/js.png',
    'assets/Images/ts.png',
    'assets/Images/figma.png',
  ];
}
