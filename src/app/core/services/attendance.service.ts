import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Attendance } from '../models/attendance.model';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/attendance`;

  private readonly _attendance = signal<Attendance[]>([]);
  readonly attendance = this._attendance.asReadonly();

  private readonly _selectedRecord = signal<Attendance | null>(null);
  readonly selectedRecord = this._selectedRecord.asReadonly();

  loadAll(): Observable<Attendance[]> {
    return this.http
      .get<Attendance[]>(this.apiUrl)
      .pipe(tap((records) => this._attendance.set(records)));
  }

  loadById(id: string): Observable<Attendance> {
    return this.http
      .get<Attendance>(`${this.apiUrl}/${id}`)
      .pipe(tap((record) => this._selectedRecord.set(record)));
  }

  clearSelected(): void {
    this._selectedRecord.set(null);
  }

  create(record: Omit<Attendance, 'id'>): Observable<Attendance> {
    return this.http
      .post<Attendance>(this.apiUrl, record)
      .pipe(tap((newRec) => this._attendance.update((list) => [...list, newRec])));
  }

  update(id: string, record: Partial<Attendance>): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, record).pipe(
      tap((updatedRec) => {
        this._attendance.update((list) =>
          list.map((rec) => (rec.id === id ? { ...rec, ...updatedRec } : rec))
        );
        if (this._selectedRecord()?.id === id) {
          this._selectedRecord.set(updatedRec);
        }
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._attendance.update((list) => list.filter((rec) => rec.id !== id));
        if (this._selectedRecord()?.id === id) {
          this._selectedRecord.set(null);
        }
      })
    );
  }
}
