import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LeaveRequest } from '../../../core/models/leave.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Leave Details</h2>
      <button mat-icon-button mat-dialog-close title="Close">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <!-- Employee Profile Summary -->
      <div class="detail-card">
        <div class="card-row">
          <span class="lbl">Employee</span>
          <span class="val bold-val">{{ data.employeeName }} ({{ data.employeeCode }})</span>
        </div>
        <div class="card-row">
          <span class="lbl">Department</span>
          <span class="val">{{ data.department }}</span>
        </div>
        <div class="card-row">
          <span class="lbl">Leave Type</span>
          <span class="val badge badge-info">{{ data.leaveType }}</span>
        </div>
        <div class="card-row">
          <span class="lbl">Duration</span>
          <span class="val">{{ data.startDate | date: 'mediumDate' }} &mdash; {{ data.endDate | date: 'mediumDate' }} ({{ data.numberOfDays }} days)</span>
        </div>
        <div class="card-row vertical">
          <span class="lbl">Reason</span>
          <span class="val desc-val">{{ data.reason }}</span>
        </div>
        <div class="card-row">
          <span class="lbl">Status</span>
          <span
            class="val badge"
            [class.badge-success]="data.status === 'Approved'"
            [class.badge-warn]="data.status === 'Pending'"
            [class.badge-danger]="data.status === 'Rejected'"
          >
            {{ data.status }}
          </span>
        </div>
      </div>

      <!-- Manager Comments section -->
      @if (data.status === 'Pending' && canResolve()) {
        <form [formGroup]="resolveForm" class="comment-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Manager Comment</mat-label>
            <textarea matInput formControlName="comment" rows="2" placeholder="Write feedback comments..."></textarea>
          </mat-form-field>
        </form>
      } @else if (data.managerComment) {
        <div class="comment-display-box">
          <span class="lbl">Manager's Comment</span>
          <p class="comment-text">{{ data.managerComment }}</p>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button type="button" mat-dialog-close>Close</button>
      
      @if (data.status === 'Pending' && canResolve()) {
        <button
          mat-flat-button
          color="warn"
          type="button"
          (click)="onResolve('Rejected')"
        >
          Reject
        </button>
        <button
          mat-flat-button
          color="primary"
          type="button"
          (click)="onResolve('Approved')"
        >
          Approve
        </button>
      }
    </mat-dialog-actions>
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
      gap: 20px;
      min-width: 360px;
    }

    .detail-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &.vertical {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }

      .lbl {
        color: var(--text-secondary);
      }

      .val {
        font-weight: 500;
        color: var(--text-primary);

        &.bold-val {
          font-weight: 600;
        }

        &.desc-val {
          font-size: 0.8rem;
          color: var(--text-primary);
          line-height: 1.4;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .comment-form {
      width: 100%;
    }

    .comment-display-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      border-left: 3px solid var(--primary);
      background-color: var(--bg-secondary);
      font-size: 0.85rem;

      .lbl {
        font-weight: 600;
        color: var(--primary);
      }

      .comment-text {
        margin: 0;
        color: var(--text-primary);
        line-height: 1.4;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }

    /* Badge system overrides */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.725rem;
      font-weight: 600;
      text-transform: uppercase;

      &.badge-success { background-color: var(--success-container); color: var(--on-success-container); }
      &.badge-warn { background-color: var(--warn-container); color: var(--on-warn-container); }
      &.badge-danger { background-color: var(--danger-container); color: var(--on-danger-container); }
      &.badge-info { background-color: var(--primary-container); color: var(--on-primary-container); }
    }
  `]
})
export class LeaveDetailDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  readonly dialogRef = inject(MatDialogRef<LeaveDetailDialogComponent>);
  readonly data = inject<LeaveRequest>(MAT_DIALOG_DATA);

  resolveForm!: FormGroup;

  ngOnInit(): void {
    this.resolveForm = this.fb.group({
      comment: [''],
    });
  }

  canResolve(): boolean {
    const user = this.authService.currentUser();
    // Managers and Admins can approve or reject leaves!
    return user?.role === 'Admin' || user?.role === 'Manager';
  }

  onResolve(status: 'Approved' | 'Rejected'): void {
    const comment = this.resolveForm.get('comment')?.value || '';
    this.dialogRef.close({
      status,
      managerComment: comment,
    });
  }
}
