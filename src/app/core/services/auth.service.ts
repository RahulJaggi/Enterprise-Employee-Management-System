import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    this.checkAuth();
  }

  login(username: string, password: string): Observable<User> {
    // Mock login credentials validation
    let role: UserRole | null = null;
    let email = '';

    if (username === 'admin' && password === 'admin123') {
      role = 'Admin';
      email = 'admin@enterprise.com';
    } else if (username === 'hr' && password === 'hr123') {
      role = 'HR';
      email = 'hr@enterprise.com';
    } else if (username === 'manager' && password === 'manager123') {
      role = 'Manager';
      email = 'manager@enterprise.com';
    }

    if (role) {
      const user: User = {
        username,
        email,
        role,
        token: `mock-jwt-token-for-${username}-${role.toLowerCase()}`,
      };

      // Store in local storage
      localStorage.setItem('currentUser', JSON.stringify(user));
      this._currentUser.set(user);
      return of(user).pipe(delay(600)); // Mock network latency
    }

    return throwError(() => new Error('Invalid username or password.')).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this._currentUser.set(null);
  }

  checkAuth(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        this._currentUser.set(user);
      } catch {
        this.logout();
      }
    }
  }
}
