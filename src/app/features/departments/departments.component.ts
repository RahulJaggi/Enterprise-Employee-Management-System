import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { Department } from '../../core/models/department.model';
import { DepartmentFormDialogComponent } from './department-form-dialog/department-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['code', 'name', 'description', 'manager', 'employeeCount', 'actions'];

  // Filtering Signals
  readonly searchQuery = signal<string>('');

  // Pagination Signals
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Sorting Signals
  readonly sortActive = signal<string>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Base list of departments and employees
  readonly departments = this.departmentService.departments;
  readonly employees = this.employeeService.employees;

  // Map employee counts to department name dynamically
  readonly departmentEmployeeCounts = computed(() => {
    const counts: Record<string, number> = {};
    this.employees().forEach((emp) => {
      const dept = emp.department;
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  });

  // Filtered departments list
  readonly filteredDepartments = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.departments();

    return list.filter((dept) => {
      return (
        !query ||
        dept.name.toLowerCase().includes(query) ||
        dept.code.toLowerCase().includes(query) ||
        dept.manager.toLowerCase().includes(query)
      );
    });
  });

  // Sorted and Paginated list of departments for the table view
  readonly paginatedDepartments = computed(() => {
    const list = [...this.filteredDepartments()];
    const active = this.sortActive();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    // Apply sorting
    list.sort((a, b) => {
      let valA: string | number = a[active as keyof Department];
      let valB: string | number = b[active as keyof Department];

      // Handle custom employeeCount sorting
      if (active === 'employeeCount') {
        valA = this.departmentEmployeeCounts()[a.name] || 0;
        valB = this.departmentEmployeeCounts()[b.name] || 0;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });

    // Apply pagination
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  ngOnInit(): void {
    this.departmentService.loadAll().subscribe();
    this.employeeService.loadAll().subscribe();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.pageIndex.set(0); // Reset page to first
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sortActive.set(sort.active);
    this.sortDirection.set((sort.direction as 'asc' | 'desc') || 'asc');
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
      width: '450px',
      data: { id: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.departmentService.create(result).subscribe({
          next: (newDept) => {
            this.notification.success(`Department "${newDept.name}" created successfully.`);
          },
          error: () => {
            this.notification.error('Failed to create department.');
          },
        });
      }
    });
  }

  openEditDialog(id: string): void {
    const dialogRef = this.dialog.open(DepartmentFormDialogComponent, {
      width: '450px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.departmentService.update(id, result).subscribe({
          next: (updatedDept) => {
            this.notification.success(`Department "${updatedDept.name}" updated successfully.`);
          },
          error: () => {
            this.notification.error('Failed to update department.');
          },
        });
      }
    });
  }

  deleteDepartment(id: string, name: string): void {
    // Check if department contains active employees
    const count = this.departmentEmployeeCounts()[name] || 0;
    if (count > 0) {
      this.notification.warn(
        `Cannot delete department "${name}". It has ${count} assigned employees.`
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete department "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.departmentService.delete(id).subscribe({
          next: () => {
            this.notification.success(`Department "${name}" deleted successfully.`);
            // Adjust page index if the page becomes empty
            const totalRemaining = this.filteredDepartments().length;
            const maxPage = Math.ceil(totalRemaining / this.pageSize()) - 1;
            if (this.pageIndex() > maxPage && maxPage >= 0) {
              this.pageIndex.set(maxPage);
            }
          },
          error: () => {
            this.notification.error('Failed to delete department.');
          },
        });
      }
    });
  }
}
