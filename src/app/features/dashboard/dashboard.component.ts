import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);

  // Expose signals from services
  readonly totalEmployees = this.employeeService.totalEmployeesCount;
  readonly activeEmployees = this.employeeService.activeEmployeesCount;
  readonly inactiveEmployees = this.employeeService.inactiveEmployeesCount;
  readonly totalDepartments = this.departmentService.totalDepartmentsCount;

  // Recent Employees (Latest 5 by joining date)
  readonly recentEmployees = computed(() => {
    return [...this.employeeService.employees()]
      .sort(
        (a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
      )
      .slice(0, 5);
  });

  // Recent Departments (Latest 5)
  readonly recentDepartments = computed(() => {
    return [...this.departmentService.departments()]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 5);
  });

  // Department-wise Employee Statistics (for charts and lists)
  readonly departmentStats = computed(() => {
    const employees = this.employeeService.employees();
    const departments = this.departmentService.departments();
    const totalCount = employees.length;

    return departments
      .map((dept) => {
        const count = employees.filter((emp) => emp.department === dept.name).length;
        const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return {
          id: dept.id,
          code: dept.code,
          name: dept.name,
          manager: dept.manager,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);
  });

  // Department Count for Pie/Donut Chart calculations (SVG segments)
  readonly donutSegments = computed(() => {
    const stats = this.departmentStats().filter((d) => d.count > 0);
    let accumulatedPercentage = 0;

    return stats.map((stat, index) => {
      const percentage = stat.percentage;
      const startAngle = (accumulatedPercentage * 360) / 100;
      accumulatedPercentage += percentage;
      const endAngle = (accumulatedPercentage * 360) / 100;

      // Color palette for segments
      const colors = [
        '#673AB7', // Primary (Deep Purple)
        '#3F51B5', // Indigo
        '#2196F3', // Blue
        '#00BCD4', // Cyan
        '#009688', // Teal
        '#4CAF50', // Green
        '#FF9800', // Orange
        '#E91E63', // Pink
        '#9C27B0', // Purple
        '#607D8B', // Blue Grey
      ];

      return {
        ...stat,
        color: colors[index % colors.length],
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset: `${-accumulatedPercentage + percentage}`,
      };
    });
  });

  ngOnInit(): void {
    this.employeeService.loadAll().subscribe();
    this.departmentService.loadAll().subscribe();
  }
}
