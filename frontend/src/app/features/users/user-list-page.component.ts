import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../shared/services/confirm.service';
import { FormsModule } from '@angular/forms';
import { AddNewUserComponent } from './add-new-user.component';
import { ManageInactiveUsersComponent } from './manage-inactive-users.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AddNewUserComponent, ManageInactiveUsersComponent, SanitizeInputDirective, SkeletonLoaderComponent],
  template: `
    <div class="page-container">
      <div class="user-page-card">
        <div class="header-section">
          <h1 class="page-title">User List</h1>
          <div class="header-actions">
            <button class="btn btn-manage" (click)="isManageInactiveOpen = true">Manage User</button>
            <button class="btn btn-add" (click)="openAddUser()">Add User</button>
          </div>
        </div>
        
        <div class="legend-and-search-row">
          <div class="legend-section">
            <span class="legend-label">Legend:</span>
            <span class="legend-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B3674" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </span>
            <span class="legend-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E31A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete
            </span>
          </div>

          <div class="search-container">
            <div class="search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
            </div>
          </div>
        </div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="5"></app-skeleton-loader>

        <div class="table-container" *ngIf="!isLoading">
          <table class="user-table">
            <thead>
              <tr>
                <th>
                  <div class="header-cell">
                    User Name
                    <button class="filter-btn" (click)="toggleFilter('name', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'name'" (click)="$event.stopPropagation()">
                      <input type="text" [(ngModel)]="filters.name" placeholder="Filter Name..." class="dropdown-filter-input" autofocus>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    Email
                    <button class="filter-btn" (click)="toggleFilter('email', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'email'" (click)="$event.stopPropagation()">
                      <input type="text" [(ngModel)]="filters.email" placeholder="Filter Email..." class="dropdown-filter-input" autofocus>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    Role
                    <button class="filter-btn" (click)="toggleFilter('role', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'role'" (click)="$event.stopPropagation()">
                      <input type="text" [(ngModel)]="filters.role" placeholder="Filter Role..." class="dropdown-filter-input" autofocus>
                    </div>
                  </div>
                </th>
                <th>
                  <div class="header-cell">
                    Is Active
                    <button class="filter-btn" (click)="toggleFilter('active', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'active'" (click)="$event.stopPropagation()">
                       <select [(ngModel)]="filters.active" class="dropdown-filter-input">
                         <option value="">All</option>
                         <option [ngValue]="true">Active</option>
                         <option [ngValue]="false">Inactive</option>
                       </select>
                    </div>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <span class="user-status-badge" [class.active]="user.isActive">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="action-cell">
                  <div class="row-actions">
                    <button *ngIf="canManageUser(user)" class="action-btn icon-edit" title="Edit" (click)="onEditUser(user)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button *ngIf="canManageUser(user)" class="action-btn icon-delete" title="Delete" (click)="deleteUser(user.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <app-add-new-user [(open)]="isAddUserOpen" [initialData]="currentEditUser" [mode]="isEditMode ? 'edit' : 'add'" (openChange)="onAddModalOpenChange($event)" (saveEvent)="onUserSaved($event)"></app-add-new-user>
    <app-manage-inactive-users [(open)]="isManageInactiveOpen" (recordChanged)="loadUsers()"></app-manage-inactive-users>
  `,
  styleUrls: ['./user-list-page.component.scss']
})
export class UserListPageComponent implements OnInit {
  isAddUserOpen = false;
  isManageInactiveOpen = false;
  activeFilter: string | null = null;
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  filters = {
    name: '',
    email: '',
    role: '',
    active: '' as string | boolean,
    locked: '' as string | boolean
  };

  users: any[] = []; 
  companyCid: number | null = null; 
  accountAid: number | null = null; 
  accounts: any[] = []; 
  companies: any[] = []; 
  isEditMode = false;
  editingUserId: number | null = null;
  currentEditUser: any = null;
  roleTypes: any[] = []; 
  roleMap: Map<number, string> = new Map(); 

  get filteredUsers() {
    return this.users.filter(user => {
      
      const globalMatch = !this.searchTerm || 
        Object.values(user).some((val: any) => 
          val && val.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      const nameMatch = !this.filters.name || user.name.toLowerCase().includes(this.filters.name.toLowerCase());
      const emailMatch = !this.filters.email || user.email.toLowerCase().includes(this.filters.email.toLowerCase());
      const roleMatch = !this.filters.role || (user.role || '').toString().toLowerCase().includes(this.filters.role.toLowerCase());
      const activeMatch = this.filters.active === '' || (user.status === 'Active' && this.filters.active === true) || (user.status === 'Inactive' && this.filters.active === false);
      const lockedMatch = this.filters.locked === '' || user.isLocked === this.filters.locked;

      return globalMatch && nameMatch && emailMatch && roleMatch && activeMatch && lockedMatch;
    }).map(u => {
      
      if (!Number.isFinite(u.gid)) {
        const inferred = this.resolveGidFromRole(u.role || u.raw?.rolename || u.raw?.role || '');
        (u as any).gid = Number.isFinite(Number(inferred)) ? Number(inferred) : (u.gid ?? 99);
      }
      return u;
    });
  }

  constructor(
    private apiService: ApiService,
    private companyContextService: CompanyContextService,
    private toast: ToastService,
    private router: Router,
    private confirmService: ConfirmService
  ) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.loadRoleTypes();
    this.loadAccounts(); 
    this.loadUsers();
  }

  private loadRoleTypes() {
    this.apiService.adminGetUserRoleTypes().subscribe({
      next: (roles) => {
        this.roleTypes = roles || [];
        
        this.roleMap.clear();
        this.roleTypes.forEach(role => {
          if ((role.gid || role.Gid || role.id) && (role.rolename || role.name)) {
            const gid = Number(role.gid ?? role.Gid ?? role.id);
            const name = role.rolename ?? role.name;
            this.roleMap.set(gid, name);
          }
        });

        
        if (!this.roleMap.size) {
          this.roleMap.set(1, 'Site Admin');
          this.roleMap.set(2, 'Account Admin');
          this.roleMap.set(3, 'Company User');
          this.roleMap.set(4, 'Read Only User');
        }

        
        this.applyRoleGidsToUsers();
      },
      error: (error) => {
        console.warn('Failed to load role types:', error);
        
        this.roleMap.set(1, 'Site Admin');
        this.roleMap.set(2, 'Account Admin');
        this.roleMap.set(3, 'Company User');
        this.roleMap.set(4, 'Read Only User');
      }
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    
    let company = this.companyContextService.getCompany();
    let cid = company?.cid ?? null;

    
    if (!cid && this.companyCid) {
      cid = this.companyCid;
    }

    
    if (!cid) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        cid = currentUser.cid ?? currentUser.Cid ?? null;
      } catch (e) {  }
    }

    if (!cid) {
      console.error('No CID found in context or localStorage. Users cannot be loaded without a company context.');
      this.errorMessage = 'No company selected. Please select a company to view its users.';
      this.users = [];
      this.isLoading = false;
      return;
    }

    
    cid = Number(cid);

    
    this.companyCid = cid;

    this.apiService.getUserListByCID(cid).subscribe({
      next: (data) => {
        const records = this.extractRecords(data);
        this.users = records.map(r => this.normalizeUser(r));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.users = [];
        this.isLoading = false;
      }
    });
  }

  private extractRecords(apiData: any): any[] {
    if (!apiData) { return []; }

    if (Array.isArray(apiData)) {
      const tableWithRows = apiData.find(t => t && Array.isArray(t.rows) && t.rows.length > 0);
      if (tableWithRows) {
        return tableWithRows.rows;
      }
      return apiData; 
    }

    if (apiData.rows && Array.isArray(apiData.rows)) {
      return apiData.rows;
    }

    return [apiData];
  }

  
  private applyRoleGidsToUsers() {
    if (!this.users || !this.users.length) return;
    this.users = this.users.map(u => {
      if (!Number.isFinite(u.gid) || u.gid === 99) {
        const inferred = this.resolveGidFromRole(u.role || u.raw?.rolename || u.raw?.role || '');
        (u as any).gid = Number.isFinite(Number(inferred)) ? Number(inferred) : (u.gid ?? 99);
      }
      return u;
    });
  }

  private normalizeUser(record: any): any {
    const first = record.first_name ?? record.firstName ?? record.Fname ?? record.fname ?? '';
    const last = record.last_name ?? record.lastName ?? record.Lname ?? record.lname ?? '';
    
    
    const name = record.UserName || record.userName || record.name || 
                (`${(first || '').toString()} ${(last || '').toString()}`.trim()) || 'N/A';

    
    const rawGid = record.gid ?? record.Gid ?? record.role_cd ?? record.roleId ?? null;
    let resolvedGid: number | null = Number.isFinite(Number(rawGid)) ? Number(rawGid) : null;

    
    const roleNameCandidate = (record.rolename ?? record.role ?? record.userRole ?? '').toString();
    if (!resolvedGid) {
      const inferred = this.resolveGidFromRole(roleNameCandidate);
      if (inferred) resolvedGid = inferred;
    }

    
    const role = (resolvedGid ? (this.roleMap.get(Number(resolvedGid)) || roleNameCandidate) : (roleNameCandidate || 'User'));

    const activeVal = (record.isActive !== undefined) ? record.isActive : record.IsActive;
    const lockedVal = (record.locked !== undefined) ? record.locked : (record.isLocked !== undefined ? record.isLocked : (record.Locked !== undefined ? record.Locked : false));

    return {
      id: record.uid ?? record.Uid ?? record.UID ?? record.id ?? record.userId ?? 0,
      gid: Number(resolvedGid ?? 99),
      name: name,
      email: record.eMail ?? record.email ?? record.Email ?? record.user_email ?? '',
      role: role,
      company: record.company ?? record.companyName ?? record.Cid ?? record.cid ?? '',
      status: (activeVal !== undefined) ? (activeVal ? 'Active' : 'Inactive') : (record.status ?? 'Active'),
      isActive: !!activeVal,
      isLocked: !!lockedVal,
      raw: record
    };
  }

  
  private getCurrentGid(): number {
    try {
      const js = localStorage.getItem('currentUser');
      if (js) {
        const u: any = JSON.parse(js);
        
        const numeric = Number(u.gid ?? u.Gid ?? u.id ?? u.uid ?? NaN);
        if (Number.isFinite(numeric)) return numeric;
        
        const rn = (u.role || u.rolename || u.roleName || u.role_cd || '').toString();
        const inferred = this.resolveGidFromRole(rn);
        if (inferred) return inferred;
      }
    } catch (e) {  }
    
    return 99;
  }

  
  private resolveGidFromRole(roleName: string): number | null {
    if (!roleName) return null;
    const rn = roleName.toString().toLowerCase().trim();
    for (const [gid, name] of this.roleMap) {
      if (!name) continue;
      if (name.toString().toLowerCase() === rn) return Number(gid);
      if (name.toString().toLowerCase().includes(rn) || rn.includes(name.toString().toLowerCase())) return Number(gid);
    }
    
    if (rn.includes('site')) return 1;
    if (rn.includes('account')) return 2;
    if (rn.includes('company')) return 3;
    if (rn.includes('read')) return 4;
    return null;
  }

  
  public isAdmin(): boolean {
    return this.router.url.includes('/admin');
  }

  
  public canManageUser(target: any): boolean {
    if (!target) return false;
    const currentGid = this.getCurrentGid();
    
    let targetGid = Number(target.gid ?? target.raw?.gid ?? target.raw?.Gid ?? NaN);
    if (!Number.isFinite(targetGid)) {
      const roleName = (target.role || target.raw?.rolename || target.raw?.role || '').toString();
      const inferred = this.resolveGidFromRole(roleName);
      targetGid = Number.isFinite(Number(inferred)) ? Number(inferred) : 99;
    }

    
    return Number.isFinite(currentGid) && Number.isFinite(targetGid) && (currentGid < targetGid);
  }

  async deleteUser(userId: number) {
    const target = this.users.find(u => u.id === userId);
    if (target && !this.canManageUser(target)) {
      this.toast.warning('You do not have permission to delete this user.');
      return;
    }

    if (!await this.confirmService.show('Are you sure you want to delete this user?', 'Confirm Delete', 'Delete', 'Cancel')) {
      return;
    }

    this.isLoading = true;
    this.apiService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.toast.error('Failed to delete user. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onEditUser(user: any) {
    
    if (!this.canManageUser(user)) {
      this.toast.warning('You do not have permission to edit this user.');
      return;
    }

    
    this.isLoading = true;
    this.apiService.getUserByID(user.id).subscribe({
      next: (data) => {
        
        let userRecord: any = null;
        let userCompanies: any[] = [];
        
        if (Array.isArray(data)) {
          
          const userTable = data.find((t: any) => t.tableName === 'Table' || (Array.isArray(t.rows) && t.rows[0]?.uid));
          if (userTable && Array.isArray(userTable.rows)) {
            userRecord = userTable.rows[0];
          }
          
          
          const companyTable = data.find((t: any) => t.tableName === 'Table1');
          if (companyTable && Array.isArray(companyTable.rows)) {
            userCompanies = companyTable.rows.map((c: any) => c.cid);
          }
        } else {
          userRecord = data;
        }
        
        const record = userRecord ?? this.extractRecords(data)?.[0] ?? data;
        
        
        this.currentEditUser = {
          id: record.uid ?? record.Uid ?? record.id ?? record.userId ?? user.id,
          gid: record.gid ?? record.Gid ?? (record.rolename === 'Read Only User' || record.role === 'Read Only User' ? 4 : 3),
          firstName: record.firstName ?? record.first_name ?? record.fname ?? record.Fname ?? '',
          lastName: record.lastName ?? record.last_name ?? record.lname ?? record.Lname ?? '',
          email: record.eMail ?? record.email ?? record.Email ?? '',
          role: record.role ?? record.role_cd ?? record.userRole ?? 'company',
          selectedCompanies: userCompanies.length > 0 ? userCompanies : [record.cid ?? record.company ?? record.companyId ?? record.Cid ?? user.raw?.cid ?? user.raw?.Cid ?? ''],
          workPhone: record.phone ?? record.workPhone ?? record.work_phone ?? '',
          mobilePhone: record.mobile ?? record.mobilePhone ?? record.mobile_phone ?? '',
          isLocked: !!(record.locked ?? record.isLocked ?? record.Locked ?? false),
          aid: record.aid ?? record.Aid ?? record.AccountID ?? record.account_id ?? user.raw?.aid ?? user.raw?.Aid ?? ''
        };
        this.isLoading = false;
        this.isAddUserOpen = true;
        this.isEditMode = true;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.toast.error('Failed to load user for editing. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onToggleActive(user: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    const payload: any = {
      uid: user.id,
      isActive: isChecked
    };
    this.apiService.updateUser(payload).subscribe({
      next: () => {
        user.status = isChecked ? 'Active' : 'Inactive';
      },
      error: (error) => {
        console.error('Error updating user active status:', error);
        this.toast.error('Failed to update user status. Please try again.');
        
        user.isActive = !isChecked;
      }
    });
  }

  onUserSaved(saved: any) {
    
    if (this.isEditMode && saved && saved.id) {
      
      let currentModifierId = 0;
      try {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
          const u = JSON.parse(userJson);
          currentModifierId = Number(u.uid ?? u.id ?? 0);
        }
      } catch (e) {  }

      
      const companies = Array.isArray(saved.selectedCompanies) && saved.selectedCompanies.length > 0 
        ? saved.selectedCompanies 
        : (saved.selectedCompany ? [saved.selectedCompany] : []);
      
      const primaryCompany = companies.length > 0 ? companies[0] : 1;

      const payload = {
        uid: saved.id,
        firstName: saved.firstName,
        lastName: saved.lastName,
        eMail: saved.email,
        phone: saved.workPhone,
        mobile: saved.mobilePhone,
        password: saved.password || null,
        companyIds: companies.length > 0 ? companies.join(',') : null,
        modifiedUID: currentModifierId,
        gid: saved.roleGid ? Number(saved.roleGid) : 3,
        cid: Number(primaryCompany.toString().replace(/\D/g, '')) || 1,
        isPassChange: !!saved.password,
        locked: !!saved.isLocked,
        fullName: `${saved.firstName} ${saved.lastName}`.trim()
      };

      this.apiService.updateUser(payload).subscribe({
        next: () => {
          this.toast.success('User updated successfully!');
          this.isEditMode = false;
          this.currentEditUser = null;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.toast.error('Failed to update user. Please try again.');
        }
      });
    } else {
      
      const currentModifierId = (() => {
        try {
          const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
          return Number(u.uid ?? u.id ?? 0);
        } catch { return 0; }
      })();

      
      let companies = Array.isArray(saved.selectedCompanies) && saved.selectedCompanies.length > 0 
        ? saved.selectedCompanies 
        : (saved.selectedCompany ? [saved.selectedCompany] : []);
      
      
      if (companies.length === 0) {
        const currentCompany = this.companyContextService.getCompany();
        if (currentCompany && currentCompany.cid) {
          companies = [currentCompany.cid];
        }
      }
      
      const primaryCompany = companies.length > 0 ? companies[0] : 1;

      const payload = {
        uid: currentModifierId,
        firstName: saved.firstName,
        lastName: saved.lastName,
        eMail: saved.email,
        password: saved.password,
        phone: saved.workPhone,
        mobile: saved.mobilePhone,
        companyIds: companies.length > 0 ? companies.join(',') : null,
        modifiedUID: currentModifierId,
        gid: saved.roleGid ? Number(saved.roleGid) : 3,
        cid: Number(primaryCompany.toString().replace(/\D/g, '')) || 1,
        isPassChange: true,
        locked: !!saved.isLocked,
        fullName: `${saved.firstName} ${saved.lastName}`.trim()
      };

      this.apiService.createUser(payload).subscribe({
        next: () => {
          this.toast.success('User created successfully!');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.toast.error('Failed to create user. Please try again.');
        }
      });
    }
  }

  toggleFilter(column: string, event: Event) {
    event.stopPropagation();
    this.activeFilter = this.activeFilter === column ? null : column;
  }

  loadAccounts() {
    this.apiService.adminGetAccounts().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.accounts = data.map(a => ({
            aid: a.aid ?? a.AID,
            accName: a.accName ?? a.accountName ?? a.name ?? 'Unknown'
          }));

          
          const company = this.companyContextService.getCompany();
          if (company?.aid && !this.accountAid) {
            this.accountAid = company.aid;
          } else if (this.accounts.length > 0 && !this.accountAid) {
            this.accountAid = this.accounts[0].aid;
          }

          
          if (this.accountAid) {
            this.loadCompaniesForAccount(this.accountAid);
          }
        }
      },
      error: (err) => console.error('Error loading accounts:', err)
    });
  }

  onAccountChange() {
    if (this.accountAid) {
      
      this.companyCid = null;
      this.users = [];
      
      this.loadCompaniesForAccount(this.accountAid);
    }
  }

  loadCompaniesForCurrentAccount() {
    const company = this.companyContextService.getCompany();
    const aid = company?.aid;
    
    if (aid) {
      this.loadCompaniesForAccount(aid);
      return;
    }
    
    
    if (this.accounts.length > 0) {
      this.loadCompaniesForAccount(this.accounts[0].aid);
      return;
    }
  }

  private loadCompaniesForAccount(aid: number) {
    this.accountAid = aid;
    
    
    this.apiService.adminGetCompaniesByAID(aid).subscribe({
      next: (data: any) => {
        const companies = Array.isArray(data) ? data : 
                         (data?.rows ? data.rows : 
                          (data?.data ? data.data : []));
        
        this.companies = companies.map((c: any) => ({
          cid: c.cid ?? parseInt(c.company_id, 10) ?? parseInt(c.id, 10),
          name: c.Title ?? c.Company ?? c.company_name ?? c.name ?? 'Unknown',
          aid: c.aid ?? c.AID ?? aid
        }));

        
        if (this.companies.length > 0 && !this.companyCid) {
          const ctx = this.companyContextService.getCompany();
          const ctxCid = ctx?.cid ? Number(ctx.cid) : null;
          const matched = ctxCid ? this.companies.find(c => c.cid === ctxCid) : null;
          this.companyCid = matched ? matched.cid : this.companies[0].cid;
          this.onCompanyChange();
        }
      },
      error: (err) => console.error('Error loading companies for account:', err)
    });
  }

  onCompanyChange() {
    if (this.companyCid) {
      
      const selectedCompany = this.companies.find(c => c.cid === this.companyCid);
      if (selectedCompany) {
        const company = this.companyContextService.getCompany();
        this.companyContextService.setCompany({
          ...company,
          aid: this.accountAid,
          cid: this.companyCid,
          name: selectedCompany.name,
          Title: selectedCompany.name
        });
      }
      
      this.loadUsers();
    }
  }

  openAddUser() {
    this.isEditMode = false;
    
    this.currentEditUser = {
      cid: this.companyCid,
      selectedCompany: this.companyCid ? this.companyCid.toString() : '',
      selectedCompanies: this.companyCid ? [this.companyCid] : [],
      aid: this.accountAid
    };
    this.isAddUserOpen = true;
  }

  onUserAdded(user: any) {
    console.log('New user data:', user);
    
    this.users.unshift({
      id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role === 'company' ? 'Company User' : 'Read Only User',
      status: 'Active'
    });
  }

  onAddModalOpenChange(isOpen: boolean) {
    if (!isOpen) {
      
      this.isEditMode = false;
      this.currentEditUser = null;
    }
  }
}
