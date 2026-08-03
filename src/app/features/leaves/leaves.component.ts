import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { LeaveService } from '../../core/services/leave.service';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LeaveFormDialogComponent } from './leave-form-dialog/leave-form-dialog.component';
import { LeaveDetailDialogComponent } from './leave-detail-dialog/leave-detail-dialog.component';
import { LeaveRequest } from '../../core/models/leave.model';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatDividerModule,
  ],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss',
})
export class LeavesComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = [
    'name',
    'employeeCode',
    'leaveType',
    'duration',
    'numberOfDays',
    'reason',
    'status',
    'actions',
  ];

  // Filters & State Signals
  readonly searchQuery = signal<string>('');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');
  readonly selectedDepartment = signal<string>('All');
  readonly selectedEmployee = signal<string>('All');

  // Table Pagination & Sorting Signals
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly sortActive = signal<string>('startDate');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Loaded resources
  readonly leaves = this.leaveService.leaves;
  readonly departments = this.departmentService.departments;
  readonly employees = this.employeeService.employees;
  readonly currentUser = this.authService.currentUser;

  // 1. Dashboard metrics computed signals
  readonly pendingCount = computed(() => this.leaves().filter(r => r.status === 'Pending').length);
  readonly approvedCount = computed(() => this.leaves().filter(r => r.status === 'Approved').length);
  readonly rejectedCount = computed(() => this.leaves().filter(r => r.status === 'Rejected').length);

  // Leave Balances Allocations (Casual 15, Sick 10, Earned 20, WFH 30)
  readonly balances = computed(() => {
    const list = this.leaves().filter(r => r.status === 'Approved');
    
    const casualUsed = list.filter(r => r.leaveType === 'Casual').reduce((sum, r) => sum + r.numberOfDays, 0);
    const sickUsed = list.filter(r => r.leaveType === 'Sick').reduce((sum, r) => sum + r.numberOfDays, 0);
    const earnedUsed = list.filter(r => r.leaveType === 'Earned').reduce((sum, r) => sum + r.numberOfDays, 0);
    const wfhUsed = list.filter(r => r.leaveType === 'Work From Home').reduce((sum, r) => sum + r.numberOfDays, 0);

    return [
      { type: 'Casual Leave', allocated: 15, used: casualUsed, remaining: 15 - casualUsed, color: '#6366f1' },
      { type: 'Sick Leave', allocated: 10, used: sickUsed, remaining: 10 - sickUsed, color: '#10b981' },
      { type: 'Earned Leave', allocated: 20, used: earnedUsed, remaining: 20 - earnedUsed, color: '#f59e0b' },
      { type: 'Work From Home', allocated: 30, used: wfhUsed, remaining: 30 - wfhUsed, color: '#06b6d4' },
    ];
  });

  // SVG Donut segment computation for leave types distribution
  readonly donutSegments = computed(() => {
    const list = this.leaves().filter(r => r.status === 'Approved');
    const total = list.reduce((sum, r) => sum + r.numberOfDays, 0);
    if (total === 0) return [];

    const types = [
      { id: 1, label: 'Casual', count: list.filter(r => r.leaveType === 'Casual').reduce((sum, r) => sum + r.numberOfDays, 0), color: '#6366f1' },
      { id: 2, label: 'Sick', count: list.filter(r => r.leaveType === 'Sick').reduce((sum, r) => sum + r.numberOfDays, 0), color: '#10b981' },
      { id: 3, label: 'Earned', count: list.filter(r => r.leaveType === 'Earned').reduce((sum, r) => sum + r.numberOfDays, 0), color: '#f59e0b' },
      { id: 4, label: 'WFH', count: list.filter(r => r.leaveType === 'Work From Home').reduce((sum, r) => sum + r.numberOfDays, 0), color: '#06b6d4' },
    ];

    let accumOffset = 0;
    return types.filter(t => t.count > 0).map((item) => {
      const percentage = Math.round((item.count / total) * 100);
      const strokeDashoffset = 100 - accumOffset;
      accumOffset += percentage;

      return {
        ...item,
        percentage,
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset,
      };
    });
  });

  // 2. Filtered list for the main table view
  readonly filteredLeaves = computed(() => {
    const list = this.leaves();
    const query = this.searchQuery().toLowerCase().trim();
    const start = this.startDate();
    const end = this.endDate();
    const dept = this.selectedDepartment();
    const empId = this.selectedEmployee();

    return list.filter((rec) => {
      const matchesSearch =
        !query ||
        rec.employeeName.toLowerCase().includes(query) ||
        rec.employeeCode.toLowerCase().includes(query) ||
        rec.reason.toLowerCase().includes(query);

      const matchesStart = !start || rec.startDate >= start;
      const matchesEnd = !end || rec.endDate <= end;
      const matchesDept = dept === 'All' || rec.department === dept;
      const matchesEmp = empId === 'All' || rec.employeeId === empId;

      return matchesSearch && matchesStart && matchesEnd && matchesDept && matchesEmp;
    });
  });

  // 3. Paginated and sorted records
  readonly paginatedLeaves = computed(() => {
    const list = [...this.filteredLeaves()];
    const active = this.sortActive();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      const valA = a[active as keyof LeaveRequest];
      const valB = b[active as keyof LeaveRequest];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });

    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  ngOnInit(): void {
    this.leaveService.loadAll().subscribe();
    this.departmentService.loadAll().subscribe();
    this.employeeService.loadAll().subscribe();
  }

  // Filters inputs handlers
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.pageIndex.set(0);
  }

  onStartDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDate.set(value);
    this.pageIndex.set(0);
  }

  onEndDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDate.set(value);
    this.pageIndex.set(0);
  }

  onDepartmentChange(value: string): void {
    this.selectedDepartment.set(value);
    this.pageIndex.set(0);
  }

  onEmployeeChange(value: string): void {
    this.selectedEmployee.set(value);
    this.pageIndex.set(0);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.selectedDepartment.set('All');
    this.selectedEmployee.set('All');
    this.pageIndex.set(0);
  }

  // Paging and Sorting handlers
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sortActive.set(sort.active);
    this.sortDirection.set((sort.direction as 'asc' | 'desc') || 'desc');
  }

  // CRUD Actions
  openApplyDialog(): void {
    const dialogRef = this.dialog.open(LeaveFormDialogComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.leaveService.create(result).subscribe({
          next: () => {
            this.notification.success('Leave request submitted successfully.');
          },
          error: () => {
            this.notification.error('Failed to submit leave request.');
          },
        });
      }
    });
  }

  openDetailDialog(record: LeaveRequest): void {
    const dialogRef = this.dialog.open(LeaveDetailDialogComponent, {
      width: '480px',
      data: record,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Result is { status: 'Approved' | 'Rejected', managerComment: '...' }
        this.leaveService.update(record.id, result).subscribe({
          next: () => {
            this.notification.success(`Leave request ${result.status.toLowerCase()} successfully.`);
          },
          error: () => {
            this.notification.error('Failed to resolve leave request.');
          },
        });
      }
    });
  }

  deleteRecord(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Leave Request',
        message: `Are you sure you want to delete the leave request for "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.leaveService.delete(id).subscribe({
          next: () => {
            this.notification.success(`Leave request for "${name}" deleted.`);
            // Adjust page index if page becomes empty
            const totalRemaining = this.filteredLeaves().length;
            const maxPage = Math.ceil(totalRemaining / this.pageSize()) - 1;
            if (this.pageIndex() > maxPage && maxPage >= 0) {
              this.pageIndex.set(maxPage);
            }
          },
          error: () => {
            this.notification.error('Failed to delete leave request.');
          },
        });
      }
    });
  }
}
