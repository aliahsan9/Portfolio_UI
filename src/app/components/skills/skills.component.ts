import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FocusArea {
  index: string;
  kicker: string;
  title: string;
  icon: string;
  description: string;
  outcome: string;
  technologies: string[];
}

interface Skill {
  title: string;
  level: string;
  percent: number;
  icon: string;
  description: string;
  workflow: string;
  technologies: string[];
}

interface ProofLink {
  label: string;
  detail: string;
  route: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  readonly focusAreas: FocusArea[] = [
    {
      index: '01',
      kicker: 'Practice',
      title: 'Applied AI',
      icon: 'bi-stars',
      description:
        'Models sit inside the product. BusinessOS answers from business data. ProdFalcon reads a codebase and explains the risk. The useful part is the behavior a user can act on.',
      outcome: 'AI as a step in the workflow, not a demo beside it.',
      technologies: ['Applied AI', 'Product integration', 'Evaluation']
    },
    {
      index: '02',
      kicker: 'Integration',
      title: 'LLM integration',
      icon: 'bi-chat-square-text',
      description:
        'ASP.NET Core calls the model with a contract the API can check: the prompt, the tools it may use, and a structured result. Angular only renders what that contract accepts.',
      outcome: 'The application decides what gets saved or shown.',
      technologies: ['LLM APIs', 'Structured output', 'Tool calling', 'C#']
    },
    {
      index: '03',
      kicker: 'Retrieval',
      title: 'Custom RAG',
      icon: 'bi-database-check',
      description:
        'I build the retrieval path. Source text is chunked, embedded, and stored in Qdrant. The question pulls the relevant passages, and those passages go to the model with the prompt.',
      outcome: 'Answers stay tied to the system’s own data.',
      technologies: ['RAG', 'Embeddings', 'Qdrant', 'Chunking', 'Grounding']
    },
    {
      index: '04',
      kicker: 'Microsoft Agent Framework',
      title: 'Agents',
      icon: 'bi-robot',
      description:
        'An agent is a loop the runtime can stop. I define the tools it may call. The Microsoft Agent Framework runs the steps, the tool calls, and the stop conditions.',
      outcome: 'Multi-step work, with application code owning the tools.',
      technologies: ['Agents', 'Tool use', 'Runtime control', 'Multi-step workflows']
    }
  ];

  readonly practices = [
    'Embeddings',
    'Vector search',
    'Prompt design',
    'Structured output',
    'Tool calling',
    'Grounding',
    'Permission-aware actions',
    'Evaluation'
  ];

  readonly proof: ProofLink[] = [
    {
      label: 'BusinessOS',
      detail: 'Custom RAG over business data',
      route: '/erp-detail'
    },
    {
      label: 'ProdFalcon',
      detail: 'LLM-assisted code review',
      route: '/prodfalcon-detail'
    },
    {
      label: 'Agent notes',
      detail: 'A C# runtime that owns the tools',
      route: '/blog/agentic-ai'
    }
  ];

  readonly skills: Skill[] = [
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
