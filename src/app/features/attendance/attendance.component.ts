import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AttendanceService } from '../../core/services/attendance.service';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AttendanceFormDialogComponent } from './attendance-form-dialog/attendance-form-dialog.component';
import { Attendance } from '../../core/models/attendance.model';

@Component({
  selector: 'app-attendance',
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
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
})
export class AttendanceComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly departmentService = inject(DepartmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = [
    'name',
    'employeeCode',
    'date',
    'checkIn',
    'checkOut',
    'workingHours',
    'status',
    'actions',
  ];

  // Filters & State Signals
  readonly targetDate = signal<string>('2026-08-03');
  readonly searchQuery = signal<string>('');
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');
  readonly selectedDepartment = signal<string>('All');
  readonly selectedEmployee = signal<string>('All');

  // Table Pagination & Sorting Signals
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly sortActive = signal<string>('date');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  // Loaded resources
  readonly attendance = this.attendanceService.attendance;
  readonly departments = this.departmentService.departments;
  readonly employees = this.employeeService.employees;

  // 1. Dashboard metrics computed signals
  readonly todayRecords = computed(() =>
    this.attendance().filter((r) => r.date === this.targetDate())
  );

  readonly presentTodayCount = computed(
    () => this.todayRecords().filter((r) => r.status === 'Present').length
  );
  readonly absentTodayCount = computed(
    () => this.todayRecords().filter((r) => r.status === 'Absent').length
  );
  readonly lateTodayCount = computed(
    () => this.todayRecords().filter((r) => r.status === 'Late').length
  );
  readonly wfhTodayCount = computed(
    () => this.todayRecords().filter((r) => r.status === 'Work From Home').length
  );

  // SVG Donut segment computation for dashboard stats
  readonly donutSegments = computed(() => {
    const records = this.todayRecords();
    const total = records.length;
    if (total === 0) return [];

    const statusCounts = [
      { id: 1, label: 'Present', count: this.presentTodayCount(), color: '#10b981', code: 'PRES' },
      { id: 2, label: 'Late', count: this.lateTodayCount(), color: '#f59e0b', code: 'LATE' },
      { id: 3, label: 'WFH', count: this.wfhTodayCount(), color: '#6366f1', code: 'WFH' },
      { id: 4, label: 'Absent', count: this.absentTodayCount(), color: '#ef4444', code: 'ABS' },
    ];

    let accumOffset = 0;
    return statusCounts.map((item) => {
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
  readonly filteredRecords = computed(() => {
    const list = this.attendance();
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
        rec.department.toLowerCase().includes(query);

      const matchesStart = !start || rec.date >= start;
      const matchesEnd = !end || rec.date <= end;
      const matchesDept = dept === 'All' || rec.department === dept;
      const matchesEmp = empId === 'All' || rec.employeeId === empId;

      return matchesSearch && matchesStart && matchesEnd && matchesDept && matchesEmp;
    });
  });

  // 3. Paginated and sorted records
  readonly paginatedRecords = computed(() => {
    const list = [...this.filteredRecords()];
    const active = this.sortActive();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      const valA = a[active as keyof Attendance];
      const valB = b[active as keyof Attendance];

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
    this.attendanceService.loadAll().subscribe();
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

  // CRUD actions
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AttendanceFormDialogComponent, {
      width: '450px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.attendanceService.create(result).subscribe({
          next: () => {
            this.notification.success('Attendance record added successfully.');
          },
          error: () => {
            this.notification.error('Failed to add attendance record.');
          },
        });
      }
    });
  }

  openEditDialog(record: Attendance): void {
    const dialogRef = this.dialog.open(AttendanceFormDialogComponent, {
      width: '450px',
      data: record,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.attendanceService.update(record.id, result).subscribe({
          next: () => {
            this.notification.success('Attendance record updated successfully.');
          },
          error: () => {
            this.notification.error('Failed to update attendance record.');
          },
        });
      }
    });
  }

  deleteRecord(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Attendance Record',
        message: `Are you sure you want to delete the attendance record for "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.attendanceService.delete(id).subscribe({
          next: () => {
            this.notification.success(`Attendance record for "${name}" deleted.`);
            // Adjust page index if the page becomes empty
            const totalRemaining = this.filteredRecords().length;
            const maxPage = Math.ceil(totalRemaining / this.pageSize()) - 1;
            if (this.pageIndex() > maxPage && maxPage >= 0) {
              this.pageIndex.set(maxPage);
            }
          },
          error: () => {
            this.notification.error('Failed to delete attendance record.');
          },
        });
      }
    });
  }
}
