
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-businessos-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './erp-detail.component.html',
  styleUrls: ['./erp-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpDetail {

  businessProblems = [
    {
      number: '01',
      title: 'Fragmented business records',
      description:
        'Inventory, customers, orders, and financial information can end up scattered across spreadsheets and separate applications.',
      impact: 'Centralize operational data'
    },
    {
      number: '02',
      title: 'Limited operational visibility',
      description:
        'Without a consolidated view of business activity, understanding stock levels, sales performance, and outstanding work takes more effort.',
      impact: 'Make business activity easier to understand'
    },
    {
      number: '03',
      title: 'Growing technical complexity',
      description:
        'As workflows expand, tightly coupled features and duplicated business rules make changes harder to maintain safely.',
      impact: 'Build on a maintainable foundation'
    },
    {
      number: '04',
      title: 'Business data access',
      description:
        'A shared platform needs to ensure that authenticated users can perform permitted operations without crossing tenant boundaries.',
      impact: 'Design for controlled access'
    }
  ];

  workflowSteps = [
    {
      icon: 'bi bi-box-seam',
      title: 'Manage inventory',
      description:
        'Maintain product records, pricing, stock levels, and reorder thresholds.'
    },
    {
      icon: 'bi bi-cart-check',
      title: 'Process sales',
      description:
        'Manage customer orders, line items, quantities, and order totals.'
    },
    {
      icon: 'bi bi-people',
      title: 'Maintain customers',
      description:
        'Keep customer information available alongside the operational workflows that use it.'
    },
    {
      icon: 'bi bi-graph-up-arrow',
      title: 'Understand performance',
      description:
        'Bring business indicators and operational information into dashboard and reporting experiences.'
    }
  ];

  engineeringDecisions = [
    {
      category: 'APPLICATION ARCHITECTURE',
      title: 'Separate business logic from infrastructure',
      description:
        'Organize the backend into Domain, Application, Infrastructure, and API responsibilities instead of putting every concern into controllers.',
      benefit:
        'Makes business rules easier to understand, test, and extend.',
      technologies: [
        'ASP.NET Core',
        'Clean Architecture',
        'Dependency Injection'
      ]
    },
    {
      category: 'MULTI-TENANT DATA',
      title: 'Treat tenant ownership as a core concern',
      description:
        'Associate business records with tenant identity and enforce tenant-aware access throughout relevant request and data-access paths.',
      benefit:
        'Helps prevent one business from accessing another business’s records.',
      technologies: [
        'Tenant Context',
        'EF Core',
        'SQL Server'
      ]
    },
    {
      category: 'API DESIGN',
      title: 'Keep request handling explicit and predictable',
      description:
        'Use API endpoints, application handlers, request validation, and persistence responsibilities to keep HTTP concerns separate from business operations.',
      benefit:
        'Makes changes easier to trace and individual responsibilities easier to test.',
      technologies: [
        'REST APIs',
        'FluentValidation',
        'MediatR'
      ]
    },
    {
      category: 'DATA PERSISTENCE',
      title: 'Model business relationships in a relational database',
      description:
        'Use Entity Framework Core with SQL Server to persist products, customers, orders, and related business entities.',
      benefit:
        'Provides structured relationships and a consistent foundation for business records.',
      technologies: [
        'Entity Framework Core',
        'SQL Server',
        'Migrations'
      ]
    },
    {
      category: 'APPLICATION SECURITY',
      title: 'Protect authenticated operations',
      description:
        'Use JWT-based authentication and authorization policies to protect API operations, with tenant-aware access checks for business data.',
      benefit:
        'Authentication establishes identity; authorization and tenant checks govern what that identity can access.',
      technologies: [
        'JWT',
        'ASP.NET Core Identity',
        'Authorization'
      ]
    },
    {
      category: 'OBSERVABILITY & QUALITY',
      title: 'Make failures diagnosable and behavior testable',
      description:
        'Use structured logging and automated unit and integration tests to investigate failures and verify important application behavior.',
      benefit:
        'Improves debugging confidence and helps catch regressions as the system changes.',
      technologies: [
        'Serilog',
        'xUnit',
        'Integration Testing'
      ]
    }
  ];

  architectureLayers = [
    {
      icon: 'bi bi-globe2',
      title: 'API / Presentation',
      label: 'HTTP',
      description:
        'Endpoints, request handling, authentication, middleware, and API responses.'
    },
    {
      icon: 'bi bi-diagram-3',
      title: 'Application',
      label: 'USE CASES',
      description:
        'Application handlers, validation, orchestration, and business workflows.'
    },
    {
      icon: 'bi bi-boxes',
      title: 'Domain',
      label: 'BUSINESS RULES',
      description:
        'Core business entities and domain rules that should not depend on infrastructure.'
    },
    {
      icon: 'bi bi-database',
      title: 'Infrastructure',
      label: 'PERSISTENCE',
      description:
        'EF Core, SQL Server integration, and concrete implementations of infrastructure contracts.'
    }
  ];

  securityPractices = [
    {
      icon: 'bi bi-person-lock',
      title: 'Authentication',
      description:
        'JWT-based authentication establishes the identity associated with protected API requests.'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Authorization',
      description:
        'Access policies and role-aware checks help restrict protected operations to permitted users.'
    },
    {
      icon: 'bi bi-buildings',
      title: 'Tenant isolation',
      description:
        'Tenant context and tenant-aware data access help keep business records within the correct tenant boundary.'
    },
    {
      icon: 'bi bi-check2-circle',
      title: 'Input validation',
      description:
        'Request validation helps reject invalid input before it reaches the relevant business operation.'
    },
    {
      icon: 'bi bi-journal-code',
      title: 'Structured logging',
      description:
        'Structured application logs help trace requests, diagnose errors, and investigate unexpected behavior.'
    },
    {
      icon: 'bi bi-clipboard2-check',
      title: 'Automated testing',
      description:
        'Unit and integration tests help verify business rules, API behavior, and important security expectations.'
    }
  ];

  screenshots = [
    {
      src: 'assets/projects/erp1.avif',
      alt: 'BusinessOS dashboard and business overview',
      label: 'Business overview'
    },
    {
      src: 'assets/projects/erp2.avif',
      alt: 'BusinessOS operational management interface',
      label: 'Operational workflows'
    },
    {
      src: 'assets/projects/erp3.avif',
      alt: 'BusinessOS business data and reporting interface',
      label: 'Business insights'
    }
  ];

  aiCapabilities = [
    {
      icon: 'bi bi-chat-square-text',
      title: 'Conversational interaction',
      description:
        'Explore natural-language interaction with business information and workflows.'
    },
    {
      icon: 'bi bi-database-check',
      title: 'Business-aware context',
      description:
        'Ground relevant AI experiences in business context instead of relying only on generic responses.'
    },
    {
      icon: 'bi bi-shield-lock',
      title: 'Controlled execution',
      description:
        'AI-assisted actions must respect application permissions, tenant boundaries, and backend business rules.'
    }
  ];

  technologyGroups = [
    {
      category: 'Frontend',
      items: [
        'Angular 19',
        'TypeScript',
        'Bootstrap',
        'SCSS',
        'Chart.js'
      ]
    },
    {
      category: 'Backend',
      items: [
        'ASP.NET Core',
        '.NET 10',
        'C#',
        'REST APIs',
        'MediatR',
        'FluentValidation'
      ]
    },
    {
      category: 'Data & Security',
      items: [
        'SQL Server',
        'Entity Framework Core',
        'ASP.NET Core Identity',
        'JWT Authentication'
      ]
    },
    {
      category: 'Engineering & AI',
      items: [
        'Clean Architecture',
        'Serilog',
        'xUnit',
        'Integration Testing',
        'Qdrant',
        'Retrieval-Augmented Generation (RAG)'
      ]
    }
  ];
}
