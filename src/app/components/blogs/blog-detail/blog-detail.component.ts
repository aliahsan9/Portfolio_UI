import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
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
export class BlogDetailComponent implements OnInit, AfterViewInit {
  slug = '';
  title = '';

  @ViewChild('markdownContainer')
  markdownContainer!: ElementRef<HTMLDivElement>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    this.title = this.slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  ngAfterViewInit(): void {
    // Small delay ensures ngx-markdown has finished rendering the HTML
    setTimeout(() => {
      this.initializeCopyButtons();
    }, 500);
  }

  private initializeCopyButtons(): void {
    if (!this.markdownContainer) return;

    const preBlocks = this.markdownContainer.nativeElement.querySelectorAll('pre');

    preBlocks.forEach((pre: HTMLElement) => {
      // Prevent double buttons: check for BOTH class names
      if (pre.querySelector('.copy-button') || pre.querySelector('.copy-btn')) {
        return;
      }

      pre.style.position = 'relative'; // Ensure button anchors correctly

      const button = document.createElement('button');
      button.className = 'copy-button'; // Using the global style name
      button.type = 'button';
      button.innerHTML = 'Copy';

      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.innerText || '';
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = 'Copied!';
          button.classList.add('copied');

          setTimeout(() => {
            button.innerHTML = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          button.innerHTML = 'Error';
        }
      });

      pre.appendChild(button);
    });
  }

  get markdownPath(): string {
    return `assets/blogs/${this.slug}.md`;
  }
}