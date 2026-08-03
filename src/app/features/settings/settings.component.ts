import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div style="padding: 16px;">
      <h2>System Preferences</h2>
      <p>Theme settings, configuration properties, and details will load here.</p>
    </div>
  `,
})
export class SettingsComponent {}
