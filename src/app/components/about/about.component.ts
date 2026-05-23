import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import required for structural directives

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  // Sets default active card state to your premium SaaS platform asset
  activeProjectIndex: number = 0;

  /**
   * Updates state variables for reactive preview changes
   * @param index selected project item reference
   */
  setActiveProject(index: number): void {
    this.activeProjectIndex = index;
  }
}