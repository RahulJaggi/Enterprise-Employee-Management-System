import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Employee } from '../../../core/models/employee.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = [
    'avatar',
    'employeeCode',
    'name',
    'email',
    'department',
    'designation',
    'status',
    'actions',
  ];

  // Filtering Signals
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('All');

  // Pagination Signals
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Sorting Signals
  readonly sortActive = signal<string>('name');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Base list of employees from service
  readonly employees = this.employeeService.employees;

  // Filtered employees list
  readonly filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const list = this.employees();

    return list.filter((emp) => {
      const matchesSearch =
        !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || emp.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  // Sorted and Paginated list of employees for the table view
  readonly paginatedEmployees = computed(() => {
    const list = [...this.filteredEmployees()];
    const active = this.sortActive();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    // Apply sorting
    list.sort((a, b) => {
      const valA = a[active as keyof Employee];
      const valB = b[active as keyof Employee];

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
    this.employeeService.loadAll().subscribe();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.pageIndex.set(0); // Reset page to first
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
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

  deleteEmployee(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete employee "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.employeeService.delete(id).subscribe({
          next: () => {
            this.notification.success(`Employee "${name}" deleted successfully.`);
            // Adjust page index if the page becomes empty
            const totalRemaining = this.filteredEmployees().length;
            const maxPage = Math.ceil(totalRemaining / this.pageSize()) - 1;
            if (this.pageIndex() > maxPage && maxPage >= 0) {
              this.pageIndex.set(maxPage);
            }
          },
          error: () => {
            this.notification.error(`Failed to delete employee.`);
          },
        });
      }
    });
  }
}
