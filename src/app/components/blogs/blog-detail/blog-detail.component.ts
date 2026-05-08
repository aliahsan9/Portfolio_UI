import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  RouterModule
} from '@angular/router';

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
export class BlogDetailComponent implements OnInit {

  slug = '';
  title = '';

  @ViewChild('markdownContainer')
  markdownContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.slug =
      this.route.snapshot.paramMap.get('slug') || '';

    this.title = this.slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }


  get markdownPath(): string {

    return `assets/blogs/${this.slug}.md`;
  }
  }