import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Employee } from '../models/employee.model';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/employees`;

  // State Management via Signals
  private readonly _employees = signal<Employee[]>([]);
  readonly employees = this._employees.asReadonly();

  private readonly _selectedEmployee = signal<Employee | null>(null);
  readonly selectedEmployee = this._selectedEmployee.asReadonly();

  // Computed signals
  readonly activeEmployeesCount = computed(
    () => this._employees().filter((emp) => emp.status === 'Active').length
  );

  readonly inactiveEmployeesCount = computed(
    () => this._employees().filter((emp) => emp.status === 'Inactive').length
  );

  readonly totalEmployeesCount = computed(() => this._employees().length);

  loadAll(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(this.apiUrl)
      .pipe(tap((employees) => this._employees.set(employees)));
  }

  loadById(id: string): Observable<Employee> {
    return this.http
      .get<Employee>(`${this.apiUrl}/${id}`)
      .pipe(tap((employee) => this._selectedEmployee.set(employee)));
  }

  clearSelected(): void {
    this._selectedEmployee.set(null);
  }

  create(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http
      .post<Employee>(this.apiUrl, employee)
      .pipe(tap((newEmp) => this._employees.update((list) => [...list, newEmp])));
  }

  update(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee).pipe(
      tap((updatedEmp) => {
        this._employees.update((list) =>
          list.map((emp) => (emp.id === id ? { ...emp, ...updatedEmp } : emp))
        );
        if (this._selectedEmployee()?.id === id) {
          this._selectedEmployee.set(updatedEmp);
        }
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._employees.update((list) => list.filter((emp) => emp.id !== id));
        if (this._selectedEmployee()?.id === id) {
          this._selectedEmployee.set(null);
        }
      })
    );
  }
}
