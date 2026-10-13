import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MarkdownModule
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent {
  slug = '';
  title = '';

  constructor(private readonly route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') ?? '';
      this.title = this.formatTitle(this.slug);
    });
  }

  get markdownPath(): string {
    return `assets/blogs/${this.slug}.md`;
  }

  private formatTitle(slug: string): string {
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b[a-z]/g, character => character.toUpperCase());
  }
}