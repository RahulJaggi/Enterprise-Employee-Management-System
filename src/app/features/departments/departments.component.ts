import { Component } from '@angular/core';

@Component({
  selector: 'app-departments',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>Department Directory</h2>
      <p>Organizational departments and managers will load here.</p>
    </div>
  `,
})
export class DepartmentsComponent {}
