import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ApiService } from '../../core/services/api.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-manage-inactive-users',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="modal-overlay" *ngIf="open" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="breadcrumbs">MBRDB >> Manage Users</div>
            <h2 class="modal-title">Manage InActive Users</h2>
          </div>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <div class="info-banner">
            <p>Table below lists all the inactive users for the current company.</p>
            <p>Click on the activate button will reactivate the selected users.</p>
            <p>Click on the delete button will delete the selected users.</p>
          </div>

          <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="4" [columns]="3"></app-skeleton-loader>

          <div class="table-scroll-container" *ngIf="!isLoading && users.length > 0">
            <table class="inactive-users-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.UserName || user.userName || user.name || 'N/A' }}</td>
                  <td>{{ user.email || user.eMail || 'N/A' }}</td>
                  <td>{{ user.rolename || user.roleName || 'N/A' }}</td>
                  <td class="action-cell">
                    <button class="btn-action activate" (click)="onActivate(user)">Reactivate</button>
                    <button class="btn-action delete" (click)="onDelete(user)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="warning-banner" *ngIf="!isLoading && users.length === 0">
            Currently you have no inactive Users.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../styles/variables';

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(4px);
    }

    .modal-container {
      background: #fff; width: 95%; max-width: 900px;
      border-radius: $border-radius-lg; box-shadow: $modal-shadow;
      display: flex; flex-direction: column; overflow: hidden;
    }

    .modal-header {
      padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 1px solid $border-light;
      .breadcrumbs { font-size: 13px; color: $text-muted; margin-bottom: 4px; font-weight: 500; }
      .modal-title { font-size: 22px; color: $primary-navy; margin: 0; font-weight: 700; }
      .close-btn { background: none; border: none; font-size: 28px; color: $text-muted; cursor: pointer; &:hover { color: $primary-navy; } }
    }

    .modal-body { padding: 40px 32px; min-height: 400px; max-height: 70vh; overflow-y: auto; }

    .info-banner {
      margin-bottom: 24px;
      p {
        font-size: 14px;
        margin-bottom: 12px;
        color: $text-dark;
        &:last-child { margin-bottom: 0; }
      }
    }

    .table-scroll-container {
       border: 1px solid $border-light;
       border-radius: 8px;
       overflow: hidden;
    }

    .inactive-users-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      thead th {
        background: #F8F9FC;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: $primary-navy;
        border-bottom: 1px solid $border-light;
      }
      tbody td {
        padding: 12px 16px;
        border-bottom: 1px solid $border-light;
        color: $text-dark;
      }
      tbody tr:last-child td { border-bottom: none; }
      .action-cell { display: flex; gap: 8px; }
      .btn-action {
        padding: 6px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 600; cursor: pointer;
        &.activate { background: #E6FFFA; color: #2C7A7B; &:hover { background: #B2F5EA; } }
        &.delete { background: #FFF5F5; color: #C53030; &:hover { background: #FED7D7; } }
      }
    }

    .warning-banner {
      background: #FFF5F5;
      color: #C53030;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    .modal-footer {
      padding: 24px; border-top: 1px solid $border-light; display: flex; justify-content: center;
      background: #fff;
    }
  `]
})
export class ManageInactiveUsersComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() recordChanged = new EventEmitter<void>();

  users: any[] = [];
  isLoading = false;
  companyId = 0;

  constructor(
    private apiService: ApiService,
    private companyContextService: CompanyContextService,
    private toast: ToastService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.companyContextService.currentCompany$.subscribe((company: any) => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open && this.companyId) {
      this.loadInactiveUsers();
    }
  }

  loadInactiveUsers() {
    this.isLoading = true;
    this.apiService.getInactiveUsersByCID(this.companyId).subscribe({
      next: (data: any) => {
        
        if (Array.isArray(data)) {
          const tableData = data.find((t: any) => (t.tableName === 'Table' || t.Table));
          if (tableData) {
            this.users = tableData.rows || tableData.Table || [];
          } else {
            this.users = data;
          }
        } else if (data && data.Table) {
           this.users = data.Table;
        } else {
          this.users = [];
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading inactive users:', err);
        this.toast.error('Failed to load inactive users.');
        this.isLoading = false;
      }
    });
  }

  onActivate(user: any) {
    const uid = user.uid ?? user.Uid ?? user.id ?? 0;
    if (!uid) return;

    this.isLoading = true;
    this.apiService.updateUserActivateByCID(this.companyId, uid.toString()).subscribe({
      next: () => {
        this.toast.success('User reactivated successfully!');
        this.loadInactiveUsers();
        this.recordChanged.emit();
      },
      error: (err: any) => {
        console.error('Error reactivating user:', err);
        this.toast.error('Failed to reactivate user.');
        this.isLoading = false;
      }
    });
  }

  async onDelete(user: any) {
    const uid = user.uid ?? user.Uid ?? user.id ?? 0;
    if (!uid) return;

    if (!await this.confirmService.show(`Are you sure you want to permanently delete user: ${user.userName || user.name}?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      return;
    }

    this.isLoading = true;
    this.apiService.deleteUserInActivesByCID(this.companyId, uid.toString()).subscribe({
      next: () => {
        this.toast.success('User deleted successfully!');
        this.loadInactiveUsers();
        this.recordChanged.emit();
      },
      error: (err: any) => {
        console.error('Error deleting user:', err);
        this.toast.error('Failed to delete user.');
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.open = false;
    this.openChange.emit(false);
  }
}
