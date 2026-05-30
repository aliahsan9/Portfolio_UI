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
      title: 'Frontend Engineering (Angular)',
      level: 'Advanced',
      percent: 92,
      icon: 'assets/icons/angular.avif',
      description:
        'Building scalable SPAs using Angular, TypeScript, RxJS and component-driven architecture with performance optimization and reusable design systems.',

      workflow:
        'Workflows managed using Jira Scrum boards with sprint-based delivery, task breakdown, and GitHub-linked commits.',

      technologies: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Bootstrap']
    },

    {
      title: 'Backend Architecture (.NET Core)',
      level: 'Advanced',
      percent: 88,
      icon: 'assets/icons/dotnet.avif',
      description:
        'Designing RESTful APIs using .NET Core with clean architecture, dependency injection, authentication layers, and scalable service structure.',

      workflow:
        'Features tracked in Jira as Epics → Stories → Tasks, with API development aligned to sprint planning and review cycles.',

      technologies: ['.NET Core', 'C#', 'EF Core', 'REST APIs']
    },

    {
      title: 'Database Design & Optimization',
      level: 'Advanced',
      percent: 86,
      icon: 'assets/icons/sql.avif',
      description:
        'Designing normalized SQL Server databases with indexing strategies, stored procedures, and performance tuning for large datasets.',

      workflow:
        'Database tasks managed as Jira subtasks linked to backend stories for full traceability across development lifecycle.',

      technologies: ['SQL Server', 'Indexing', 'Stored Procedures']
    },

    {
      title: 'Cloud & DevOps Practices',
      level: 'Growing',
      percent: 80,
      icon: 'assets/icons/github.avif',
      description:
        'Working with GitHub Actions for CI/CD pipelines, automated deployments, and cloud hosting practices for modern applications.',

      workflow:
        'Commits are linked to Jira issues (PF-12 style) ensuring full traceability from development to deployment.',

      technologies: ['Azure', 'CI/CD', 'GitHub Actions', 'Docker']
    },

    {
      title: 'Problem Solving & DSA',
      level: 'Strong',
      percent: 90,
      icon: 'assets/icons/leetcode.avif',
      description:
        'Strong understanding of data structures, algorithms, and optimization techniques for efficient backend and frontend solutions.',

      workflow:
        'Applied in real Jira tasks involving performance optimization and system-level improvements.',

      technologies: ['C#', 'C++', 'DSA']
    },

    {
      title: 'Agile, Jira & Team Workflow',
      level: 'Professional',
      percent: 94,
      icon: 'assets/Images/leadership.avif',
      description:
        'Practical Agile experience with Jira, Scrum boards, sprint planning, story estimation, and backlog grooming.',

      workflow:
        'Projects are managed like production systems using Epics, Stories, Sprints, and GitHub-integrated development cycles.',

      technologies: ['Jira', 'Agile', 'Scrum', 'Git', 'Team Collaboration']
    }
  ];
}