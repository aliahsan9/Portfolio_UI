import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import AOS from 'aos';
import 'aos/dist/aos.css';

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

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.trackPage(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });
  }

  // Proper GA4 page tracking
  trackPage(url: string) {
    gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href
    });
  }
}