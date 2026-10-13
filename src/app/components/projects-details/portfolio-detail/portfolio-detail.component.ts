import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioDetailComponent {
  problems = [
    {
      number: '01',
      title: 'Technical work needs context',
      description:
        'A repository or project screenshot rarely explains the problem a developer solved, the decisions behind the implementation, or the skills involved.',
      outcome: 'Turn projects into meaningful engineering case studies.'
    },
    {
      number: '02',
      title: 'Skills need evidence',
      description:
        'Listing frameworks and programming languages does not show how they are used together to build and deliver an application.',
      outcome: 'Connect technical skills to real project work.'
    },
    {
      number: '03',
      title: 'Visitors need a clear journey',
      description:
        'Recruiters, developers, and potential collaborators need to find projects, understand their purpose, inspect the code, and get in touch without unnecessary friction.',
      outcome: 'Make discovery and contact straightforward.'
    },
    {
      number: '04',
      title: 'Presentation must work everywhere',
      description:
        'A portfolio that looks polished on a desktop but breaks on a phone, loads slowly, or is difficult to navigate undermines the work it presents.',
      outcome: 'Balance visual quality with usability and performance.'
    }
  ];

  engineeringDecisions = [
    {
      number: '01',
      category: 'APPLICATION STRUCTURE',
      title: 'Use Angular standalone components',
      description:
        'Organize pages and interface sections into focused components instead of maintaining one large, tightly coupled template.',
      benefit:
        'Creates clearer component boundaries and makes individual sections easier to update.',
      technologies: ['Angular', 'TypeScript']
    },
    {
      number: '02',
      category: 'STYLING SYSTEM',
      title: 'Combine SCSS with Bootstrap',
      description:
        'Use Bootstrap for responsive layout primitives and SCSS for project-specific styling, reusable patterns, spacing, and visual consistency.',
      benefit:
        'Keeps layout behavior predictable while allowing the interface to maintain its own visual identity.',
      technologies: ['SCSS', 'Bootstrap', 'CSS']
    },
    {
      number: '03',
      category: 'RESPONSIVE DESIGN',
      title: 'Adapt the experience to different screens',
      description:
        'Design layouts and component behavior around desktop, tablet, and mobile viewports rather than simply shrinking a desktop page.',
      benefit:
        'Helps keep project details, navigation, and calls to action usable on different devices.',
      technologies: ['Responsive Layouts', 'Media Queries']
    },
    {
      number: '04',
      category: 'PERFORMANCE',
      title: 'Treat assets and rendering as engineering concerns',
      description:
        'Use appropriately optimized images, avoid unnecessary visual effects, and review the rendered experience across screen sizes.',
      benefit:
        'Reduces avoidable frontend overhead and supports a smoother browsing experience.',
      technologies: ['AVIF', 'Angular', 'Browser DevTools']
    },
    {
      number: '05',
      category: 'DISCOVERABILITY',
      title: 'Make project content accessible to visitors',
      description:
        'Structure project information with meaningful headings, descriptive links, and page metadata so visitors and search engines can better understand the site.',
      benefit:
        'Makes the portfolio easier to navigate, interpret, and discover.',
      technologies: ['Semantic HTML', 'SEO', 'Sitemap']
    },
    {
      number: '06',
      category: 'DELIVERY',
      title: 'Publish a live, accessible portfolio',
      description:
        'Maintain the frontend in GitHub and deploy the website through Vercel so visitors can explore the work without setting up the project locally.',
      benefit:
        'Connects development work to a publicly accessible, maintainable website.',
      technologies: ['Git', 'GitHub', 'Vercel']
    }
  ];

  visitorJourney = [
    {
      number: '01',
      icon: 'bi bi-person',
      title: 'Discover',
      description:
        'Visitors quickly understand the developer’s focus, background, and areas of expertise.'
    },
    {
      number: '02',
      icon: 'bi bi-folder2-open',
      title: 'Explore',
      description:
        'Project pages explain the purpose, implementation, technologies, and practical challenges behind each build.'
    },
    {
      number: '03',
      icon: 'bi bi-code-slash',
      title: 'Verify',
      description:
        'GitHub repositories and live demonstrations provide a path to inspect the work beyond the description.'
    },
    {
      number: '04',
      icon: 'bi bi-envelope',
      title: 'Connect',
      description:
        'Clear contact options help interested visitors take the next step.'
    }
  ];

  requestFlow = [
    {
      number: '01',
      title: 'User opens a page',
      description:
        'The browser requests the deployed portfolio and its required resources.'
    },
    {
      number: '02',
      title: 'Angular renders the interface',
      description:
        'Components and templates organize the page content and interactive elements.'
    },
    {
      number: '03',
      title: 'Styles and assets shape the experience',
      description:
        'SCSS, responsive layout rules, fonts, and optimized images contribute to the rendered page.'
    },
    {
      number: '04',
      title: 'The visitor takes action',
      description:
        'Navigation links, repository links, live demos, and contact functionality connect visitors to the relevant destination.'
    }
  ];

  screenshots = [
    {
      src: 'assets/projects/portfolio1.avif',
      alt: 'Portfolio homepage and introduction section',
      label: 'Homepage and positioning',
      description:
        'Introduces the developer and directs visitors toward relevant work.'
    },
    {
      src: 'assets/projects/portfolio2.avif',
      alt: 'Portfolio project showcase section',
      label: 'Project presentation',
      description:
        'Makes technical projects easier to discover and evaluate.'
    },
    {
      src: 'assets/projects/portfolio3.avif',
      alt: 'Portfolio additional page or interface section',
      label: 'Supporting sections',
      description:
        'Provides additional context and navigation throughout the site.'
    }
  ];

  technologyGroups = [
    {
      category: 'Frontend',
      description: 'Interface development and component structure',
      items: ['Angular', 'TypeScript', 'HTML5', 'Bootstrap']
    },
    {
      category: 'Styling and experience',
      description: 'Responsive layouts and custom presentation',
      items: ['SCSS', 'CSS', 'Responsive Design', 'AVIF Images']
    },
    {
      category: 'Delivery',
      description: 'Source control and public deployment',
      items: ['Git', 'GitHub', 'Vercel']
    },
    {
      category: 'Discoverability and quality',
      description: 'Visibility and frontend evaluation',
      items: ['SEO', 'Sitemap', 'Search Console', 'PageSpeed Insights']
    }
  ];

  projectFacts = [
    { label: 'Project type', value: 'Personal Developer Portfolio' },
    { label: 'Frontend', value: 'Angular' },
    { label: 'Styling', value: 'SCSS + Bootstrap' },
    { label: 'Source control', value: 'GitHub' },
    { label: 'Deployment', value: 'Vercel' }
  ];

  get liveUrl(): string {
    return 'https://aliahsan.tech';
  }

  get repositoryUrl(): string {
    return 'https://github.com/aliahsan9/Portfolio_UI';
  }
}