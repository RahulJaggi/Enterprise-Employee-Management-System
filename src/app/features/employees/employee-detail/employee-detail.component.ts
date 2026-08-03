import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>Employee Detailed Profile</h2>
      <p>Card based employee descriptions and metrics will load here.</p>
    </div>
  `,
})
export class EmployeeDetailComponent {}
