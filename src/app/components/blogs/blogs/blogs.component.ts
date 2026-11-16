import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  description: string;
  image: string;
  topics: string[];
}

export interface SearchSuggestion {
  kind: 'topic' | 'post';
  label: string;
  hint: string;
  slug?: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: 'How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular',
    slug: 'jwt-authentication',
    date: '2026-11-16',
    description: 'What HS256 actually computes, where the refresh token lives, and why a second browser tab is the thing that logs everyone out.',
    image: 'assets/blogs/images/jwt.avif',
    topics: ['JWT', 'Authentication', 'ASP.NET Core', 'Angular', 'Refresh Tokens', 'HS256', 'Security']
  },
  {
    title: 'The Pages a SQL Server Query Actually Touches',
    slug: 'sql-performance',
    date: '2026-11-16',
    description: 'An 8 KiB page, a 200-step histogram, and the SQL EF Core sends. Why a seek can lose to a scan, and why a deep OFFSET rereads the leaves.',
    image: 'assets/blogs/images/sql-performance.avif',
    topics: ['SQL Server', 'Query Performance', 'EF Core', 'Indexing', 'Pagination', 'Histograms', 'OFFSET']
  },
  {
    title: 'The Dependency Rule in an ASP.NET Core Order Service',
    slug: 'clean-architecture',
    date: '2026-11-16',
    description: 'An order stores the price it was given. Domain does not reference EF Core. One SaveChanges commits the row and the outbox message together.',
    image: 'assets/blogs/images/clean-architecture.avif',
    topics: ['Clean Architecture', 'Dependency Rule', 'ASP.NET Core', 'Domain', 'EF Core', 'CQRS', 'MediatR', 'Outbox']
  },
  {
    title: 'Overengineering a School System',
    slug: 'over-engineering',
    date: '2026-11-16',
    description: 'The layers I put on a multi-tenant school app before it had the problems they solve, what those layers cost, and the ASP.NET Core shape I would ship instead.',
    image: 'assets/blogs/images/over-engineering.avif',
    topics: ['Overengineering', 'Architecture', 'ASP.NET Core', 'Multi-tenant', 'School System']
  },
  {
    title: 'Why the Next Token Is Rarely the Original One',
    slug: 'ai-uniqueness',
    date: '2026-11-16',
    description: 'Next-token probability, the preference-tuning tilt, and a C# check for whether the samples actually moved.',
    image: 'assets/blogs/images/ai-uniqueness.avif',
    topics: ['LLMs', 'AI', 'Next Token', 'Temperature', 'C#', 'Preference Tuning']
  },
  {
    title: 'An Agent Is a Loop the Runtime Can Stop',
    slug: 'agentic-ai',
    date: '2026-11-16',
    description: 'The textbook definition, why a 95% step fails a 20-step task, and the C# runtime that owns the tools.',
    image: 'assets/blogs/images/agentic-ai.avif',
    topics: ['Agentic AI', 'Agents', 'Tool Calling', 'C#', 'Runtime', 'ReAct']
  }
];

const featuredTopics = [
  'JWT',
  'SQL Server',
  'Clean Architecture',
  'EF Core',
  'ASP.NET Core',
  'Angular',
  'Agentic AI',
  'LLMs',
  'C#',
  'Security'
];

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly blogs = blogPosts;
  readonly featuredTopics = featuredTopics;

  searchQuery = '';
  panelOpen = false;
  activeIndex = -1;
  filteredBlogs: BlogPost[] = blogPosts;
  suggestions: SearchSuggestion[] = [];

  private tokens: string[] = [];

  @ViewChild('searchField') searchField?: ElementRef<HTMLElement>;

  constructor(private readonly router: Router) {
    this.refresh();
  }

  get activeDescendant(): string | null {
    return this.activeIndex >= 0 ? `blog-suggest-${this.activeIndex}` : null;
  }

  get resultLabel(): string {
    const count = this.filteredBlogs.length;
    const noun = count === 1 ? 'post' : 'posts';
    const query = this.searchQuery.trim();
    return query ? `${count} ${noun} for “${query}”` : `${this.blogs.length} posts`;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
    this.activeIndex = -1;
    this.panelOpen = true;
    this.refresh();
  }

  onFocus(): void {
    this.panelOpen = true;
    this.refresh();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.panelOpen = true;
      this.refresh();
      this.moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.panelOpen = true;
      this.refresh();
      this.moveActive(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const suggestion = this.suggestions[this.activeIndex];
      if (suggestion) {
        this.selectSuggestion(suggestion);
      } else {
        this.panelOpen = false;
      }
      return;
    }

    if (event.key === 'Escape') {
      this.panelOpen = false;
      this.activeIndex = -1;
    }
  }

  applyTopic(topic: string): void {
    const same = this.searchQuery.trim().toLowerCase() === topic.toLowerCase();
    this.searchQuery = same ? '' : topic;
    this.activeIndex = -1;
    this.panelOpen = false;
    this.refresh();
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    if (suggestion.kind === 'topic') {
      this.searchQuery = suggestion.label;
      this.activeIndex = -1;
      this.panelOpen = false;
      this.refresh();
      this.searchInput?.nativeElement.focus();
      return;
    }

    if (suggestion.slug) {
      this.panelOpen = false;
      void this.router.navigate(['/blog', suggestion.slug]);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.activeIndex = -1;
    this.panelOpen = false;
    this.refresh();
    this.searchInput?.nativeElement.focus();
  }

  isTopicActive(topic: string): boolean {
    return this.searchQuery.trim().toLowerCase() === topic.toLowerCase();
  }

  trackBlog(_index: number, blog: BlogPost): string {
    return blog.slug;
  }

  showGroupLabel(index: number): boolean {
    const current = this.suggestions[index];
    if (!current) {
      return false;
    }
    return index === 0 || this.suggestions[index - 1].kind !== current.kind;
  }

  groupLabel(kind: SearchSuggestion['kind']): string {
    return kind === 'topic' ? 'Topics' : 'Posts';
  }

  segments(text: string): { text: string; hit: boolean }[] {
    if (!this.tokens.length || !text) {
      return [{ text, hit: false }];
    }

    const pattern = new RegExp(
      `(^|[^A-Za-z0-9+#])(${this.tokens.map(token => this.escapeRegExp(token)).join('|')})`,
      'ig'
    );
    const parts: { text: string; hit: boolean }[] = [];
    let last = 0;

    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      const hitStart = index + match[1].length;
      const hitEnd = hitStart + match[2].length;
      if (hitStart > last) {
        parts.push({ text: text.slice(last, hitStart), hit: false });
      }
      parts.push({ text: text.slice(hitStart, hitEnd), hit: true });
      last = hitEnd;
    }

    if (last < text.length) {
      parts.push({ text: text.slice(last), hit: false });
    }

    return parts.length ? parts : [{ text, hit: false }];
  }

  onSearchFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const root = this.searchField?.nativeElement;
    if (next && root?.contains(next)) {
      return;
    }
    this.closeSuggestions();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    const root = this.searchField?.nativeElement;
    const target = event.target as Node | null;
    const inside = !!(root && target && root.contains(target));

    if (inside) {
      this.panelOpen = true;
      this.refresh();
      return;
    }

    if (this.panelOpen) {
      this.closeSuggestions();
    }
  }

  private closeSuggestions(): void {
    this.panelOpen = false;
    this.activeIndex = -1;
  }

  private moveActive(step: number): void {
    const total = this.suggestions.length;
    if (!total) {
      this.activeIndex = -1;
      return;
    }

    if (this.activeIndex === -1) {
      this.activeIndex = step > 0 ? 0 : total - 1;
    } else {
      this.activeIndex = (this.activeIndex + step + total) % total;
    }

    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    const id = this.activeDescendant;
    if (!id) {
      return;
    }

    queueMicrotask(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    });
  }

  private refresh(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.tokens = query ? query.split(/\s+/).filter(Boolean) : [];

    this.filteredBlogs = blogPosts
      .map(blog => ({ blog, score: this.scoreBlog(blog) }))
      .filter(item => this.tokens.length === 0 || item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.blog);

    const topics = this.rankTopics();
    const posts = (this.tokens.length ? this.filteredBlogs : blogPosts).slice(0, 5);

    this.suggestions = [
      ...topics.slice(0, 6).map(topic => ({
        kind: 'topic' as const,
        label: topic,
        hint: this.topicHint(topic)
      })),
      ...posts.map(blog => ({
        kind: 'post' as const,
        label: blog.title,
        hint: blog.topics.slice(0, 3).join(' · '),
        slug: blog.slug
      }))
    ];

    if (this.activeIndex >= this.suggestions.length) {
      this.activeIndex = this.suggestions.length - 1;
    }
  }

  private scoreBlog(blog: BlogPost): number {
    if (!this.tokens.length) {
      return 1;
    }

    const title = blog.title.toLowerCase();
    const topics = blog.topics.join(' ').toLowerCase();
    const description = blog.description.toLowerCase();
    const slug = blog.slug.replace(/-/g, ' ');
    let score = 0;

    for (const token of this.tokens) {
      const inTitle = this.containsToken(title, token);
      const inTopics = this.containsToken(topics, token);
      const inSlug = this.containsToken(slug, token);
      const inDescription = this.containsToken(description, token);
      if (!inTitle && !inTopics && !inSlug && !inDescription) {
        return 0;
      }
      if (inTitle) score += 5;
      if (inTopics) score += 3;
      if (inSlug) score += 2;
      if (inDescription) score += 1;
    }

    return score;
  }

  private rankTopics(): string[] {
    const unique: string[] = [];
    const seen = new Set<string>();

    for (const blog of blogPosts) {
      for (const topic of blog.topics) {
        const key = topic.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(topic);
      }
    }

    if (!this.tokens.length) {
      return featuredTopics;
    }

    const ranked = unique.map(topic => {
      const label = topic.toLowerCase();
      const matched = this.tokens.filter(token => this.containsToken(label, token));
      let score = 0;
      for (const token of matched) {
        score += label.startsWith(token) ? 3 : 1;
      }
      if (this.tokens.length > 1 && this.containsToken(label, this.tokens.join(' '))) {
        score += 2;
      }
      return { topic, score, complete: matched.length === this.tokens.length };
    });

    const complete = ranked.filter(item => item.complete);
    const pool = complete.length ? complete : ranked.filter(item => item.score > 0);

    return pool
      .sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic))
      .map(item => item.topic);
  }

  private topicHint(topic: string): string {
    const count = blogPosts.filter(blog =>
      blog.topics.some(item => item.toLowerCase() === topic.toLowerCase())
    ).length;
    return count === 1 ? '1 post' : `${count} posts`;
  }

  private containsToken(haystack: string, token: string): boolean {
    return new RegExp(`(?:^|[^a-z0-9+#])${this.escapeRegExp(token)}`, 'i').test(haystack);
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
