import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LeaveRequest } from '../models/leave.model';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/leaves`;

  private readonly _leaves = signal<LeaveRequest[]>([]);
  readonly leaves = this._leaves.asReadonly();

  private readonly _selectedLeave = signal<LeaveRequest | null>(null);
  readonly selectedLeave = this._selectedLeave.asReadonly();

  loadAll(): Observable<LeaveRequest[]> {
    return this.http
      .get<LeaveRequest[]>(this.apiUrl)
      .pipe(tap((records) => this._leaves.set(records)));
  }

  loadById(id: string): Observable<LeaveRequest> {
    return this.http
      .get<LeaveRequest>(`${this.apiUrl}/${id}`)
      .pipe(tap((record) => this._selectedLeave.set(record)));
  }

  clearSelected(): void {
    this._selectedLeave.set(null);
  }

  create(record: Omit<LeaveRequest, 'id'>): Observable<LeaveRequest> {
    return this.http
      .post<LeaveRequest>(this.apiUrl, record)
      .pipe(tap((newRec) => this._leaves.update((list) => [...list, newRec])));
  }

  update(id: string, record: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}`, record).pipe(
      tap((updatedRec) => {
        this._leaves.update((list) =>
          list.map((rec) => (rec.id === id ? { ...rec, ...updatedRec } : rec))
        );
        if (this._selectedLeave()?.id === id) {
          this._selectedLeave.set(updatedRec);
        }
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._leaves.update((list) => list.filter((rec) => rec.id !== id));
        if (this._selectedLeave()?.id === id) {
          this._selectedLeave.set(null);
        }
      })
    );
  }
}
