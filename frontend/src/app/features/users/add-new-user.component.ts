import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';

@Component({
  selector: 'app-add-new-user',
  standalone: true,
  imports: [CommonModule, FormsModule, SanitizeInputDirective],
  template: `
    <div class="modal-overlay" *ngIf="open" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="breadcrumbs">{{ mode === 'edit' ? 'MBRDB >> Manage Users >> Edit User' : 'MBRDB >> Manage Users >> Add New User' }}</div>
            <h2 class="modal-title">{{ mode === 'edit' ? 'Edit User' : 'Add New User' }}</h2>
          </div>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <div class="add-user-layout">
            <!-- Left Column: Selection Section -->
            <div class="selection-section">
              <!-- Role Selection -->
              <div class="role-card">
                <span class="label">Role: <span class="required">*</span></span>
                <div class="radio-grid">
                  <label class="radio-container-custom" *ngFor="let role of userRoles">
                    <input type="radio" name="roleGid" [(ngModel)]="userData.roleGid" [value]="role.gid">
                    <span class="radio-mark"></span>
                    {{ role.rolename }}
                  </label>
                  <!-- Fallback if API hasn't returned yet -->
                  <ng-container *ngIf="userRoles.length === 0">
                    <label class="radio-container-custom">
                      <input type="radio" name="role" [(ngModel)]="userData.roleGid" [value]="1">
                      <span class="radio-mark"></span>
                      Site Admin
                    </label>
                    <label class="radio-container-custom">
                      <input type="radio" name="role" [(ngModel)]="userData.roleGid" [value]="2">
                      <span class="radio-mark"></span>
                      Account Admin
                    </label>
                    <label class="radio-container-custom">
                      <input type="radio" name="role" [(ngModel)]="userData.roleGid" [value]="3">
                      <span class="radio-mark"></span>
                      Company User
                    </label>
                    <label class="radio-container-custom">
                      <input type="radio" name="role" [(ngModel)]="userData.roleGid" [value]="4">
                      <span class="radio-mark"></span>
                      Read Only User
                    </label>
                  </ng-container>
                </div>


              </div>

              <!-- Company Selection Card -->
              <div class="selection-card">
                <div class="card-header-inner">
                  <div class="icon-building">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22"/><line x1="15" y1="22" x2="15" y2="22"/><path d="M12 2v20"/><path d="M2 22h20"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M16 18h.01"/></svg>
                  </div>
                  <h3 class="card-title-inner">Company Selection</h3>
                </div>
                
                <p class="card-desc">Select a company from the list below to view and manage its details</p>
                
                <div class="selection-controls">
                  <div class="form-group">
                    <label class="field-label-small">Account Group</label>
                    <select [(ngModel)]="userData.accountGroup" (ngModelChange)="onAccountGroupChange($event)" class="form-control-small">
                      <option value="">--Select All--</option>
                      <option *ngFor="let group of accountGroups" [value]="group.id">{{ group.name }}</option>
                    </select>
                  </div>

                  <div class="search-box">
                    <div class="search-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <input type="text" placeholder="Search companies..." [(ngModel)]="searchTerm" class="form-control-small search-input">
                  </div>
                </div>

                <div class="company-list-section">
                  <h4 class="section-title">User Companies</h4>
                  <div class="company-list">
                    <label class="checkbox-company-row" *ngFor="let company of filteredCompanies">
                      <input type="checkbox" 
                             [checked]="isCompanySelected(company.id)"
                             (change)="toggleCompanySelection(company.id, $event)">
                      <span class="checkmark-company"></span>
                      <span class="company-text">{{ company.name }}</span>
                    </label>
                    <div *ngIf="filteredCompanies.length === 0" class="muted p-2" style="font-size: 12px;">
                      No companies found matching your search.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Form Section -->
            <div class="form-section">
              <div class="form-group">
                <label class="field-label">First Name : <span class="required">*</span></label>
                <input type="text" [(ngModel)]="userData.firstName" class="form-control">
              </div>

              <div class="form-group">
                <label class="field-label">Last Name : <span class="required">*</span></label>
                <input type="text" [(ngModel)]="userData.lastName" class="form-control">
              </div>

              <div class="form-group">
                <label class="field-label">Email: <span class="required">*</span></label>
                <input type="email" [(ngModel)]="userData.email" class="form-control" maxlength="100">
              </div>

              <div class="form-group">
                <div class="label-row">
                  <label class="field-label">Password: <span class="required" *ngIf="mode === 'add'">*</span></label>
                  <div style="display: flex; gap: 16px; align-items: center;">
                    <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="userData.autoGenerate" (ngModelChange)="onAutoGenerateChange($event)">
                      <span class="checkmark"></span>
                      <span style="font-size: 11px; margin-left: 24px; font-weight: 600; color: #2B3674;">Auto Generate</span>
                    </label>
                    <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="userData.isLocked">
                      <span class="checkmark"></span>
                      <span style="font-size: 11px; margin-left: 24px; font-weight: 600; color: #2B3674;">Locked</span>
                    </label>
                  </div>
                </div>
                <div class="password-input-wrapper">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="userData.password" class="form-control" maxlength="24">
                  <button type="button" class="btn-eye" (click)="togglePasswordVisibility()" [attr.aria-pressed]="showPassword" title="Show / Hide Password">
                    <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  </button>
                </div>
                <small class="helper-text">(Auto-generate: 8 characters (1 uppercase, 1 number; others lowercase). Manual: 8 to 24 characters with at least one number.)</small>
                <small class="muted" *ngIf="mode === 'edit'">Leave password blank to keep the existing password (optional).</small>
                <small class="muted" *ngIf="mode === 'add'" style="display:block; margin-top:6px;">Password is required when adding a user.</small>
              </div>

              <div class="form-group">
                <label class="field-label">Work Phone: <span class="required">*</span></label>
                <input type="text" [(ngModel)]="userData.workPhone" (input)="userData.workPhone = formatPhoneNumber(userData.workPhone)" class="form-control" placeholder="XXX-XXX-XXXX">
              </div>

              <div class="form-group">
                <label class="field-label">Mobile Phone: <span class="required">*</span></label>
                <input type="text" [(ngModel)]="userData.mobilePhone" (input)="userData.mobilePhone = formatPhoneNumber(userData.mobilePhone)" class="form-control" placeholder="XXX-XXX-XXXX">
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-actions">
            <button class="btn-modal btn-submit" (click)="onSave()">{{ mode === 'edit' ? 'Save' : 'Add' }}</button>
            <button class="btn-modal btn-reset" (click)="onReset()">Reset</button>
            <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./add-new-user.component.scss']
})

export class AddNewUserComponent implements OnChanges, OnInit {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saveEvent = new EventEmitter<any>();

  
  @Input() initialData: any = null;
  @Input() mode: 'add' | 'edit' = 'add';

  private apiService = inject(ApiService);
  private companyContextService = inject(CompanyContextService);
  private toast = inject(ToastService);



  searchTerm = '';
  userData = {
    roleGid: 3,
    accountGroup: '',
    selectedCompany: '',
    selectedCompanies: [] as any[],
    firstName: '',
    lastName: '',
    email: '',
    autoGenerate: false,
    isLocked: false,
    password: '',
    workPhone: '',
    mobilePhone: '',
    aid: '' as string | number
  };

  
  showPassword = false;

  companies: any[] = [];
  accountGroups: any[] = [];
  userRoles: any[] = [];

  get filteredCompanies() {
    let list = this.companies;
    
    
    

    if (!this.searchTerm) return list;
    const term = this.searchTerm.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.id.toString().toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    this.initialFetch();
  }

  fetchRoles() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isSiteAdmin = Number(currentUser.gid) === 1;
    
    
    const roleTypesCall = isSiteAdmin
      ? this.apiService.adminGetUserRoleTypes()
      : this.apiService.getUserRoleTypes();
    
    roleTypesCall.subscribe({
      next: (roles) => {
        if (Array.isArray(roles)) {
          this.userRoles = roles;
          console.log('Roles loaded:', this.userRoles);
        }
      },
      error: (err) => console.error('Error fetching role types:', err)
    });
  }

  initialFetch() {
    let targetCid: number | null = null;
    let targetAid: number | null = null;

    if (this.mode === 'edit' && this.userData.selectedCompany) {
      targetCid = Number(this.userData.selectedCompany);
      targetAid = this.userData.aid ? Number(this.userData.aid) : null;
    } else if (this.mode === 'add') {
      
      if (this.userData.selectedCompany) {
        targetCid = Number(this.userData.selectedCompany);
      }
      if (this.userData.aid) {
        targetAid = Number(this.userData.aid);
      }

      
      if (!targetCid && !targetAid) {
        const company = this.companyContextService.getCompany();
        if (company) {
          targetCid = company.cid ?? company.company_id ?? company.id;
          targetAid = company.aid ?? null;
        }
      }

      
      if (!targetAid && !targetCid) {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          targetAid = currentUser.aid ?? currentUser.Aid ?? currentUser.AccountID ?? null;
        } catch (e) {  }
      }
    } else {
      const company = this.companyContextService.getCompany();
      targetCid = company?.cid ?? company?.company_id ?? company?.id;
    }
    
    
    this.fetchRoles();
    const agid = this.userData.accountGroup ? Number(this.userData.accountGroup) : 0;
    this.loadCompanies(agid);

    
    if (targetAid) {
      this.loadAccountGroups(targetAid);
    } else if (targetCid) {
      
      this.apiService.getAccountAndCompanyByCID(targetCid).subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            const resolvedAid = data[0]?.account_id ?? data[0]?.aid;
            if (resolvedAid) {
              this.loadAccountGroups(resolvedAid);
            }
          }
        },
        error: (err) => console.error('Error fetching account/company by CID:', err)
      });
    }

    
    if (this.mode === 'add' && targetCid && !this.userData.selectedCompany) {
      this.userData.selectedCompany = targetCid.toString();
      if (!this.userData.selectedCompanies.includes(targetCid)) {
        this.userData.selectedCompanies = [targetCid];
      }
    }
  }

  loadCompanies(agid: number = 0) {
    this.apiService.getCompanyListByUIDAGID(this.getUidFromStorage(), agid).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.companies = data.map(c => ({
            name: c.Title ?? c.company_name ?? c.name ?? 'Unknown',
            id: c.company_id ?? c.cid ?? c.id ?? '',
            gid: c.gid ?? c.groupId ?? c.agid ?? ''
          }));
          console.log(`Loaded companies for AGID ${agid}:`, this.companies);
        }
      },
      error: (err) => console.error('Error fetching companies by UID/AGID:', err)
    });
  }

  onAccountGroupChange(groupId: any) {
    const agid = groupId ? Number(groupId) : 0;
    this.loadCompanies(agid);
  }

  private resolveAidFromCid(cid: number): Observable<number | null> {
    return new Observable(observer => {
      this.apiService.getAccountAndCompanyByCID(cid).subscribe({
        next: (data) => {
          const aid = Array.isArray(data) && data[0] ? (data[0]?.account_id ?? data[0]?.aid) : null;
          observer.next(aid);
          observer.complete();
        },
        error: (err) => {
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  private getUidFromStorage(): number {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.uid || user.id || 1;
      }
    } catch (e) { }
    return 1;
  }

  loadAccountGroups(aid: number) {
    this.apiService.getAccountGroupsByAIDWithParams(aid, 'accountgroup', 'agid', 'groupname').subscribe({
      next: (data: any) => {
        let groups: any[] = [];
        
        
        if (Array.isArray(data)) {
          groups = data;
        }
        
        
        this.accountGroups = groups
          .filter((g: any) => {
            const id = g?.agid ?? g?.gid ?? g?.groupId ?? g?.id;
            const name = (g?.groupname ?? g?.groupName ?? g?.name ?? '').toString().trim();
            const count = g?.groupcount ?? 0;
            
            return id !== -1 && id !== '-1' && name.length > 0 && count > 0;
          })
          .map(g => ({
            id: g.agid ?? g.gid ?? g.groupId ?? g.id,
            name: g.groupname ?? g.groupName ?? g.name ?? 'Unnamed',
            count: g.groupcount
          }));
        
        console.log('Loaded account groups:', this.accountGroups);
      },
      error: (err) => console.error('Error fetching account groups:', err)
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData) {
      
      this.userData = {
        roleGid: this.initialData.gid ?? this.initialData.roleGid ?? (this.initialData.role === 'readonly' ? 4 : 3),
        accountGroup: '',
        selectedCompany: this.initialData.selectedCompany?.toString() ?? this.userData.selectedCompany,
        selectedCompanies: Array.isArray(this.initialData.selectedCompanies) ? this.initialData.selectedCompanies : (this.initialData.selectedCompany ? [this.initialData.selectedCompany] : []),
        firstName: this.initialData.firstName ?? this.userData.firstName,
        lastName: this.initialData.lastName ?? this.userData.lastName,
        email: this.initialData.email ?? this.userData.email,
        autoGenerate: false,
        isLocked: !!(this.initialData.isLocked ?? this.initialData.locked),
        password: '',
        workPhone: this.initialData.workPhone ?? this.userData.workPhone,
        mobilePhone: this.initialData.mobilePhone ?? this.userData.mobilePhone,
        aid: this.initialData.aid ?? ''
      };
      
      
      if (this.mode === 'edit' && this.userData.aid) {
        this.initialFetch();
      }
    }
    
    if (changes['open'] && this.open && this.mode === 'add') {
      
      this.initialFetch();
    }
  }

  closeModal() {
    this.open = false;
    this.openChange.emit(false);
  }

  isCompanySelected(companyId: any): boolean {
    return this.userData.selectedCompanies.includes(Number(companyId));
  }

  toggleCompanySelection(companyId: any, event: any) {
    const id = Number(companyId);
    if (event.target.checked) {
      if (!this.userData.selectedCompanies.includes(id)) {
        this.userData.selectedCompanies.push(id);
      }
    } else {
      this.userData.selectedCompanies = this.userData.selectedCompanies.filter(c => c !== id);
    }
    console.log('Selected companies:', this.userData.selectedCompanies);
  }

  
  
  

  private generatePassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    
    const pwdChars: string[] = [];
    pwdChars.push(upper[Math.floor(Math.random() * upper.length)]);
    pwdChars.push(digits[Math.floor(Math.random() * digits.length)]);
    for (let i = 0; i < 6; i++) {
      pwdChars.push(lower[Math.floor(Math.random() * lower.length)]);
    }

    
    for (let i = pwdChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pwdChars[i]; pwdChars[i] = pwdChars[j]; pwdChars[j] = tmp;
    }
    return pwdChars.join('');
  }

  onAutoGenerateChange(checked: boolean) {
    if (checked) {
      this.userData.password = this.generatePassword();
    } else {
      
      this.userData.password = '';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  formatPhoneNumber(value: any): string {
    if (!value) return '';
    
    let cleaned = value.toString().replace(/\D/g, '');
    
    
    cleaned = cleaned.substring(0, 10);
    
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  onSave() {
    
    
    

    const pwdRaw = (this.userData.password || '').toString();

    
    if (this.userData.autoGenerate) {
      if (!pwdRaw) {
        this.userData.password = this.generatePassword();
      }
    }

    
    if (this.mode === 'add') {
      const pwd = (this.userData.password || '').toString();
      if (!pwd || pwd.length < 8 || pwd.length > 24 || !/[0-9]/.test(pwd)) {
        this.toast.warning('Password is required for new users and must be 8 to 24 characters and include at least one number.');
        return;
      }
    }

    
    if (this.mode === 'edit') {
      const pwd = (this.userData.password || '').toString();
      if (pwd && (pwd.length < 8 || pwd.length > 24 || !/[0-9]/.test(pwd))) {
        this.toast.warning('When updating password it must be 8 to 24 characters and include at least one number.');
        return;
      }
    }

    
    const payload: any = { ...this.userData };
    if (this.mode === 'edit') {
      if (!pwdRaw) {
        
        delete payload.password;
        payload.autoGenerate = false;
      }
      if (this.initialData && this.initialData.id) {
        payload.id = this.initialData.id;
        payload.uid = this.initialData.uid ?? this.initialData.id;
      }
      payload.aid = this.initialData?.aid ?? this.userData.aid ?? '';
    }

    
    this.saveEvent.emit(payload);
    this.closeModal();
  }

  onReset() {
    this.userData = {
      roleGid: 3,
      accountGroup: '',
      selectedCompany: this.userData.selectedCompany, 
      selectedCompanies: [],
      firstName: '',
      lastName: '',
      email: '',
      autoGenerate: false,
      isLocked: false,
      password: '',
      workPhone: '',
      mobilePhone: '',
      aid: ''
    };
    this.loadCompanies(0);
  }
}
