import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-about',
  imports:[RouterModule],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    AOS.init({
      duration: 400,
      once: true,
      easing: 'ease-in-out'
    });
  }

}