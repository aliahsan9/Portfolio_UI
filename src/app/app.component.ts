import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ThemeService } from './services/theme.service';

// Declare gtag for TypeScript
declare let gtag: Function;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'portfolio-ui';

  private readonly themeService = inject(ThemeService);

  constructor(private router: Router) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-SQHK5HWF68', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }

  ngOnInit(): void {
    // ThemeService initializes on inject (persisted preference)
  }
}