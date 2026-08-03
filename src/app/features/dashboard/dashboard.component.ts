import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>Dashboard Panel</h2>
      <p>Dashboard analytics and corporate employee metrics will load here.</p>
    </div>
  `,
})
export class DashboardComponent {}
