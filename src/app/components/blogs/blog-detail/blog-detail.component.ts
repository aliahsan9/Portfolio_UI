import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [MarkdownModule, RouterModule, CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent {

  slug: string | null = null;
  title: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug');

    // Convert slug → title (simple UX upgrade)
    if (this.slug) {
      this.title = this.slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  get markdownPath(): string {
    return `assets/blogs/${this.slug}.md`;
  }
}