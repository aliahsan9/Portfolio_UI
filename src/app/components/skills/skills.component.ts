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
      title: 'Frontend Engineering',
      level: 'Advanced',
      percent: 92,
      icon: 'assets/icons/angular.avif',
      technologies: [
        'Angular',
        'TypeScript',
        'SCSS',
        'Bootstrap',
        'Responsive UI',
        'Component Architecture'
      ],
      description:
        'Focused on building modern, scalable, and responsive interfaces with clean component structure, smooth user experience, and performance-oriented frontend development.'
    },

    {
      title: 'Backend & API Development',
      level: 'Advanced',
      percent: 88,
      icon: 'assets/icons/dotnet.avif',
      technologies: [
        '.NET 8',
        'C#',
        'Entity Framework',
        'REST APIs',
        'JWT Authentication',
        'SQL Server'
      ],
      description:
        'Building secure and maintainable backend systems with clean architecture principles, optimized database design, authentication workflows, and scalable APIs.'
    },

    {
      title: 'Cloud & DevOps',
      level: 'Growing Expertise',
      percent: 82,
      icon: 'assets/icons/github.avif',
      technologies: [
        'Microsoft Azure',
        'GitHub Actions',
        'CI/CD Pipelines',
        'Azure App Services',
        'Deployment Workflows',
        'Git'
      ],
      description:
        'Experience deploying applications using Azure cloud services and automating development workflows through CI/CD pipelines and version-controlled deployment strategies.'
    },

    {
      title: 'Database & Performance',
      level: 'Advanced',
      percent: 86,
      icon: 'assets/icons/sql.avif',
      technologies: [
        'SQL Server',
        'Query Optimization',
        'Stored Procedures',
        'Indexing',
        'Data Modeling',
        'Performance Tuning'
      ],
      description:
        'Strong understanding of relational database systems, query optimization, indexing strategies, and designing efficient data structures for scalable applications.'
    },

    {
      title: 'Problem Solving & DSA',
      level: 'Advanced',
      percent: 90,
      icon: 'assets/icons/leetcode.avif',
      technologies: [
        'C++',
        'C#',
        'Algorithms',
        'Data Structures',
        'Logical Thinking',
        'Optimization'
      ],
      description:
        'Consistent practice in data structures and algorithms with emphasis on optimization, analytical thinking, and writing efficient, maintainable solutions.'
    },

    {
      title: 'Collaboration & Workflow',
      level: 'Professional',
      percent: 94,
      icon: 'assets/Images/leadership.avif',
      technologies: [
        'Agile',
        'Team Collaboration',
        'Communication',
        'Documentation',
        'Project Planning',
        'Code Reviews'
      ],
      description:
        'Comfortable working in collaborative environments with strong communication, structured workflows, and focus on maintainable development practices.'
    }
  ];
}