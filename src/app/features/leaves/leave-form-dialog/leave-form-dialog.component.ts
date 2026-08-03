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
import { LeaveRequest } from '../../../core/models/leave.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-leave-form-dialog',
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
      <h2 mat-dialog-title>Apply for Leave</h2>
      <button mat-icon-button mat-dialog-close title="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="dialog-content">
        <!-- Employee Select -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Employee</mat-label>
          <mat-select formControlName="employeeId">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.id">
                {{ emp.name }} ({{ emp.employeeCode }}) - {{ emp.department }}
              </mat-option>
            }
          </mat-select>
          @if (leaveForm.get('employeeId')?.hasError('required')) {
            <mat-error>Employee selection is required.</mat-error>
          }
        </mat-form-field>

        <!-- Leave Type -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Leave Type</mat-label>
          <mat-select formControlName="leaveType">
            <mat-option value="Casual">Casual Leave</mat-option>
            <mat-option value="Sick">Sick Leave</mat-option>
            <mat-option value="Earned">Earned Leave</mat-option>
            <mat-option value="Work From Home">Work From Home</mat-option>
          </mat-select>
          @if (leaveForm.get('leaveType')?.hasError('required')) {
            <mat-error>Leave type is required.</mat-error>
          }
        </mat-form-field>

        <!-- Date Range Grid -->
        <div class="date-grid">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput type="date" formControlName="startDate" />
            @if (leaveForm.get('startDate')?.hasError('required')) {
              <mat-error>Required.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput type="date" formControlName="endDate" />
            @if (leaveForm.get('endDate')?.hasError('required')) {
              <mat-error>Required.</mat-error>
            }
          </mat-form-field>
        </div>

        @if (leaveForm.errors?.['dateMismatch']) {
          <div class="error-text">End date must be on or after start date.</div>
        }

        <!-- Reason -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason for Leave</mat-label>
          <textarea matInput formControlName="reason" rows="3" placeholder="Describe the reason..."></textarea>
          @if (leaveForm.get('reason')?.hasError('required')) {
            <mat-error>Reason description is required.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="leaveForm.invalid">
          Apply Leave
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
      min-width: 340px;
    }

    .full-width {
      width: 100%;
    }

    .date-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .error-text {
      color: var(--danger);
      font-size: 0.775rem;
      font-weight: 500;
      margin-top: -8px;
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
export class LeaveFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  readonly dialogRef = inject(MatDialogRef<LeaveFormDialogComponent>);

  readonly employees = signal<Employee[]>([]);
  leaveForm!: FormGroup;

  ngOnInit(): void {
    this.employeeService.loadAll().subscribe((list) => {
      this.employees.set(list.filter(e => e.status === 'Active'));
    });

    this.leaveForm = this.fb.group({
      employeeId: ['', Validators.required],
      leaveType: ['Casual', Validators.required],
      startDate: [new Date().toISOString().substring(0, 10), Validators.required],
      endDate: [new Date().toISOString().substring(0, 10), Validators.required],
      reason: ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(g: FormGroup) {
    const start = g.get('startDate')?.value;
    const end = g.get('endDate')?.value;
    if (start && end && start > end) {
      return { dateMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;

    const formVal = this.leaveForm.getRawValue();
    const selectedEmp = this.employees().find(e => e.id === formVal.employeeId);

    if (!selectedEmp) return;

    // Calculate number of days
    const start = new Date(formVal.startDate);
    const end = new Date(formVal.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const record: Omit<LeaveRequest, 'id'> = {
      employeeId: formVal.employeeId,
      employeeName: selectedEmp.name,
      employeeCode: selectedEmp.employeeCode,
      department: selectedEmp.department,
      leaveType: formVal.leaveType,
      startDate: formVal.startDate,
      endDate: formVal.endDate,
      numberOfDays: days,
      reason: formVal.reason,
      status: 'Pending',
      managerComment: '',
    };

    this.dialogRef.close(record);
  }
}
