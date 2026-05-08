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

  onMarkdownReady(): void {

    this.initializeCopyButtons();
  }

  private initializeCopyButtons(): void {

    if (!this.markdownContainer) return;

    const preBlocks =
      this.markdownContainer.nativeElement.querySelectorAll('pre');

    preBlocks.forEach((pre: HTMLElement) => {

      /*
       Prevent duplicate buttons
      */
     if (pre.dataset['copyInitialized'] === 'true') {
  return;
}

pre.dataset['copyInitialized'] = 'true';

      pre.classList.add('code-block');

      const code =
        pre.querySelector('code');

      if (!code) return;

      const button =
        document.createElement('button');

      button.className = 'copy-btn';
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy code');

      button.innerHTML = `
        <span class="copy-text">Copy</span>
      `;

      button.addEventListener('click', async () => {

        try {

          await navigator.clipboard.writeText(
            code.textContent || ''
          );

          button.classList.add('copied');

          button.innerHTML =
            `<span class="copy-text">Copied!</span>`;

          setTimeout(() => {

            button.classList.remove('copied');

            button.innerHTML =
              `<span class="copy-text">Copy</span>`;

          }, 2000);

        } catch {

          button.innerHTML =
            `<span class="copy-text">Failed</span>`;

          setTimeout(() => {

            button.innerHTML =
              `<span class="copy-text">Copy</span>`;

          }, 2000);
        }
      });

      pre.appendChild(button);
    });
  }

  get markdownPath(): string {

    return `assets/blogs/${this.slug}.md`;
  }
}