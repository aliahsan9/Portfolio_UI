import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  navLinks = [
    { path: '/', label: 'home' },
    { path: '/about', label: 'about' },
    { path: '/skills', label: 'skills' },
    { path: '/projects', label: 'projects' },
    { path: '/resume', label: 'resume' },
    { path: '/contact', label: 'contact' }
  ];

  isSidebarOpen = false;

  private boundOnScroll = this.onScroll.bind(this);

  ngOnInit(): void {
    window.addEventListener('scroll', this.boundOnScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.boundOnScroll);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  onScroll(): void {
    const navbar = document.querySelector('.custom-navbar');
    if (window.scrollY > 10) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
}
