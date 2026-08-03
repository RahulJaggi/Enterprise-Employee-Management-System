import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Department } from '../models/department.model';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/departments`;

  // State Management via Signals
  private readonly _departments = signal<Department[]>([]);
  readonly departments = this._departments.asReadonly();

  readonly totalDepartmentsCount = computed(() => this._departments().length);

  loadAll(): Observable<Department[]> {
    return this.http
      .get<Department[]>(this.apiUrl)
      .pipe(tap((departments) => this._departments.set(departments)));
  }

  create(department: Omit<Department, 'id'>): Observable<Department> {
    return this.http
      .post<Department>(this.apiUrl, department)
      .pipe(tap((newDept) => this._departments.update((list) => [...list, newDept])));
  }

  update(id: string, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department).pipe(
      tap((updatedDept) => {
        this._departments.update((list) =>
          list.map((dept) => (dept.id === id ? { ...dept, ...updatedDept } : dept))
        );
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._departments.update((list) => list.filter((dept) => dept.id !== id));
      })
    );
  }
}
