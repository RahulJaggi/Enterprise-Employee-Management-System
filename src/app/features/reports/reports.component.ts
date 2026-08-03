import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';
import { NotificationService } from '../../core/services/notification.service';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = ['employeeCode', 'name', 'department', 'joiningDate', 'salary', 'status'];

  // Filter Signals
  readonly startDate = signal<string>('');
  readonly endDate = signal<string>('');
  readonly selectedDepartment = signal<string>('All');
  readonly selectedStatus = signal<string>('All');

  // Load departments list for select dropdown
  readonly departmentsList = this.departmentService.departments;

  // Filtered employees list based on search selections
  readonly filteredEmployees = computed(() => {
    const list = this.employeeService.employees();
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();
    const start = this.startDate();
    const end = this.endDate();

    return list.filter((emp) => {
      const matchesDept = dept === 'All' || emp.department === dept;
      const matchesStatus = status === 'All' || emp.status === status;

      let matchesDate = true;
      if (start) {
        matchesDate = matchesDate && new Date(emp.joiningDate) >= new Date(start);
      }
      if (end) {
        matchesDate = matchesDate && new Date(emp.joiningDate) <= new Date(end);
      }

      return matchesDept && matchesStatus && matchesDate;
    });
  });

  // KPI calculations based on filtered results
  readonly headcount = computed(() => this.filteredEmployees().length);

  readonly activeRatio = computed(() => {
    const list = this.filteredEmployees();
    if (list.length === 0) return 0;
    const active = list.filter((e) => e.status === 'Active').length;
    return Math.round((active / list.length) * 100);
  });

  readonly averageSalary = computed(() => {
    const list = this.filteredEmployees();
    if (list.length === 0) return 0;
    const total = list.reduce((acc, emp) => acc + emp.salary, 0);
    return Math.round(total / list.length);
  });

  readonly totalSalaryExpense = computed(() => {
    return this.filteredEmployees().reduce((acc, emp) => acc + emp.salary, 0);
  });

  // Employee Growth Chart Data points
  readonly growthChartPoints = computed(() => {
    const list = [...this.filteredEmployees()].sort((a, b) =>
      a.joiningDate.localeCompare(b.joiningDate)
    );
    if (list.length === 0) return [];

    const years = Array.from(new Set(list.map((e) => e.joiningDate.substring(0, 4)))).sort();
    let cumulative = 0;
    const data = years.map((year) => {
      const count = list.filter((e) => e.joiningDate.startsWith(year)).length;
      cumulative += count;
      return { label: year, val: cumulative };
    });

    const maxVal = cumulative || 1;
    const width = 300;
    const height = 150;
    const padding = 20;

    return data.map((d, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - (d.val / maxVal) * (height - 2 * padding);
      return { label: d.label, val: d.val, x, y };
    });
  });

  readonly growthPath = computed(() => {
    const pts = this.growthChartPoints();
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  readonly growthAreaPath = computed(() => {
    const pts = this.growthChartPoints();
    if (pts.length === 0) return '';
    const height = 150;
    const padding = 20;
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${line} L ${pts[pts.length - 1].x} ${height - padding} L ${
      pts[0].x
    } ${height - padding} Z`;
  });

  // Department distribution stats based on filtered set
  readonly departmentDistribution = computed(() => {
    const list = this.filteredEmployees();
    const depts = this.departmentService.departments();

    return depts
      .map((d) => {
        const count = list.filter((e) => e.department === d.name).length;
        const percentage = list.length > 0 ? Math.round((count / list.length) * 100) : 0;
        return { name: d.name, code: d.code, count, percentage };
      })
      .sort((a, b) => b.count - a.count);
  });

  // Monthly Joining Trend based on filtered set
  readonly monthlyJoiningTrend = computed(() => {
    const list = this.filteredEmployees();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = months.map((m, idx) => {
      const count = list.filter((e) => {
        const date = new Date(e.joiningDate);
        return date.getMonth() === idx;
      }).length;
      return { label: m, count };
    });

    const maxVal = Math.max(...data.map((d) => d.count)) || 1;
    return data.map((d) => ({ ...d, percentage: Math.round((d.count / maxVal) * 100) }));
  });

  ngOnInit(): void {
    this.employeeService.loadAll().subscribe();
    this.departmentService.loadAll().subscribe();
  }

  onStartDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.startDate.set(value);
  }

  onEndDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.endDate.set(value);
  }

  onDepartmentChange(value: string): void {
    this.selectedDepartment.set(value);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.selectedDepartment.set('All');
    this.selectedStatus.set('All');

    // Reset date input fields in HTML
    const startInput = document.getElementById('start-date-input') as HTMLInputElement;
    const endInput = document.getElementById('end-date-input') as HTMLInputElement;
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
  }

  exportToCSV(): void {
    const list = this.filteredEmployees();
    if (list.length === 0) {
      this.notification.warn('No records available to export.');
      return;
    }

    const headers = [
      'Employee Code',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Joining Date',
      'Salary ($)',
      'Status',
      'Street',
      'City',
      'State',
      'ZIP',
    ];

    const rows = list.map((emp) => [
      emp.employeeCode,
      emp.name,
      emp.email,
      emp.phone,
      emp.department,
      emp.designation,
      emp.joiningDate,
      emp.salary,
      emp.status,
      emp.address.street,
      emp.address.city,
      emp.address.state,
      emp.address.zip,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `HR_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notification.success('CSV Report exported successfully.');
  }
}
