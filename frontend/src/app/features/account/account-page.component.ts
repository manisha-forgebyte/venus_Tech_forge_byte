import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UpdateAccountComponent } from './update-account.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UpdateAccountComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container">
      <div class="account-page-layout">
        
        <!-- Header Card -->
        <div class="card header-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Account Details</h2>
              <p class="card-sub-text">Manage your account information and settings</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="openUpdate()">Update Account</button>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
          
          <!-- Left: Account Info -->
          <div class="info-column">
            <app-skeleton-loader *ngIf="isLoading" type="card" [rows]="6" [columns]="2"></app-skeleton-loader>
            <div class="card" *ngIf="!isLoading">
              <div class="card-header">
                <div class="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                  Account Information
                </div>
              </div>

              <div class="info-grid">
                <!-- Column 1 -->
                <div>
                  <div class="info-item">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Account Name</span>
                      <span class="value">{{account.name || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Contact Person</span>
                      <span class="value">{{account.contactPerson || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Email</span>
                      <span class="value">{{account.email || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Phone 1</span>
                      <span class="value">{{account.phone1 || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Phone 2</span>
                      <span class="value">{{account.phone2 || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">State</span>
                      <span class="value">{{account.state || 'N/A'}}</span>
                    </div>
                  </div>

                  
                </div>

                <!-- Column 2 -->
                <div>
                  <div class="info-item">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Address 1</span>
                      <span class="value">{{account.address1 || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Address 2</span>
                      <span class="value">{{account.address2 || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Zip Code</span>
                      <span class="value">{{account.zipCode || 'N/A'}}</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Start Date</span>
                      <span class="value">03/18/2021</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div class="info-content">
                      <span class="label">Expire Date</span>
                      <span class="value">03/18/2021</span>
                    </div>
                  </div>

                  <div class="info-item" style="margin-top: 20px;">
                    <div class="info-content" style="flex-direction: row; align-items: center; gap: 8px;">
                      <label class="checkbox-container">
                        <input type="checkbox" checked disabled>
                        <span class="checkmark"></span>
                      </label>
                      <span class="label" style="margin-bottom: 0;">Active</span>
                    </div>
                  </div>
                </div>

            </div>


          </div>


            <div class="card groups-card">
              <div class="card-header">
                <div class="card-title">Account Groups</div>
              </div>

              <div class="groups-header">
                <div class="legend">
                  <span>Legend:</span>
                  <span><i class="icon-edit">📝</i> Edit</span>
                  <span><i class="icon-delete">🗑️</i> Delete</span>
                </div>
                <button class="btn btn-navy" style="width: auto; padding: 8px 24px;" (click)="openAddGroupModal()">+ Add</button>
              </div>

              <div class="table-wrapper">
                <app-skeleton-loader *ngIf="groupsLoading" type="table" [rows]="4" [columns]="4"></app-skeleton-loader>
                <div *ngIf="groupsErrorMessage && !groupsLoading" style="padding: 20px; text-align: center; color: #d32f2f;">{{groupsErrorMessage}}</div>
                <table class="custom-table" *ngIf="!groupsLoading && accountGroups.length > 0">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Companies</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let group of accountGroups">
                      <td>
                        <ng-container *ngIf="editingGroupId === group.gid; else groupNameDisplay">
                          <input class="inline-input" [(ngModel)]="group.editName" placeholder="Group Name" />
                        </ng-container>
                        <ng-template #groupNameDisplay>{{group.groupname || 'N/A'}}</ng-template>
                      </td>
                      <td>{{group.companies}}</td>
                      <td>
                        <div class="action-btns">
                          <button class="edit-btn" *ngIf="editingGroupId !== group.gid" (click)="startEditGroup(group)" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button class="edit-btn" *ngIf="editingGroupId === group.gid" (click)="saveGroup(group)" title="Save">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/><path d="M20 6L9 17"/></svg>
                          </button>
                          <button class="delete-btn" (click)="onDeleteGroup(group)" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div *ngIf="!groupsLoading && accountGroups.length === 0" style="padding: 20px; text-align: center; color: #666;">No account groups found</div>
              </div>
            </div>
         
        </div>

                  <!-- Right: Sidebar -->
          <aside class="sidebar-column">
            
            <div class="card ferc-card">
              <div class="ferc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 class="card-title">FERC Order No. 860</h3>
              <p class="card-text">
                View the MBR Database documents and news updates from FERC on MBR filings.
              </p>
              <a href="#" class="view-link">View Documents →</a>
            </div>

            <div class="card dictionary-card">
              <h3 class="card-title">MBR DB Data Dictionary</h3>
              <p class="card-text">
                Download the latest MBR database dictionary
              </p>
              <div class="dictionary-icon-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <button class="btn btn-download">
                Download PDF
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
 </aside>

      </div>

      
    </div>

    <!-- Account Update Modal -->
    <app-update-account 
      [account]="account" 
      [(open)]="isUpdateOpen"
      [isAdd]="isAdd"
      [isAdmin]="isAdminMode()"
      (saveEvent)="onSave($event)">
    </app-update-account>

    <!-- Group Add Modal -->
    <div class="modal-overlay" *ngIf="isGroupModalOpen">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Account Add</h3>
          <button class="close-btn" (click)="closeGroupModal()">×</button>
        </div>
        <div class="modal-body">
          <label class="form-label">Group Name: <span class="required">*</span></label>
          <input class="modal-input" [(ngModel)]="groupForm.groupname" placeholder="Enter group name" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" (click)="saveNewGroup()" [disabled]="!groupForm.groupname.trim()">Save</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  isUpdateOpen = false;
  isAdd = false;
  isLoading = false;
  errorMessage = '';
  groupsLoading = false;
  groupsErrorMessage = '';
  accountGroups: any[] = [];
  isGroupModalOpen = false;
  groupForm = { groupname: '', companies: 0, active: true };
  editingGroupId: string | number | null = null;

  account: any = {
    aid: 1,
    name: '',
    contactPerson: '',
    address1: '',
    address2: '',
    city: '',
    state: 'VA',
    zipCode: '',
    email: '',
    phone1: '',
    phone2: '',
    fax: ''
  };

  constructor(private apiService: ApiService, private toast: ToastService, private router: Router, private confirmService: ConfirmService) { }

  ngOnInit() {
    this.loadAccountData();
    this.loadAccountGroups();
  }

  loadAccountData() {
    const aid = this.account?.aid ?? 1;
    this.isLoading = true;
    this.apiService.getAccountDetailsByAID(aid).subscribe({
      next: (data) => {
        
        let accountData = null;
        if (Array.isArray(data)) {
          accountData = data.length > 0 ? data[0] : null;
        } else if (data && typeof data === 'object') {
          accountData = data;
        }
        
        if (accountData) {
          this.account = this.normalizeAccount(accountData);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading account details:', error);
        this.isLoading = false;
      }
    });
  }

  loadAccountGroups() {
    const aid = this.account?.aid ?? 1;
    this.groupsLoading = true;
    this.groupsErrorMessage = '';
    this.apiService.getAccountGroupsByAIDWithParams(aid, 'accountgroup', 'agid', 'groupname').subscribe({
      next: (data: any) => {
        let groups: any[] = [];
        if (Array.isArray(data)) {
          
          const table = data.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
          groups = table ? table.rows : data;
        } else if (data && Array.isArray(data.data)) {
          
          groups = data.data;
        } else if (data && data.rows && Array.isArray(data.rows)) {
          
          groups = data.rows;
        } else if (data && typeof data === 'object') {
          
          groups = [data];
        }

        
        groups = groups.filter((g: any) => {
          const id = g?.gid ?? g?.agid ?? g?.groupid ?? g?.groupId ?? g?.id ?? null;
          return id !== -1 && id !== '-1';
        });

        this.accountGroups = groups.map((g: any) => this.normalizeGroup(g));
        this.groupsLoading = false;
      },

      error: (error) => {
        console.error('Error loading account groups:', error);
        this.groupsErrorMessage = 'Failed to load account groups';
        this.accountGroups = [];
        this.groupsLoading = false;
      }
    });
  }

  async onDeleteGroup(group: any) {
    if (await this.confirmService.show(`Are you sure you want to delete group "${group.groupname || group.groupName || group.name}"?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      const agid = group.gid ?? group.raw?.agid ?? group.raw?.gid ?? group.raw?.groupid ?? group.raw?.id;
      
      if (!agid) {
        this.toast.error('Unable to delete group: missing group ID');
        return;
      }

      this.apiService.deleteAccountGroupByAGID(agid).subscribe({
        next: () => {
          this.toast.success('Group deleted successfully');
          this.loadAccountGroups();
        },
        error: (error) => {
          console.error('Error deleting group:', error);
          this.toast.error('Failed to delete group');
        }
      });
    }
  }

  startEditGroup(group: any) {
    this.editingGroupId = group.gid;
    group.editName = group.groupname;
  }

  saveGroup(group: any) {
    const isActiveNumeric = group.active ? 1 : 0;
    const payload = {
      ...(group.raw || {}),
      aid: this.account?.aid ?? 1,
      agid: group.gid ?? group.raw?.agid ?? group.raw?.gid ?? group.raw?.groupid ?? group.raw?.id,
      gid: group.gid ?? group.raw?.agid ?? group.raw?.gid ?? group.raw?.groupid ?? group.raw?.id,
      groupname: (group.editName || group.groupname || '').trim(),
      companies: group.companies ?? 0,
      groupcount: group.companies ?? 0,
      IsActive: isActiveNumeric,
      isDeleted: false
    };

    console.group('%c [ACCOUNT GROUP SAVE] ', 'background: #2196F3; color: white; font-weight: bold;');
    console.log('group.active:', group.active);
    console.log('IsActive (numeric):', isActiveNumeric);
    console.log('Full Payload:', payload);
    console.groupEnd();

    if (!payload.groupname) {
      this.toast.warning('Group name is required');
      return;
    }

    this.apiService.insUpdGroups(payload).subscribe({
      next: () => {
        this.editingGroupId = null;
        this.toast.success('Group updated successfully');
        this.loadAccountGroups();
      },
      error: (error) => {
        console.error('Error updating group:', error);
        this.toast.error('Failed to update group');
      }
    });
  }

  openAddGroupModal() {
    this.groupForm = { groupname: '', companies: 0, active: true };
    this.isGroupModalOpen = true;
  }

  closeGroupModal() {
    this.isGroupModalOpen = false;
  }

  saveNewGroup() {
    const isActiveNumeric = this.groupForm.active ? 1 : 0;
    const payload = {
      aid: this.account?.aid ?? 1,
      groupname: this.groupForm.groupname.trim(),
      companies: this.groupForm.companies ?? 0,
      groupcount: this.groupForm.companies ?? 0,
      IsActive: isActiveNumeric,
      isDeleted: false
    };

    console.group('%c [ACCOUNT GROUP NEW] ', 'background: #4CAF50; color: white; font-weight: bold;');
    console.log('groupForm.active:', this.groupForm.active);
    console.log('IsActive (numeric):', isActiveNumeric);
    console.log('Full Payload:', payload);
    console.groupEnd();

    if (!payload.groupname) {
      this.toast.warning('Group name is required');
      return;
    }

    this.apiService.insUpdGroups(payload).subscribe({
      next: () => {
        this.isGroupModalOpen = false;
        this.toast.success('Group added successfully');
        this.loadAccountGroups();
      },
      error: (error) => {
        console.error('Error creating group:', error);
        this.toast.error('Failed to create group');
      }
    });
  }

  private normalizeGroup(group: any) {
    
    const isActiveValue = !!(group?.IsActive ?? group?.isActive ?? group?.active ?? 0);
    return {
      ...group,
      raw: group,
      gid: group?.agid ?? group?.gid ?? group?.groupid ?? group?.groupId ?? group?.id ?? null,
      groupname: group?.groupname ?? group?.groupName ?? group?.name ?? '',
      companies: group?.groupcount ?? group?.groupCount ?? group?.companies ?? group?.companiesCount ?? 0,
      active: isActiveValue,
      isActive: isActiveValue,
      editName: group?.groupname ?? group?.groupName ?? group?.name ?? ''
    };
  }

  openUpdate() {
    this.isAdd = false;
    this.isUpdateOpen = true;
  }

  openAdd() {
    this.isAdd = true;
    this.account = {
      aid: null,
      name: '',
      contactPerson: '',
      address1: '',
      address2: '',
      city: '',
      state: 'VA',
      zipCode: '',
      email: '',
      phone1: '',
      phone2: '',
      fax: ''
    };
    this.isUpdateOpen = true;
  }

  onSave(updatedAccount: any) {
    this.saveAccountDetails(updatedAccount, this.isAdd);
  }

  saveAccountDetails(data: any, isAdd: boolean) {
    this.isLoading = true;
    this.errorMessage = '';

    
    const apiPayload = this.denormalizeAccount(data);
    console.log('=== SENDING ' + (isAdd ? 'CREATE' : 'UPDATE') + ' PAYLOAD ===');
    console.log('Raw payload:', JSON.stringify(apiPayload, null, 2));
    console.log('Is Admin Mode:', this.isAdminMode());

    let request$: any;
    if (isAdd) {
      request$ = this.apiService.createAccount(apiPayload);
    } else {
      request$ = this.apiService.updateAccount(apiPayload);
    }

    request$.subscribe({
      next: (result: any) => {
        console.log('Account ' + (isAdd ? 'created' : 'updated') + ':', result);
        this.isUpdateOpen = false;
        this.isAdd = false;
        this.toast.success('Account ' + (isAdd ? 'created' : 'updated') + ' successfully!');
        this.isLoading = false;
        
        this.loadAccountData();
      },
      error: (error: any) => {
        console.error('Error ' + (isAdd ? 'creating' : 'updating') + ' account:', error);
        console.error('Error response:', error.error);
        if (error.error?.errors) {
          console.error('Validation errors:', error.error.errors);
        }
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to save account. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }

  normalizeAccount(apiData: any): any {
    if (!apiData) {
      return {
        aid: 0, name: '', contactPerson: '', address1: '', address2: '', city: '', state: null, stateCode: 'VA', zipCode: '', email: '', phone1: '', phone2: '', fax: '', startDate: null, expireDate: null, modifiedUID: null, isActive: false, url: '', companySeeds: 0, tariffSeeds: 0, userSeeds: 0, isAllowCompAdd: false, isAllowTariffImport: false
      };
    }

    
    let stateValue = apiData.state ?? apiData.State ?? null;
    
    if (stateValue && typeof stateValue === 'string') {
      const stateObj = this.getStateIdByAbbr(stateValue);
      stateValue = stateObj ? stateObj : null;
    }

    return {
      aid: apiData.aid ?? apiData.Aid ?? 0,
      name: apiData.accName ?? apiData.AccName ?? apiData.accname ?? apiData.name ?? apiData.accountName ?? '',
      contactPerson: apiData.contactName ?? apiData.ContactName ?? apiData.contactname ?? apiData.contactPerson ?? apiData.contact_person ?? '',
      address1: apiData.address1 ?? apiData.Address1 ?? apiData.address_1 ?? apiData.addr1 ?? '',
      address2: apiData.address2 ?? apiData.Address2 ?? apiData.address_2 ?? apiData.addr2 ?? '',
      city: apiData.city ?? apiData.City ?? apiData.town ?? '',
      state: stateValue ?? apiData.state_id ?? null,
      stateCode: apiData.State ?? 'VA',
      zipCode: apiData.zipcode ?? apiData.ZipCode ?? apiData.zip ?? apiData.ZipCode ?? '',
      email: apiData.eMail ?? apiData.email ?? apiData.emailAddress ?? '',
      phone1: apiData.phone1 ?? apiData.phone_1 ?? apiData.ph1 ?? '',
      phone2: apiData.phone2 ?? apiData.phone_2 ?? apiData.ph2 ?? '',
      fax: apiData.fax ?? apiData.Fax ?? '',
      url: apiData.url ?? apiData.URL ?? apiData.Url ?? '',
      startDate: apiData.StartDate ?? apiData.startDate ?? apiData.SDate ?? null,
      expireDate: apiData.ExpireDate ?? apiData.expireDate ?? apiData.EDate ?? null,
      modifiedUID: apiData.modifieduid ?? apiData.ModifiedUID ?? apiData.modifiedUID ?? null,
      isActive: apiData.isActive ?? apiData.IsActive ?? false,
      companySeeds: apiData.companySeeds ?? apiData.CompanySeeds ?? 0,
      tariffSeeds: apiData.tariffSeeds ?? apiData.TariffSeeds ?? 0,
      userSeeds: apiData.userSeeds ?? apiData.UserSeeds ?? 0,
      isAllowCompAdd: apiData.isAllowCompAdd ?? apiData.IsAllowCompAdd ?? false,
      isAllowTariffImport: apiData.isAllowTariffImport ?? apiData.IsAllowTariffImport ?? false
    };
  }

  private getStateIdByAbbr(abbr: string): number | null {
    const states: { [key: string]: number } = {
      'AL': 1, 'AK': 2, 'AZ': 3, 'AR': 4, 'CA': 5, 'CO': 6, 'CT': 7, 'DE': 8, 'DC': 9, 'FL': 10,
      'GA': 11, 'HI': 12, 'ID': 13, 'IL': 14, 'IN': 15, 'IA': 16, 'KS': 17, 'KY': 18, 'LA': 19, 'ME': 20,
      'MD': 21, 'MA': 22, 'MI': 23, 'MN': 24, 'MS': 25, 'MO': 26, 'MT': 27, 'NE': 28, 'NV': 29, 'NH': 30,
      'NJ': 31, 'NM': 32, 'NY': 33, 'NC': 34, 'ND': 35, 'OH': 36, 'OK': 37, 'OR': 38, 'PA': 39, 'RI': 40,
      'SC': 41, 'SD': 42, 'TN': 43, 'TX': 44, 'UT': 45, 'VT': 46, 'VA': 47, 'WA': 48, 'WV': 49, 'WI': 50, 'WY': 51
    };
    return states[abbr.toUpperCase()] || null;
  }

  denormalizeAccount(normalized: any): any {
    if (!normalized) { return {}; }

    
    let stateValue = normalized.state;
    if (!stateValue || stateValue === 'VA') {
      stateValue = 47; 
    } else if (typeof stateValue === 'string') {
      stateValue = this.convertStateToNumber(stateValue);
    }

    return {
      aid: normalized.aid ?? 1,
      accName: normalized.accName ?? normalized.name ?? '',
      contactName: normalized.contactName ?? normalized.contactPerson ?? '',
      address1: normalized.address1 ?? '',
      address2: normalized.address2 ?? null,
      city: normalized.city ?? '',
      state: stateValue,
      zipcode: normalized.zipcode ?? normalized.zipCode ?? '',
      eMail: normalized.eMail ?? normalized.email ?? '',
      phone1: normalized.phone1 ?? '',
      phone2: normalized.phone2 ?? '',
      fax: normalized.fax ?? '',
      url: normalized.url ?? null,
      startDate: normalized.startDate ?? null,
      expireDate: normalized.expireDate ?? null,
      companySeeds: normalized.companySeeds ?? 1,
      tariffSeeds: normalized.tariffSeeds ?? 1,
      userSeeds: normalized.userSeeds ?? 1,
      isActive: normalized.isActive ?? true,
      isAllowCompAdd: normalized.isAllowCompAdd ?? true,
      modifiedUID: normalized.modifiedUID ?? 1
    };
  }

  convertStateToNumber(state: any): number {
    
    if (typeof state === 'number') {
      return state;
    }

    
    if (typeof state !== 'string') {
      return 47;
    }

    const stateMap: { [key: string]: number } = {
      'AL': 1, 'AK': 2, 'AZ': 3, 'AR': 4, 'CA': 5, 'CO': 6, 'CT': 7, 'DE': 8, 'DC': 9, 'FL': 10,
      'GA': 11, 'HI': 12, 'ID': 13, 'IL': 14, 'IN': 15, 'IA': 16, 'KS': 17, 'KY': 18, 'LA': 19, 'ME': 20,
      'MD': 21, 'MA': 22, 'MI': 23, 'MN': 24, 'MS': 25, 'MO': 26, 'MT': 27, 'NE': 28, 'NV': 29, 'NH': 30,
      'NJ': 31, 'NM': 32, 'NY': 33, 'NC': 34, 'ND': 35, 'OH': 36, 'OK': 37, 'OR': 38, 'PA': 39, 'RI': 40,
      'SC': 41, 'SD': 42, 'TN': 43, 'TX': 44, 'UT': 45, 'VT': 46, 'VA': 47, 'WA': 48, 'WV': 49, 'WI': 50, 'WY': 51
    };

    return stateMap[state.toUpperCase()] ?? 47;
  }

  isAdminMode(): boolean {
    return this.router.url.includes('/admin');
  }
}
