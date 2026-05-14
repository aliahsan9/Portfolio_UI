import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {

  skills = [
    {
      title: 'Frontend Development',
      level: 'Advanced',
      percent: 92,
      icon: 'assets/icons/angular.avif',
      description: 'Building responsive and scalable UIs with Angular, TypeScript and Bootstrap.',
      technologies: ['Angular', 'TypeScript', 'SCSS', 'Bootstrap']
    },
    {
      title: 'Backend Development',
      level: 'Advanced',
      percent: 88,
      icon: 'assets/icons/dotnet.avif',
      description: 'Developing secure APIs using .NET Core with clean architecture principles.',
      technologies: ['.NET Core', 'C#', 'EF Core', 'REST APIs']
    },
    {
      title: 'Database Design',
      level: 'Advanced',
      percent: 86,
      icon: 'assets/icons/sql.avif',
      description: 'Designing optimized SQL Server schemas and improving query performance.',
      technologies: ['SQL Server', 'Indexing', 'Stored Procedures']
    },
    {
      title: 'Cloud & Deployment',
      level: 'Growing',
      percent: 80,
      icon: 'assets/icons/github.avif',
      description: 'Working with GitHub Actions and deploying apps to cloud environments.',
      technologies: ['Azure', 'CI/CD', 'GitHub Actions']
    },
    {
      title: 'Problem Solving',
      level: 'Strong',
      percent: 90,
      icon: 'assets/icons/leetcode.avif',
      description: 'Strong fundamentals in algorithms, data structures and optimization.',
      technologies: ['C++', 'C#', 'DSA']
    },
    {
      title: 'Team & Workflow',
      level: 'Professional',
      percent: 94,
      icon: 'assets/Images/leadership.avif',
      description: 'Experience working with structured workflows and collaboration.',
      technologies: ['Agile', 'Git', 'Team Work']
    }
  ];
}