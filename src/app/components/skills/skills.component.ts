import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  skills = [
    {
      title: 'Frontend Development',
      percent: 92,
      color: 'bg-info',
      desc: 'Angular • TypeScript • SCSS • Bootstrap • Tailwind',
      icon: 'assets/Images/angular.png',
      delay: 100
    },
    {
      title: 'Backend Development',
      percent: 87,
      color: 'bg-success',
      desc: '.NET 8 • C# • SQL Server • REST APIs • JWT',
      icon: 'assets/Images/dotnet.png',
      delay: 200 
    },
    {
      title: 'Programming & DSA',
      percent: 90,
      color: 'bg-warning',
      desc: 'C++ • C# • TypeScript • Algorithm Design',
      icon: 'assets/Images/leetcode.png',
      delay: 300
    },
    {
      title: 'Dev Tools',
      percent: 82,
      color: 'bg-danger',
      desc: 'Git • GitHub • Postman • Azure • Vercel',
      icon: 'assets/Images/github.png',
      delay: 400
    },
    {
      title: 'Team & Communication',
      percent: 95,
      color: 'bg-primary',
      desc: 'Agile • Leadership • Collaboration',
      icon: 'assets/Images/leadership.png',
      delay: 500
    },
    {
      title: 'UI/UX Design',
      percent: 78,
      color: 'bg-pink',
      desc: 'Figma • Wireframing • Prototyping',
      icon: 'assets/Images/figma.png',
      delay: 600
    }
  ];
}
