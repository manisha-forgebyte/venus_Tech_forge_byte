import { Component, OnInit, inject } from '@angular/core';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UpdateCompanyComponent } from './update-company.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { HtmlEntityEncoderService } from '../../core/services/html-entity-encoder.service';
import { Observable } from 'rxjs';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { DateFormatterService } from '../../core/services/date-formatter.service';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UpdateCompanyComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective, FormatDatePipe],
  template: `
    <div class="page-container">
      <div class="company-page-layout">
        <!-- Main Content -->
        <div class="main-content">
          <!-- Company Details Header Card -->
          <div class="card header-card">
            <div class="header-left">
              <h2 class="card-title">Company Details</h2>
              <p class="card-sub-text">Manage company information and settings</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-outline" (click)="openUpdate()">Update Company</button>
              <button class="btn btn-primary" *ngIf="isAllowCompAdd" (click)="openAdd()">Add Company</button>
            </div>
          </div>

          <!-- Loading State -->
          <app-skeleton-loader *ngIf="isLoading" type="card" [rows]="6" [columns]="2"></app-skeleton-loader>

          <!-- Company Information Card -->
          <div class="card info-card" *ngIf="!isLoading">
            <div class="card-header">
              <div class="card-title">
                <span class="icon-grid"></span>
                Company Information
              </div>
            </div>
            
            <div class="info-grid">
              <div class="form-row">
                <label class="field-label"><span class="icon-building"></span> Company ID</label>
                <div class="input-container">
                  <input class="form-control" [(ngModel)]="company.company_id" disabled />
                  <span class="badge-active" *ngIf="company.IsActive">Active</span>
                </div>
              </div>
              <div class="form-row">
                <label class="field-label"><span class="icon-building"></span> Company Name</label>
                <div class="input-container">
                  <input class="form-control" [(ngModel)]="company.Title" disabled />
                </div>
              </div>
              <div class="form-row">
                <label class="field-label"><span class="icon-mail"></span> FERC Validation Email</label>
                <div class="input-container">
                  <input class="form-control" [(ngModel)]="company.email" disabled />
                </div>
              </div>
              
              <div class="form-row">
                <label class="field-label"><span class="icon-key"></span> FERC Password</label>
                <div class="input-container">
                  <input class="form-control" type="password" [(ngModel)]="company.FERCPassword" placeholder="•••••••" disabled />
                </div>
              </div>

              <div class="form-row">
                <label class="field-label"><span class="icon-file"></span> Notes</label>
                <div class="input-container">
                  <textarea class="form-control" rows="2" [(ngModel)]="company.description" placeholder="Add any additional notes here..." disabled></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Group Details Card -->
          <div class="card account-card" *ngIf="!isLoading">
            <div class="card-header">
              <div class="card-title">Account Group Details</div>
            </div>
            
            <div class="account-details-grid">
              <!-- Row 1 -->
              <div class="detail-item">
                <span class="detail-label">Contact Person</span>
                <span class="detail-value">{{company.ContactName || 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"><span class="icon-calendar"></span> Start Date</span>
                <span class="detail-value">{{company.StartDate ? (company.StartDate | formatDate) : 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"><span class="icon-calendar"></span> Expire Date</span>
                <span class="detail-value">{{company.ExpireDate ? (company.ExpireDate | formatDate) : 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Filing Size</span>
                <span class="badge-size">{{company.fsize || company.size || 'N/A'}}</span>
              </div>
              
              <!-- Row 2 -->
              <div class="detail-item">
                <span class="detail-label">Billing Person</span>
                <span class="detail-value">{{company.BillingName || 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Billing Email</span>
                <span class="detail-value">{{company.billing_email || company.email || 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"><span class="icon-phone"></span> Phone 1</span>
                <span class="detail-value">{{company.phone1 || 'N/A'}}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label"><span class="icon-phone"></span> Phone 2</span>
                <span class="detail-value">{{company.phone2 || 'N/A'}}</span>
              </div>
              
              <!-- Row 3: [Active col1] | [Annual Subscription col2] | [empty col3] | [empty col4] -->
              <div class="detail-item checkbox-item">
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="company.IsActive" disabled />
                  <span>Active</span>
                </label>
              </div>
              <div class="detail-item checkbox-item">
                <label class="checkbox-label">
                  <input type="checkbox" [checked]="company.IsAnnual" disabled />
                  <span>Annual Subscription</span>
                </label>
              </div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="company-sidebar">
          <div class="card selection-card">
            <div class="card-header">
              <div class="card-title">
                <span class="icon-building"></span>
                Company Selection
              </div>
            </div>
            <p class="card-sub-text">Select a company from the list below to view and manage its details</p>
            
            <div class="filter-controls">
              <div class="filter-field">
                <label class="field-label">Account Group</label>
                <select class="form-control" [(ngModel)]="selectedGroupId" (change)="onGroupChange()">
                  <option [ngValue]="undefined">--Select All--</option>
                  <option *ngFor="let g of accountGroups" [ngValue]="g.agid">{{g.groupName}}</option>
                </select>
              </div>
              <div class="search-field">
                <div class="search-wrapper">
                  <span class="icon-search">🔍</span>
                  <input class="form-control" placeholder="Search companies..." [(ngModel)]="searchTerm" />
                </div>
              </div>
            </div>

            <div class="list-section">
              <h4 class="section-title">Default Company</h4>
              <div class="company-list">
                <div *ngFor="let c of filteredCompanies; let i = index" 
                     class="company-list-item" 
                     [class.active]="c.cid == selectedCompanyId"
                     (click)="selectCompany(c)">
                  <div class="radio-circle" [class.checked]="c.cid == selectedCompanyId"></div>
                  <div class="company-info">
                    <span class="name">{{c.Title}}{{c.company_id ? ' (' + c.company_id + ')' : ''}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

    <app-update-company [open]="isUpdateMode" (openChange)="onModalClose($event)" [company]="company" [isAdd]="isAdd" [groups]="accountGroups" [isAdmin]="isAdminMode()" (saveEvent)="onSave($event)"></app-update-company>
  `,
  styleUrls: ['./company-page.component.scss']
})
export class CompanyPageComponent implements OnInit {
  isUpdateMode = false;
  isLoading = false;
  errorMessage = '';
  selectedCompanyId: number = 0;
  accountId: number = 1;
  private userUid: number = 0;
  isAdd = false;
  isAllowCompAdd = false;

  company: any = {
    cid: null,
    company_id: '',
    Title: '',
    ContactName: '',
    BillingName: '',
    email: '',
    billing_email: '',
    phone1: '',
    phone2: '',
    description: '',
    FERCPassword: '',
    IsActive: false,
    IsAnnual: false,
    StartDate: null,
    ExpireDate: null,
    SDate: null,
    EDate: null,
    validation_email: '',
    
    fsize: '',
    size: '',
    prog_code: '',
    groupname: '',
    grade: null,
    price: 0,
    aid: null,
    agid: null,
    ModifiedDate: null,
    modifieduid: null,
    sizeid: null,
    
    isPassChange: false,
    filingServicePrice: 0,
    isVenusFile: false,
    isFilingService: false,
    isFilingServicePremium: false,
    incAuth: false,
    incCS: false,
    incMit: false,
    incOR: false,
    incSL: false,
    incEtoE: false,
    incEtoGen: false,
    incEtoPPA: false,
    incEtoVA: false,
    incIMSS: false,
    incIPSS: false,
    copyAllAuth: false,
    copyAllCS: false,
    copyAllMit: false,
    copyAllOR: false,
    copyAllSL: false,
    copyAllEtoE: false,
    copyAllEtoGen: false,
    copyAllEtoPPA: false,
    copyAllEtoVA: false,
    copyAllIMSS: false,
    copyAllIPSS: false,
    copyToCID: null,
    uid: null
  };

  companies: any[] = [];
  accountGroups: any[] = [];
  selectedGroupId: number | null | undefined = undefined;
  searchTerm: string = '';
  defaultCompany: any = null;

  get filteredCompanies() {
    let filtered = [...this.companies]; 

    if (this.selectedGroupId) {
      filtered = filtered.filter(c => c.agid == this.selectedGroupId);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.Title && c.Title.toLowerCase().includes(term)) ||
        (c.company_id && c.company_id.toString().toLowerCase().includes(term)) ||
        (c.cid && c.cid.toString().includes(term))
      );
    }

    
    if (this.selectedCompanyId) {
      filtered.sort((a, b) => {
        if (a.cid == this.selectedCompanyId) return -1;
        if (b.cid == this.selectedCompanyId) return 1;
        return 0;
      });
    }

    return filtered;
  }

  private htmlEntityEncoder = inject(HtmlEntityEncoderService);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private companyContextService: CompanyContextService,
    private toast: ToastService,
    private dateFormatter: DateFormatterService
  ) { }

  ngOnInit() {
    
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('[CompanyPage] currentUser keys:', Object.keys(user));
        console.log('[CompanyPage] currentUser data:', user);
        
        this.userUid = Number(
          user.uid ?? user.Uid ?? user.UID ??
          user.GID ?? user.gid ??
          user.id ?? user.Id ?? user.ID ??
          user.UserID ?? user.userId ?? user.UserId ??
          user.userID ?? 0
        );
        this.accountId = Number(
          user.aid ?? user.Aid ?? user.AID ??
          user.AccountId ?? user.accountId ??
          this.accountId
        );
        
        if (!this.accountId || this.accountId === 0) {
          this.accountId = 1;
        }
        console.log('[CompanyPage] Resolved userUid:', this.userUid, '| accountId:', this.accountId);
      }
    } catch (e) { console.error('[CompanyPage] Error parsing currentUser', e); }

    
    const saved = this.companyContextService.getCompany();
    if (saved) {
      this.selectedCompanyId = saved.cid || saved.company_id || 0;
    }
    this.loadCompanies();
    this.loadAccountGroups();
  }

  loadAccountGroups() {
    
    this.apiService.getAccountGroupsByAIDWithParams(this.accountId, 'accountgroup', 'agid', 'groupname').subscribe({
      next: (data: any) => {
        console.log('Raw account groups:', data);
        
        let groupsData: any[] = [];
        if (Array.isArray(data)) {
          
          const table = data.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
          groupsData = table ? table.rows : data;
        } else if (data && Array.isArray(data.data)) {
          
          groupsData = data.data;
        } else if (data && data.rows && Array.isArray(data.rows)) {
          
          groupsData = data.rows;
        } else if (data && typeof data === 'object') {
          
          groupsData = [data];
        }

        
        this.accountGroups = (groupsData || [])
          .filter((g: any) => {
            if (!g) return false;
            const agid = g.agid ?? g.Agid ?? g.AGID ?? g.id ?? g.gid;
            return agid !== -1 && agid !== '-1';
          })
          .map((g: any) => {
            const rawName = g.groupName ?? g.GroupName ?? g.groupname ?? g.agName ?? g.Name ?? g.Title ?? '';
            return {
              agid: g.agid ?? g.Agid ?? g.AGID ?? g.id ?? g.gid,
              groupName: rawName.trim() || 'Unnamed Group',
              groupCount: g.groupcount ?? g.groupCount ?? 0
            };
          });
      },
      error: (error) => {
        console.error('Error loading account groups:', error);
      }
    });
  }

  loadCompanies() {
    this.isLoading = true;
    this.errorMessage = '';

    const uid = this.userUid || 0;
    const agid = this.selectedGroupId ? Number(this.selectedGroupId) : 0;

    console.log('[CompanyPage] loadCompanies → uid:', uid, '| agid:', agid, '| accountId:', this.accountId);

    if (uid > 0) {
      
      this.apiService.getCompanyListByUIDAGID(uid, agid).subscribe({
        next: (data: any) => {
          console.log('[CompanyPage] GetCompanyListByUIDAGID raw response:', data);
          const records = this.extractRecordsFromApiResponse(data);
          console.log('[CompanyPage] Extracted records count:', records.length);

          if (records && records.length > 0) {
            this.applyCompanyList(records);
          } else {
            
            console.warn('[CompanyPage] UID endpoint returned 0 records, falling back to AID endpoint');
            this.loadCompaniesByAID();
          }
        },
        error: (error: any) => {
          console.error('[CompanyPage] GetCompanyListByUIDAGID error:', error);
          
          this.loadCompaniesByAID();
        }
      });
    } else {
      
      console.warn('[CompanyPage] uid is 0, going directly to AID fallback');
      this.loadCompaniesByAID();
    }
  }

  private loadCompaniesByAID() {
    const aid = this.accountId || 1;
    console.log('[CompanyPage] loadCompaniesByAID → aid:', aid);

    this.apiService.getCompanyListByAID(aid).subscribe({
      next: (data: any) => {
        console.log('[CompanyPage] GetCompanyListByAID raw response:', data);
        const records = this.extractRecordsFromApiResponse(data);
        console.log('[CompanyPage] AID fallback records count:', records.length);

        if (records && records.length > 0) {
          this.applyCompanyList(records);
        } else {
          this.companies = [];
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('[CompanyPage] GetCompanyListByAID error:', error);
        this.errorMessage = 'Failed to load company list. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private applyCompanyList(records: any[]) {
    const normalized = records.map((d: any) => this.normalizeCompany(d));
    this.companies = normalized;
    console.log('[CompanyPage] Companies loaded:', normalized.length, normalized.map((c: any) => c.Title));

    
    const previousSelection = this.companies.find(c => c.cid == this.selectedCompanyId);
    if (previousSelection) {
      this.selectCompany(previousSelection);
    } else {
      const currentContext = this.companyContextService.getCompany();
      const contextMatch = currentContext
        ? this.companies.find(c => c.cid == (currentContext.cid || currentContext.company_id))
        : null;
      this.selectCompany(contextMatch || normalized[0]);
    }
    this.isLoading = false;
  }

  private extractRecordsFromApiResponse(data: any): any[] {
    if (!data) return [];
    if (Array.isArray(data)) {
      
      const tableWithRows = data.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
      if (tableWithRows) return tableWithRows.rows;
      
      return data;
    }
    
    if (data.rows && Array.isArray(data.rows)) return data.rows;
    if (data.data && Array.isArray(data.data)) return data.data;
    
    return [];
  }

  loadCompanyData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getCompanyByID(this.selectedCompanyId).subscribe({
      next: (data) => {
        console.log('Raw company data details from API:', data);
        const companyData = this.extraFirstRow(data);

        if (companyData) {
          
          const normalizedDetail = this.normalizeCompany(companyData);

          
          
          this.company = {
            ...this.company,
            ...Object.fromEntries(
              Object.entries(normalizedDetail).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            )
          };

          console.log('Merged company object:', this.company);
          
          this.companyContextService.setCompany(this.company);

          
          this.apiService.getAccountDetailsByCID(this.selectedCompanyId).subscribe({
            next: (accRaw) => {
              const accData = this.extraFirstRow(accRaw);
              if (accData) {
                this.isAllowCompAdd = accData.IsAllowCompAdd ?? accData.isAllowCompAdd ?? false;
              }
            },
            error: (err) => console.error('Error fetching account details for isAllowCompAdd checking:', err)
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading company:', error);

        
        if (error.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.setItem('logoutMessage', 'You have successfully logged out, please re login to access.');
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage = 'Failed to load company data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  
  private formatDateForInput(dateValue: any): string | null {
    return this.dateFormatter.formatToInputDate(dateValue) || null;
  }

  normalizeCompany(src: any): any {
    if (!src) return {};

    
    
    let directCompanyId = src.company_id ?? src.companyID ?? src.CompanyID ?? src.companyId ?? src.company_Id ?? src.company_ID ?? src.id ?? src.ID ?? '';
    let rawTitle = src.Title ?? src.title ?? src.Name ?? src.name ?? src.companyname ?? src.companyName ?? src.title_Name ?? src.Company ?? '';

    
    if (!directCompanyId && rawTitle) {
      const titleMatch = rawTitle.match(/^(.+?)\s*\(([A-Za-z0-9]+)\)\s*$/);
      if (titleMatch) {
        rawTitle = titleMatch[1].trim();
        directCompanyId = titleMatch[2];
      }
    }

    return {
      
      cid: src.cid ?? src.CID ?? src.Cid ?? src.companyId ?? src.companyID ?? src.CompanyID ?? src.company_Id ?? src.company_ID ?? null,
      company_id: directCompanyId,

      
      Title: rawTitle,
      description: src.description ?? src.notes ?? '',

      
      email: src.email ?? src.eMail ?? src.validation_email ?? src.validationEmail ?? '',
      billing_email: src.billing_email ?? src.billingEmail ?? '',
      validation_email: src.validation_email ?? src.validationEmail ?? src.VEmail ?? '',

      
      ContactName: src.ContactName ?? src.contactName ?? src.contact_name ?? '',
      BillingName: src.BillingName ?? src.billingName ?? src.billing_name ?? '',

      
      phone1: src.phone1 ?? src.phone_1 ?? '',
      phone2: src.phone2 ?? src.phone_2 ?? '',

      
      StartDate: this.formatDateForInput(src.StartDate ?? src.startDate ?? src.SDate),
      ExpireDate: this.formatDateForInput(src.ExpireDate ?? src.expireDate ?? src.EDate),
      SDate: src.SDate ?? null,
      EDate: src.EDate ?? null,
      ModifiedDate: src.ModifiedDate ?? src.modifiedDate ?? null,

      
      IsActive: !!(src.IsActive || src.isActive),
      IsAnnual: !!(src.IsAnnual || src.isAnnual),

      
      fsize: src.fsize ?? src.size ?? '',
      size: src.size ?? src.fsize ?? 1,
      prog_code: src.prog_code ?? src.progCode ?? '',
      groupname: src.groupname ?? '',
      grade: src.grade ?? null,
      price: src.price ?? 0,
      aid: src.aid ?? src.AID ?? src.Aid ?? null,
      agid: src.agid ?? src.AGID ?? src.Agid ?? null,
      ModifiedUID: src.modifieduid ?? src.modifiedUID ?? src.modifiedUid ?? null,
      sizeid: src.sizeid ?? src.sizeid1 ?? null,

      
      FERCPassword: src.FERCPassword ?? src.fercPassword ?? null,

      
      isPassChange: !!(src.isPassChange || src.IsPassChange),

      filingServicePrice: src.filingServicePrice ?? src.FilingServicePrice ?? 0,
      isVenusFile: !!(src.isVenusFile || src.IsVenusFile),
      isFilingService: !!(src.isFilingService || src.IsFilingService),
      isFilingServicePremium: !!(src.isFilingServicePremium || src.IsFilingServicePremium),
      incAuth: !!(src.incAuth || src.IncAuth),
      incCS: !!(src.incCS || src.IncCS),
      incMit: !!(src.incMit || src.IncMit),
      incOR: !!(src.incOR || src.IncOR),
      incSL: !!(src.incSL || src.IncSL),
      incEtoE: !!(src.incEtoE || src.IncEtoE),
      incEtoGen: !!(src.incEtoGen || src.IncEtoGen),
      incEtoPPA: !!(src.incEtoPPA || src.IncEtoPPA),
      incEtoVA: !!(src.incEtoVA || src.IncEtoVA),
      incIMSS: !!(src.incIMSS || src.IncIMSS),
      incIPSS: !!(src.incIPSS || src.IncIPSS),
      copyAllAuth: !!(src.copyAllAuth || src.CopyAllAuth),
      copyAllCS: !!(src.copyAllCS || src.CopyAllCS),
      copyAllMit: !!(src.copyAllMit || src.CopyAllMit),
      copyAllOR: !!(src.copyAllOR || src.CopyAllOR),
      copyAllSL: !!(src.copyAllSL || src.CopyAllSL),
      copyAllEtoE: !!(src.copyAllEtoE || src.CopyAllEtoE),
      copyAllEtoGen: !!(src.copyAllEtoGen || src.CopyAllEtoGen),
      copyAllEtoPPA: src.copyAllEtoPPA ?? false,
      copyAllEtoVA: src.copyAllEtoVA ?? false,
      copyAllIMSS: src.copyAllIMSS ?? false,
      copyAllIPSS: src.copyAllIPSS ?? false,
      copyToCID: src.copyToCID ?? null,
      uid: src.uid ?? null
    };
  }

  
  private extraFirstRow(data: any): any | null {
    if (!data) return null;
    if (Array.isArray(data)) {
      const table = data.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
      return table ? table.rows[0] : (data[0] || null);
    }
    if (data.rows && Array.isArray(data.rows)) return data.rows[0];
    return data;
  }

  saveCompany() {
    this.isLoading = true;

    this.apiService.updateCompany(this.company).subscribe({
      next: (result) => {
        console.log('Company updated:', result);
        this.toast.success('Company information updated successfully!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating company:', error);

        
        if (error.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.setItem('logoutMessage', 'You have successfully logged out, please re login to access.');
          this.router.navigate(['/login']);
          return;
        }

        this.isLoading = false;
        const errorMessage = error.error?.message || 'Failed to update company. Please try again.';
        this.toast.error(errorMessage);
      }
    });
  }

  onModalClose(val: boolean) {
    this.isUpdateMode = val;
    
    if (!val && this.isAdd) {
      this.isAdd = false;
      
      if (this.selectedCompanyId) {
        this.loadCompanyData();
      }
    }
  }

  openUpdate() {
    this.isAdd = false;
    this.isUpdateMode = true;
  }

  closeUpdate() {
    this.onModalClose(false);
  }

  openAdd() {
    this.isAdd = true;
    
    this.company = {
      cid: null,
      company_id: '',
      Title: '',
      ContactName: '',
      BillingName: '',
      email: '',
      billing_email: '',
      phone1: '',
      phone2: '',
      description: '',
      FERCPassword: '',
      IsActive: false,
      IsAnnual: false,
      StartDate: null,
      ExpireDate: null,
      SDate: null,
      EDate: null,
      validation_email: '',
      fsize: '',
      size: '',
      prog_code: '',
      groupname: '',
      grade: null,
      price: 0,
      aid: null,
      agid: null,
      ModifiedDate: null,
      modifieduid: null,
      sizeid: null,
      isPassChange: false,
      filingServicePrice: 0,
      isVenusFile: false,
      isFilingService: false,
      isFilingServicePremium: false,
      incAuth: false,
      incCS: false,
      incMit: false,
      incOR: false,
      incSL: false,
      incEtoE: false,
      incEtoGen: false,
      incEtoPPA: false,
      incEtoVA: false,
      incIMSS: false,
      incIPSS: false,
      copyAllAuth: false,
      copyAllCS: false,
      copyAllMit: false,
      copyAllOR: false,
      copyAllSL: false,
      copyAllEtoE: false,
      copyAllEtoGen: false,
      copyAllEtoPPA: false,
      copyAllEtoVA: false,
      copyAllIMSS: false,
      copyAllIPSS: false,
      copyToCID: null,
      uid: null
    };
    this.isUpdateMode = true;
  }

  onSave(updated: any) {
    this.saveCompanyDetails(updated);
  }

  saveCompanyDetails(data: any) {
    this.isLoading = true;
    this.errorMessage = '';

    
    let currentUid = 1;
    let currentAid = 1;
    let currentCid = 0;
    let currentAgid = 0;
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUid = parseInt(user.uid, 10) || parseInt(user.id, 10) || parseInt(user.GID, 10) || 1;
        currentAid = parseInt(user.aid, 10) || 1;
        currentCid = parseInt(user.cid, 10) || 0;
        currentAgid = parseInt(user.gid, 10) || parseInt(user.agid, 10) || 0;
      }
    } catch (e) { }

    let request$: Observable<any>;

    if (this.isAdd) {
      
      const createPayload: any = {
        companyID: data.company_id ?? '',
        title: data.Title ?? '',
        description: data.description ?? '',
        contactName: data.ContactName ?? '',
        billingName: data.BillingName ?? '',
        eMail: data.email ?? '',
        validationEmail: data.validation_email ?? data.email ?? '',
        billingEmail: data.billing_email ?? '',
        phone1: data.phone1 ?? '',
        phone2: data.phone2 ?? '',
        isActive: data.IsActive !== undefined ? data.IsActive : true,
        fercPassword: data.IsPassChange ? (data.FERCPassword ?? null) : null,
        isPassChange: data.IsPassChange ?? false,
        progCode: data.prog_code || 'M',
        agid: data.agid ? parseInt(data.agid, 10) : (currentAgid || 1),
        aid: currentAid || 1,
        uid: currentUid || 1,
        modifiedUID: currentUid || 1,
        cid: currentCid || 1,
        isFilingNotification: false,
        notEmailBody: '',
        notEmailsubject: '',
        notEmailBCC: '',
        notEmailCC: '',
        notEmailTo: '',
        notEmailFrom: '',
        startDate: this.toIsoDateTime(data.StartDate),
        expireDate: this.toIsoDateTime(data.ExpireDate),
        size: 1,
        price: 1,
        filingServicePrice: 1,
        isVenusFile: true,
        isFilingService: true,
        isFilingServicePremium: true,
        isAnnual: true,
        incAuth: true,
        incCS: true,
        incMit: true,
        incOR: true,
        incSL: true,
        incEtoE: true,
        incEtoGen: true,
        incEtoPPA: true,
        incEtoVA: true,
        incIMSS: true,
        incIPSS: true,
        copyAllAuth: true,
        copyAllCS: true,
        copyAllMit: true,
        copyAllOR: true,
        copyAllSL: true,
        copyAllEtoE: true,
        copyAllEtoGen: true,
        copyAllEtoPPA: true,
        copyAllEtoVA: true,
        copyAllIMSS: true,
        copyAllIPSS: true,
        copyToCID: currentCid || 1
      };

      console.group('%c [COMPANY CREATE] Payload', 'background: #2b3674; color: #fff; font-weight: bold; padding: 4px;');
      console.log('Raw StartDate from form:', data.StartDate);
      console.log('Raw ExpireDate from form:', data.ExpireDate);
      console.log('Converted startDate:', createPayload.startDate);
      console.log('Converted expireDate:', createPayload.expireDate);
      console.log('Full Payload:', JSON.stringify(createPayload, null, 2));
      console.groupEnd();

      request$ = this.apiService.createCompany(createPayload);
    } else {
      
      const apiPayload = this.denormalizeCompany(data);

      console.group('%c [COMPANY UPDATE] Processing Payload ', 'background: #2b3674; color: #fff; font-weight: bold; padding: 4px;');
      console.log('Full Payload:', apiPayload);
      console.groupEnd();

      request$ = this.apiService.updateCompany(apiPayload);
    }

    const op = this.isAdd ? 'added' : 'updated';

    request$.subscribe({
      next: (result) => {
        console.group('%c [COMPANY SAVE] Response ', 'background: #008000; color: #fff; font-weight: bold; padding: 4px;');
        console.log('API Response:', result);
        console.groupEnd();

        
        let parsed = result;
        if (typeof result === 'string') {
          try { parsed = JSON.parse(result); } catch (e) { parsed = result; }
        }

        
        if (parsed && parsed.resultId === 0 && parsed.errMsg) {
          const msg = parsed.errMsg === 'CompanyExist'
            ? 'A company with this Company ID already exists.'
            : parsed.errMsg;
          this.toast.warning(msg);
          this.isLoading = false;
          return;
        }

        
        this.selectedCompanyId = (data && (data.cid || data.CID)) || this.selectedCompanyId;

        
        this.isUpdateMode = false;
        this.isAdd = false;
        this.loadCompanies();

        this.toast.success('Company ' + op + ' successfully!');
        this.isLoading = false;
      },

      error: (error) => {
        console.group('%c [COMPANY SAVE] Error ', 'background: #d32f2f; color: #fff; font-weight: bold; padding: 4px;');
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Message:', error.message);
        console.error('Error Body:', error.error);
        console.error('Full Error Object:', error);
        if (error.error?.errors) {
          console.error('Validation Errors:', error.error.errors);
        }
        console.groupEnd();

        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update company. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }

  selectCompany(c: any) {
    console.log('Selecting company:', c);
    this.selectedCompanyId = c.cid;
    
    this.company = c;
    this.companyContextService.setCompany(c); 
    this.selectedGroupId = c.agid ?? this.selectedGroupId;
    this.loadCompanyData();
  }

  
  denormalizeCompany(normalized: any): any {
    if (!normalized) { return {}; }

    
    let currentUid = 1;
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUid = parseInt(user.uid || user.id || user.GID || 1, 10) || 1;
      }
    } catch (e) { }

    
    const decodeValue = (val: any): any => {
      if (typeof val === 'string') {
        return this.htmlEntityEncoder.decodeFromEntity(val);
      }
      return val;
    };

    return {
      
      CID: (normalized.cid !== null && normalized.cid !== undefined && normalized.cid !== '') ? parseInt(normalized.cid, 10) : 0,
      cid: (normalized.cid !== null && normalized.cid !== undefined && normalized.cid !== '') ? parseInt(normalized.cid, 10) : 0,
      AID: (normalized.aid !== null && normalized.aid !== undefined && normalized.aid !== '') ? parseInt(normalized.aid, 10) : 0,
      aid: (normalized.aid !== null && normalized.aid !== undefined && normalized.aid !== '') ? parseInt(normalized.aid, 10) : 0,
      AGID: normalized.agid ? parseInt(normalized.agid, 10) : 0,
      agid: normalized.agid ? parseInt(normalized.agid, 10) : 0,
      
      ...(console.log('%c [COMPANY SAVE] AGID being sent:', 'background:#9c27b0;color:#fff;font-weight:bold', normalized.agid, '→', normalized.agid ? parseInt(normalized.agid, 10) : 0) as any, {}),
      CompanyID: decodeValue(normalized.company_id) ?? '',
      company_id: decodeValue(normalized.company_id) ?? '',
      companyId: decodeValue(normalized.company_id) ?? '',

      
      Title: decodeValue(normalized.Title) ?? '',
      Description: decodeValue(normalized.description) ?? '',

      
      EMail: decodeValue(normalized.email) ?? '',
      BillingEmail: decodeValue(normalized.billing_email) ?? '',
      ValidationEmail: decodeValue(normalized.validation_email) ?? '',

      
      ContactName: decodeValue(normalized.ContactName) ?? '',
      BillingName: decodeValue(normalized.BillingName) ?? '',

      
      Phone1: decodeValue(normalized.phone1) ?? '',
      Phone2: decodeValue(normalized.phone2) ?? '',

      
      StartDate: this.dateFormatter.parseDisplayFormatToIso(decodeValue(normalized.StartDate)) || decodeValue(normalized.StartDate) || null,
      ExpireDate: this.dateFormatter.parseDisplayFormatToIso(decodeValue(normalized.ExpireDate)) || decodeValue(normalized.ExpireDate) || null,

      
      IsActive: normalized.IsActive ?? false,
      IsAnnual: normalized.IsAnnual ?? false,

      
      IsFilingNotification: false,
      IsVenusFile: normalized.isVenusFile ?? false,
      IsFilingService: normalized.isFilingService ?? false,
      IsFilingServicePremium: normalized.isFilingServicePremium ?? false,

      
      Size: this.convertSizeToNumber(normalized.size ?? normalized.fsize ?? 'Small'),
      Price: normalized.price ?? 0,
      FilingServicePrice: normalized.filingServicePrice ?? 0,
      ProgCode: decodeValue(normalized.prog_code) ?? '',
      ModifiedUID: currentUid,

      
      fercPassword: decodeValue(normalized.FERCPassword) ?? '',

      
      NotEmailBody: null,
      NotEmailSubject: null,
      NotEmailBCC: null,
      NotEmailCC: null,
      NotEmailTo: null,
      NotEmailFrom: null,

      
      IncAuth: normalized.incAuth ?? false,
      IncCS: normalized.incCS ?? false,
      IncMit: normalized.incMit ?? false,
      IncOR: normalized.incOR ?? false,
      IncSL: normalized.incSL ?? false,
      IncEtoE: normalized.incEtoE ?? false,
      IncEtoGen: normalized.incEtoGen ?? false,
      IncEtoPPA: normalized.incEtoPPA ?? false,
      IncEtoVA: normalized.incEtoVA ?? false,
      IncIMSS: normalized.incIMSS ?? false,
      IncIPSS: normalized.incIPSS ?? false,

      
      IsPassChange: normalized.isPassChange ?? normalized.IsPassChange ?? false,

      
      CopyAllAuth: normalized.copyAllAuth ?? false,
      CopyAllCS: normalized.copyAllCS ?? false,
      CopyAllMit: normalized.copyAllMit ?? false,
      CopyAllOR: normalized.copyAllOR ?? false,
      CopyAllSL: normalized.copyAllSL ?? false,
      CopyAllEtoE: normalized.copyAllEtoE ?? false,
      CopyAllEtoGen: normalized.copyAllEtoGen ?? false,
      CopyAllEtoPPA: normalized.copyAllEtoPPA ?? false,
      CopyAllEtoVA: normalized.copyAllEtoVA ?? false,
      CopyAllIMSS: normalized.copyAllIMSS ?? false,
      CopyAllIPSS: normalized.copyAllIPSS ?? false,

      
      CopyToCID: normalized.copyToCID ? parseInt(normalized.copyToCID, 10) : 0,

      
      UID: currentUid
    };
  }

  convertSizeToNumber(size: any): number {
    const sizeMap: { [key: string]: number } = {
      'Small': 1,
      'Medium': 2,
      'Large': 3,
      'ExtraLarge': 4
    };

    if (typeof size === 'number') {
      return size;
    }

    if (typeof size === 'string') {
      return sizeMap[size] ?? 1;
    }

    return 1;
  }

  onGroupChange() {
    
    this.loadCompanies();
  }

  isAdminMode(): boolean {
    return this.router.url.includes('/admin');
  }

  private toIsoDateTime(value: any): string | null {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s;
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00`;
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      let m = parseInt(parts[0], 10);
      let d = parseInt(parts[1], 10);
      const y = parts[2];
      
      if (m > 12) {
        const tmp = m; m = d; d = tmp;
      }
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00`;
    }
    try {
      const date = new Date(s);
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2,'0');
        const d = String(date.getDate()).padStart(2,'0');
        return `${y}-${m}-${d}T00:00:00`;
      }
    } catch (e) {}
    return null;
  }
}
