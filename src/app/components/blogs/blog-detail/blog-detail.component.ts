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
export class BlogDetailComponent
  implements OnInit, AfterViewInit {

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

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.initializeCopyButtons();
    }, 300);
  }

  private initializeCopyButtons(): void {

    if (!this.markdownContainer) return;

    const preBlocks =
      this.markdownContainer
        .nativeElement
        .querySelectorAll('pre');

    preBlocks.forEach((pre: HTMLElement) => {

      // prevent duplicate buttons
      if (pre.dataset['copyInitialized']) {
        return;
      }

      pre.dataset['copyInitialized'] = 'true';

      const code =
        pre.querySelector('code');

      if (!code) return;

      // wrapper class
      pre.classList.add('custom-code-block');

      // create button
      const button =
        document.createElement('button');

      button.className = 'copy-btn';

      button.type = 'button';

      button.innerHTML = `
        <span class="copy-text">Copy</span>
      `;

      button.addEventListener('click', async () => {

        const codeText =
          code.textContent || '';

        try {

          await navigator
            .clipboard
            .writeText(codeText);

          button.innerHTML =
            `<span class="copy-text copied">Copied</span>`;

          setTimeout(() => {

            button.innerHTML =
              `<span class="copy-text">Copy</span>`;

          }, 2000);

        } catch {

          button.innerHTML =
            `<span class="copy-text failed">Failed</span>`;

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