import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DepartmentService } from '../../../core/services/department.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface DepartmentDialogData {
  id: string | null;
}

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Edit Department' : 'Create Department' }}</h2>
    <form [formGroup]="deptForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content class="form-content">
        <mat-form-field appearance="outline">
          <mat-label>Department Code</mat-label>
          <input matInput formControlName="code" placeholder="ENG" />
          @if (deptForm.get('code')?.hasError('required')) {
            <mat-error>Department Code is required.</mat-error>
          }
          @if (deptForm.get('code')?.hasError('pattern')) {
            <mat-error>Code must be 2-4 uppercase letters (e.g. ENG, HR).</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Department Name</mat-label>
          <input matInput formControlName="name" placeholder="Engineering" />
          @if (deptForm.get('name')?.hasError('required')) {
            <mat-error>Department Name is required.</mat-error>
          }
          @if (deptForm.get('name')?.hasError('minlength')) {
            <mat-error>Name must be at least 3 characters long.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Department Manager</mat-label>
          <mat-select formControlName="manager">
            @for (emp of employees(); track emp.id) {
              <mat-option [value]="emp.name">{{ emp.name }}</mat-option>
            }
          </mat-select>
          @if (deptForm.get('manager')?.hasError('required')) {
            <mat-error>Manager is required.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Describe the department's core responsibilities..."
          ></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="deptForm.invalid">
          {{ isEditMode() ? 'Save' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 320px;
        padding-top: 12px !important;
      }
      mat-dialog-actions {
        padding: 16px 24px;
        gap: 8px;
      }
    `,
  ],
})
export class DepartmentFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DepartmentFormDialogComponent>);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly notification = inject(NotificationService);
  readonly data: DepartmentDialogData = inject(MAT_DIALOG_DATA);

  readonly isEditMode = signal<boolean>(false);
  readonly employees = this.employeeService.employees;

  readonly deptForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,4}$/)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    manager: ['', Validators.required],
  });

  ngOnInit(): void {
    // Load employees for manager select dropdown
    this.employeeService.loadAll().subscribe();

    if (this.data && this.data.id) {
      this.isEditMode.set(true);
      this.departmentService.loadById(this.data.id).subscribe({
        next: (dept) => {
          this.deptForm.patchValue(dept);
        },
        error: () => {
          this.notification.error('Failed to load department details.');
          this.dialogRef.close();
        },
      });
    }
  }

  onSubmit(): void {
    if (this.deptForm.invalid) {
      return;
    }
    this.dialogRef.close(this.deptForm.value);
  }
}
