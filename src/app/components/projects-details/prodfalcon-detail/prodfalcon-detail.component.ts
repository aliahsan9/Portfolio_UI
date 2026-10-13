import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prodfalcon-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prodfalcon-detail.component.html',
  styleUrls: ['./prodfalcon-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProdfalconDetailComponent {
  readonly repositoryUrl = 'https://github.com/aliahsan9/ProdFalcon';

  problems = [
    {
      number: '01',
      title: 'Code issues are easy to overlook',
      description:
        'Potential vulnerabilities and risky implementation patterns can remain hidden in a repository, especially when a developer has to inspect files manually.',
      outcome:
        'Help surface suspicious patterns for closer review.'
    },
    {
      number: '02',
      title: 'Manual reviews take effort',
      description:
        'Searching through a codebase for every known risk can be repetitive and makes it harder to maintain a consistent first-pass review.',
      outcome:
        'Automate initial checks against defined rules.'
    },
    {
      number: '03',
      title: 'A warning needs useful context',
      description:
        'A raw match or error message is not always enough to understand why something may be risky or what should be investigated next.',
      outcome:
        'Add AI-assisted explanations and suggestions.'
    },
    {
      number: '04',
      title: 'Findings need a usable interface',
      description:
        'Analysis output is difficult to act on when findings, scan information, and next steps are scattered across tools or presented without structure.',
      outcome:
        'Bring scan results into one review experience.'
    }
  ];

  scanWorkflow = [
    {
      number: '01',
      icon: 'bi bi-cloud-arrow-up',
      title: 'Provide a codebase',
      description:
        'Start with a supported repository source, such as an uploaded ZIP archive or a GitHub repository link.'
    },
    {
      number: '02',
      icon: 'bi bi-file-earmark-code',
      title: 'Inspect project files',
      description:
        'Process the available source files to identify content that can be evaluated by the configured analysis rules.'
    },
    {
      number: '03',
      icon: 'bi bi-shield-check',
      title: 'Run rule-based checks',
      description:
        'Use deterministic checks to flag patterns associated with issues such as potential SQL injection and exposed secrets.'
    },
    {
      number: '04',
      icon: 'bi bi-stars',
      title: 'Generate AI-assisted guidance',
      description:
        'Use AI to help explain selected findings and suggest possible improvements. These suggestions require developer review.'
    },
    {
      number: '05',
      icon: 'bi bi-clipboard-data',
      title: 'Review the results',
      description:
        'Present the scan output in a structured interface so developers can investigate findings and decide what to fix.'
    }
  ];

  engineeringDecisions = [
    {
      number: '01',
      category: 'DETECTION STRATEGY',
      title: 'Combine explicit rules with AI assistance',
      description:
        'Use rule-based checks to identify configured patterns, then use AI to provide additional explanations or remediation ideas where supported.',
      benefit:
        'Separates predictable detection logic from generated guidance instead of treating an AI response as proof of a vulnerability.',
      technologies: ['C#', '.NET 8', 'Rule-Based Checks', 'AI']
    },
    {
      number: '02',
      category: 'CODEBASE INGESTION',
      title: 'Support repository-based analysis',
      description:
        'Build the scanning workflow around supported source inputs, including uploaded ZIP files and GitHub repository links.',
      benefit:
        'Lets a developer submit an existing project for analysis without manually pasting every source file.',
      technologies: ['ZIP Uploads', 'GitHub', 'File Processing']
    },
    {
      number: '03',
      category: 'BACKEND DESIGN',
      title: 'Separate API responsibilities from the UI',
      description:
        'Use an ASP.NET Core Web API to handle requests and coordinate backend processing while Angular provides the user-facing experience.',
      benefit:
        'Keeps frontend presentation separate from server-side analysis and data handling.',
      technologies: ['ASP.NET Core Web API', 'REST APIs', 'Angular']
    },
    {
      number: '04',
      category: 'DATA PERSISTENCE',
      title: 'Work with structured relational data',
      description:
        'Use SQL Server and Entity Framework Core Code First for the application data represented by the backend data model.',
      benefit:
        'Provides a structured persistence approach that can evolve with the application schema.',
      technologies: ['SQL Server', 'Entity Framework Core', 'Code First']
    },
    {
      number: '05',
      category: 'APPLICATION SECURITY',
      title: 'Treat security scanning as a sensitive workflow',
      description:
        'Source code may contain credentials, proprietary logic, or other sensitive information. Input handling, access control, and the treatment of uploaded content are therefore important design concerns.',
      benefit:
        'Makes the handling of user-provided code a first-class engineering consideration rather than an afterthought.',
      technologies: ['Input Validation', 'Authentication', 'Secure File Handling']
    },
    {
      number: '06',
      category: 'USER EXPERIENCE',
      title: 'Make analysis output easier to review',
      description:
        'Use a structured Angular interface to organize scan information and help users understand what needs further investigation.',
      benefit:
        'Turns technical analysis into information developers can inspect and act on.',
      technologies: ['Angular', 'TypeScript', 'Bootstrap', 'SCSS']
    }
  ];

  analysisPrinciples = [
    {
      number: '01',
      title: 'A rule match is a signal',
      description:
        'A matching code pattern can indicate risk, but it does not automatically prove that an exploitable vulnerability exists.'
    },
    {
      number: '02',
      title: 'AI output is advisory',
      description:
        'Generated explanations and suggested fixes should be checked against the actual code, execution context, and project requirements.'
    },
    {
      number: '03',
      title: 'Developers make the final decision',
      description:
        'Findings are intended to support investigation and remediation, not replace testing, code review, or professional security assessment.'
    }
  ];

  screenshots = [
    {
      src: 'assets/projects/prodfalcon1.avif',
      alt: 'ProdFalcon application interface showing a project or scan view',
      label: 'Project and scan experience',
      description:
        'The interface used to access the application and its scanning workflow.'
    },
    {
      src: 'assets/projects/prodfalcon2.avif',
      alt: 'ProdFalcon application interface showing analysis information',
      label: 'Analysis interface',
      description:
        'A view of the application’s analysis-related information.'
    },
    {
      src: 'assets/projects/prodfalcon3.avif',
      alt: 'ProdFalcon application interface showing another application view',
      label: 'Application details',
      description:
        'An additional view of the product interface and its presentation.'
    }
  ];

  technologyGroups = [
    {
      category: 'Frontend',
      description: 'Application interface and user interaction',
      items: ['Angular', 'TypeScript', 'Bootstrap', 'SCSS']
    },
    {
      category: 'Backend',
      description: 'HTTP API and server-side application logic',
      items: ['C#', '.NET 8 Web API', 'REST APIs']
    },
    {
      category: 'Data layer',
      description: 'Relational persistence and object-relational mapping',
      items: ['SQL Server', 'Entity Framework Core', 'Code First']
    },
    {
      category: 'Analysis workflow',
      description: 'Source input, pattern checks, and assisted guidance',
      items: ['ZIP Processing', 'GitHub Sources', 'Rule-Based Analysis', 'AI Suggestions']
    },
    {
      category: 'Security and delivery',
      description: 'Application protection and development workflow',
      items: ['JWT Authentication', 'Git', 'GitHub', 'Vercel', 'Azure']
    }
  ];

  projectFacts = [
    { label: 'Project type', value: 'AI-Assisted Code Analysis' },
    { label: 'Frontend', value: 'Angular + TypeScript' },
    { label: 'Backend', value: '.NET 8 Web API' },
    { label: 'Database', value: 'SQL Server' },
    { label: 'Analysis approach', value: 'Rules + AI Assistance' }
  ];
}