import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Department } from '../../../core/models/department.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);

  readonly isEditMode = signal<boolean>(false);
  readonly employeeId = signal<string | null>(null);
  readonly departments = this.departmentService.departments;

  readonly employeeForm: FormGroup = this.fb.group({
    employeeCode: ['', [Validators.required, Validators.pattern(/^EMP-\d{3}$/)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{10,15}$/)]],
    department: ['', Validators.required],
    designation: ['', Validators.required],
    joiningDate: ['', Validators.required],
    salary: ['', [Validators.required, Validators.min(0)]],
    status: ['Active', Validators.required],
    profileImage: [''],
    address: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
    }),
  });

  ngOnInit(): void {
    // Load departments list for select dropdown
    this.departmentService.loadAll().subscribe();

    // Check mode and get params
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(id);
      this.loadEmployeeData(id);
    }
  }

  loadEmployeeData(id: string): void {
    this.employeeService.loadById(id).subscribe({
      next: (emp) => {
        this.employeeForm.patchValue(emp);
        // If code is being edited, disable changes on employeeCode (best corporate practice)
        this.employeeForm.get('employeeCode')?.disable();
      },
      error: () => {
        this.notification.error('Failed to load employee profile.');
        this.router.navigate(['/employees']);
      },
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.notification.warn('Please resolve all validation errors in the form.');
      return;
    }

    // Get value, including disabled fields
    const formValue = this.employeeForm.getRawValue();

    // If profile image is empty, generate standard ui-avatars.com representation
    if (!formValue.profileImage) {
      formValue.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        formValue.name
      )}&background=random&color=fff&size=128`;
    }

    if (this.isEditMode()) {
      const id = this.employeeId()!;
      this.employeeService.update(id, formValue).subscribe({
        next: () => {
          this.notification.success(`Employee profile "${formValue.name}" updated successfully.`);
          this.router.navigate(['/employees', id]);
        },
        error: () => {
          this.notification.error('Failed to update employee profile.');
        },
      });
    } else {
      this.employeeService.create(formValue).subscribe({
        next: () => {
          this.notification.success(`New employee "${formValue.name}" registered successfully.`);
          this.router.navigate(['/employees']);
        },
        error: () => {
          this.notification.error('Failed to create new employee.');
        },
      });
    }
  }
}
