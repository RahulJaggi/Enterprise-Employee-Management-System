import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../../../core/services/employee.service';
import { Attendance } from '../../../core/models/attendance.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-attendance-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ data ? 'Edit Attendance' : 'Add Attendance' }}</h2>
      <button mat-icon-button mat-dialog-close title="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="attendanceForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <!-- Employee Select -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId" [disabled]="!!data">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.id">
                {{ emp.name }} ({{ emp.employeeCode }}) - {{ emp.department }}
              </mat-option>
            }
          </mat-select>
          @if (attendanceForm.get('employeeId')?.hasError('required')) {
            <mat-error>Employee selection is required.</mat-error>
          }
        </mat-form-field>

        <!-- Date picker -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput type="date" formControlName="date" />
          @if (attendanceForm.get('date')?.hasError('required')) {
            <mat-error>Date is required.</mat-error>
          }
        </mat-form-field>

        <!-- Status -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" (selectionChange)="onStatusChange($event.value)">
            <mat-option value="Present">Present</mat-option>
            <mat-option value="Absent">Absent</mat-option>
            <mat-option value="Late">Late Arrivals</mat-option>
            <mat-option value="Work From Home">Work From Home</mat-option>
          </mat-select>
          @if (attendanceForm.get('status')?.hasError('required')) {
            <mat-error>Status is required.</mat-error>
          }
        </mat-form-field>

        <!-- Check-In / Check-Out Grid -->
        <div class="time-grid" *ngIf="showTimeFields()">
          <mat-form-field appearance="outline">
            <mat-label>Check-In Time</mat-label>
            <input matInput type="time" formControlName="checkIn" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Check-Out Time</mat-label>
            <input matInput type="time" formControlName="checkOut" />
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="attendanceForm.invalid">
          {{ data ? 'Save Changes' : 'Add Record' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 8px 24px;
      border-bottom: 1px solid var(--border-color);

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: -0.025em;
      }
    }

    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 320px;
    }

    .full-width {
      width: 100%;
    }

    .time-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }
  `]
})
export class AttendanceFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  readonly dialogRef = inject(MatDialogRef<AttendanceFormDialogComponent>);
  readonly data = inject<Attendance | null>(MAT_DIALOG_DATA);

  readonly employees = signal<Employee[]>([]);
  attendanceForm!: FormGroup;

  ngOnInit(): void {
    // Load active employees list
    this.employeeService.loadAll().subscribe((list) => {
      this.employees.set(list.filter(e => e.status === 'Active'));
    });

    this.attendanceForm = this.fb.group({
      employeeId: [this.data?.employeeId || '', Validators.required],
      date: [this.data?.date || new Date().toISOString().substring(0, 10), Validators.required],
      status: [this.data?.status || 'Present', Validators.required],
      checkIn: [this.data?.checkIn || '09:00'],
      checkOut: [this.data?.checkOut || '17:00'],
    });

    // Run initial check for status fields
    this.onStatusChange(this.attendanceForm.get('status')?.value);
  }

  showTimeFields(): boolean {
    const status = this.attendanceForm?.get('status')?.value;
    return status !== 'Absent';
  }

  onStatusChange(status: string): void {
    const checkInCtrl = this.attendanceForm.get('checkIn');
    const checkOutCtrl = this.attendanceForm.get('checkOut');

    if (status === 'Absent') {
      checkInCtrl?.setValue('');
      checkInCtrl?.disable();
      checkOutCtrl?.setValue('');
      checkOutCtrl?.disable();
    } else {
      checkInCtrl?.enable();
      checkOutCtrl?.enable();
      if (!checkInCtrl?.value) {
        checkInCtrl?.setValue('09:00');
      }
      if (!checkOutCtrl?.value) {
        checkOutCtrl?.setValue('17:00');
      }
    }
  }

  onSubmit(): void {
    if (this.attendanceForm.invalid) return;

    const formVal = this.attendanceForm.getRawValue();
    const selectedEmp = this.employees().find(e => e.id === formVal.employeeId);

    if (!selectedEmp) return;

    // Calculate working hours
    let hours = 0;
    if (formVal.status !== 'Absent' && formVal.checkIn && formVal.checkOut) {
      const [inH, inM] = formVal.checkIn.split(':').map(Number);
      const [outH, outM] = formVal.checkOut.split(':').map(Number);
      const diffMins = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMins > 0) {
        hours = Math.round((diffMins / 60) * 100) / 100;
      }
    }

    const record: Omit<Attendance, 'id'> = {
      employeeId: formVal.employeeId,
      employeeName: selectedEmp.name,
      employeeCode: selectedEmp.employeeCode,
      department: selectedEmp.department,
      date: formVal.date,
      checkIn: formVal.status === 'Absent' ? '' : formVal.checkIn,
      checkOut: formVal.status === 'Absent' ? '' : formVal.checkOut,
      workingHours: hours,
      status: formVal.status,
    };

    this.dialogRef.close(record);
  }
}
