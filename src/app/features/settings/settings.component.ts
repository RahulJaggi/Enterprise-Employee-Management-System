import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  // Signals
  readonly themeMode = signal<'light' | 'dark'>('light');
  readonly emailNotifications = signal<boolean>(true);
  readonly pushNotifications = signal<boolean>(false);
  readonly smsNotifications = signal<boolean>(true);
  readonly twoFactorEnabled = signal<boolean>(false);

  // Forms
  profileForm!: FormGroup;
  securityForm!: FormGroup;
  preferencesForm!: FormGroup;

  // About Metadata
  readonly appMetadata = {
    name: 'Enterprise Employee Management System',
    version: '1.0.0',
    angularVersion: '20.0.0',
    buildVersion: '2026.08.03-release.1',
  };

  ngOnInit(): void {
    // 1. Initialize Forms
    const currentUser = this.authService.currentUser();
    this.profileForm = this.fb.group({
      name: [currentUser?.username || 'HR Admin', [Validators.required, Validators.minLength(3)]],
      email: [currentUser?.email || 'admin@enterprise.com', [Validators.required, Validators.email]],
      role: [{ value: currentUser?.role || 'Admin', disabled: true }],
    });

    this.securityForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.preferencesForm = this.fb.group({
      language: ['en', Validators.required],
      timezone: ['UTC', Validators.required],
      dateFormat: ['YYYY-MM-DD', Validators.required],
      currency: ['USD', Validators.required],
      sessionTimeout: ['30', Validators.required],
    });

    // 2. Load Theme preferences
    const storedTheme = localStorage.getItem('theme') || 'light';
    this.themeMode.set(storedTheme as 'light' | 'dark');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPass = g.get('newPassword')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    this.notification.success('Profile details updated successfully.');
  }

  onSaveSecurity(): void {
    if (this.securityForm.invalid) return;
    this.notification.success('Account password updated successfully.');
    this.securityForm.reset();
  }

  onSavePreferences(): void {
    if (this.preferencesForm.invalid) return;
    this.notification.success('System preferences saved.');
  }

  toggleThemeMode(isDark: boolean): void {
    const theme = isDark ? 'dark' : 'light';
    this.themeMode.set(theme);
    localStorage.setItem('theme', theme);

    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    this.notification.success(`Switched to ${theme} mode.`);
  }

  toggleEmailNotifications(val: boolean): void {
    this.emailNotifications.set(val);
    this.notification.success('Email notifications preferences updated.');
  }

  togglePushNotifications(val: boolean): void {
    this.pushNotifications.set(val);
    this.notification.success('Push notifications preferences updated.');
  }

  toggleSmsNotifications(val: boolean): void {
    this.smsNotifications.set(val);
    this.notification.success('SMS notifications preferences updated.');
  }

  toggle2FA(val: boolean): void {
    this.twoFactorEnabled.set(val);
    this.notification.success(`Two-Factor Authentication ${val ? 'enabled' : 'disabled'}.`);
  }
}
