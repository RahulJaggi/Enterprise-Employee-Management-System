import { Component } from '@angular/core';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>Employee Directory</h2>
      <p>Directories, search, filter, and operations will load here.</p>
    </div>
  `,
})
export class EmployeeListComponent {}
