import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    PhoneFormatPipe,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly employee = this.employeeService.selectedEmployee;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.employeeService.loadById(id).subscribe({
        error: () => {
          this.notification.error('Failed to load employee profile.');
          this.router.navigate(['/employees']);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.employeeService.clearSelected();
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
            this.router.navigate(['/employees']);
          },
          error: () => {
            this.notification.error('Failed to delete employee.');
          },
        });
      }
    });
  }
}
