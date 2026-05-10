import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AboutComponent } from "./components/about/about.component";
import { PublicProjectsComponent } from "./components/projects/projects.component";
import { BlogsComponent } from "./components/blogs/blogs/blogs.component";
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { SkillsComponent } from './components/skills/skills.component';

// Declare gtag for TypeScript
declare let gtag: Function;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent,AboutComponent, PublicProjectsComponent, BlogsComponent, NewsletterComponent, SkillsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'portfolio-ui';

  // Constructor must be OUTSIDE ngOnInit
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
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });
  }
}