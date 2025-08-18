import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { OnInit } from '@angular/core';
import { FooterComponent } from "./components/footer/footer.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'portfolio-ui';
 
  ngOnInit(): void {
    AOS.init(
      {
            duration: 1000,
      once: true,
      easing: 'ease-in-out'
      }
    );
  }
}
