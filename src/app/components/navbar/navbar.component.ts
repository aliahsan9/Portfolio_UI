import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly themeService = inject(ThemeService);

  navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
    { path: '/news', label: 'Newsletter' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/skills', label: 'Skills' },
    { path: '/projects', label: 'Projects' },
    { path: '/resume', label: 'Resume' },
    { path: '/contact', label: 'Contact' }
  ];

  isSidebarOpen = false;

  private readonly desktopQuery =
    window.matchMedia('(min-width: 769px)');

  private readonly boundOnScroll = this.onScroll.bind(this);

  private readonly boundOnResize = (
    event: MediaQueryListEvent
  ): void => {
    if (event.matches) {
      this.closeSidebar();
    }
  };

  ngOnInit(): void {
    window.addEventListener('scroll', this.boundOnScroll, {
      passive: true
    });

    this.desktopQuery.addEventListener(
      'change',
      this.boundOnResize
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'scroll',
      this.boundOnScroll
    );

    this.desktopQuery.removeEventListener(
      'change',
      this.boundOnResize
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onScroll(): void {
    const navbar = document.querySelector('.custom-navbar');

    navbar?.classList.toggle(
      'scrolled',
      window.scrollY > 10
    );
  }
}
