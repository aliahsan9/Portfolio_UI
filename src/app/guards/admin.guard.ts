import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Make sure this only runs in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');

      // Optional debug log (remove in production)
      console.log(' AdminGuard checked:', token);

      // Redirect to admin login if token is missing or empty
      if (!token || token.trim() === '') {
        this.router.navigate(['/admin/login']);
        return false;
      }

      return true;
    }

    return false;
  }
}
