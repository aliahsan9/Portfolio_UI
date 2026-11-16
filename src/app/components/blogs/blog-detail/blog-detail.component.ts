import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { blogPosts } from '../blogs/blogs.component';

import 'prismjs';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/toolbar/prism-toolbar.css';
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

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
  description = '';

  constructor(private readonly route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') ?? '';
      const post = blogPosts.find(item => item.slug === this.slug);
      this.title = post?.title ?? this.formatTitle(this.slug);
      this.description = post?.description ?? '';
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