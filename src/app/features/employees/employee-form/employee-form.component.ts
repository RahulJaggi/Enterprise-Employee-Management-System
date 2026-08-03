import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>Manage Employee Record</h2>
      <p>Forms to add or update employee information will load here.</p>
    </div>
  `,
})
export class EmployeeFormComponent {}
