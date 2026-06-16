import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { UpdateCompanyComponent } from './update-company.component';
import { AdminInvoiceListComponent } from '../filings/admin-invoice-list.component';
import { AdminMonthlyInvoiceComponent } from '../filings/admin-monthly-invoice.component';
import { AdminInvoiceAddComponent } from '../filings/admin-invoice-add.component';
import { AdminInvoiceSummaryComponent } from '../filings/admin-invoice-summary.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { CompanyContextService } from '../../core/services/company-context.service';

@Component({
  selector: 'app-admin-company',
  standalone: true,
  imports: [CommonModule, FormsModule, UpdateCompanyComponent, AdminInvoiceListComponent, AdminMonthlyInvoiceComponent, AdminInvoiceAddComponent, AdminInvoiceSummaryComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container admin-company-page">
      <div class="top-bar">
        <h1 class="page-title">Admin Company List</h1>
        <div class="top-actions">
          <button class="btn btn-primary" (click)="changeAccount()">Change Account to ven</button>
          <button class="btn btn-primary" (click)="updateFERCStatus()">Update FERC Status</button>
          <button class="btn btn-primary" (click)="checkInvoices()">Check Invoices</button>
          <button class="btn btn-primary" (click)="addMonthlyInvoice()">Add Monthly Invoice</button>
          <button class="btn btn-primary" (click)="addInvoice()">Add Invoice</button>
          <button class="btn btn-primary" (click)="openInvoices()">Invoices</button>
        </div>
      </div>

      <div class="account-selector">
        <span class="selector-label">Select Account</span>
        <select class="form-control" [(ngModel)]="selectedAccountName" (change)="onAccountChange()">
          <option *ngFor="let acc of accountList; trackBy: trackByAccount" [ngValue]="acc.accName">{{ acc.accName || acc.name }}</option>
        </select>
        <button class="btn btn-primary" style="margin-left:auto;" (click)="openAddCompany()">Add Company</button>
      </div>

      <!-- Loading skeleton -->
      <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="5" [columns]="7"></app-skeleton-loader>

      <!-- Error message -->
      <div class="error-bar" *ngIf="errorMessage">
        <span>{{ errorMessage }}</span>
        <button class="btn btn-sm" (click)="loadCompanies()">Retry</button>
      </div>

      <div class="table-card" *ngIf="!isLoading">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="text-align:center;">Default</th>
                <th>Company</th>
                <th>Company ID</th>
                <th>FERC Validation Email</th>
                <th style="text-align:center;">Users</th>
                <th style="text-align:center;">IsActive</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let company of companies; trackBy: trackByCompany">
                <td style="text-align:center;">
                  <span class="radio-circle" [class.checked]="company.isDefault || company.cid == defaultCid" (click)="selectDefault(company)"></span>
                </td>
                <td><span class="link-text" (click)="viewCompanyDetails(company)">{{ company.Company || company.Title || company.name || 'N/A' }}</span></td>
                <td>{{ company.company_id || company.companyId || company.cid || 'N/A' }}</td>
                <td>{{ company.validation_email || company.validationEmail || company.email || company.eMail || 'N/A' }}</td>
                <td style="text-align:center;">
                          {{ company.userCount ?? 0 }}
                        </td>
                <td style="text-align:center;">
                  <span class="status-pill" [class.active]="company.IsActive || company.isActive" [class.inactive]="!(company.IsActive || company.isActive)">
                    {{ (company.IsActive || company.isActive) ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">

                    <button class="edit-btn" title="Edit" (click)="editCompany(company)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="delete-btn" title="Delete" (click)="deleteCompany(company)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="companies.length === 0 && !isLoading">
                <td colspan="7" style="text-align:center; padding:40px; color:#a3aed0;">No companies found for this account</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Update/Add Company Modal -->
    <app-update-company
      [open]="isCompanyModalOpen"
      (openChange)="onCompanyModalClose($event)"
      [company]="selectedCompany"
      [isAdd]="isAddMode"
      [groups]="accountGroups"
      [isSaving]="isCompanySaving"
      (saveEvent)="onCompanySave($event)">
    </app-update-company>

    <!-- Check Invoices Modal -->
    <app-admin-invoice-list
      [open]="isInvoiceModalOpen"
      (openChange)="isInvoiceModalOpen = $event"
      [cid]="defaultCid">
    </app-admin-invoice-list>

    <!-- Add Monthly Invoice Modal -->
    <app-admin-monthly-invoice
       [open]="isMonthlyInvoiceModalOpen"
       (openChange)="isMonthlyInvoiceModalOpen = $event"
       [company]="selectedCompanyContext"
       [groups]="accountGroups"
       [editingInvoice]="editingInvoiceType === 'monthly' ? editingInvoice : null"
       (addEvent)="onMonthlyInvoiceSave($event)"
       (updateEvent)="onMonthlyInvoiceUpdate($event)">
    </app-admin-monthly-invoice>

    <!-- Add Invoice Modal -->
    <app-admin-invoice-add
       [open]="isAddInvoiceModalOpen"
       (openChange)="isAddInvoiceModalOpen = $event"
       [company]="selectedCompanyContext"
       [groups]="accountGroups"
       [editingInvoice]="editingInvoiceType === 'regular' ? editingInvoice : null"
       (addEvent)="onInvoiceSave($event)"
       (updateEvent)="onInvoiceUpdate($event)">
    </app-admin-invoice-add>

    <!-- Invoice Summary Modal -->
    <app-admin-invoice-summary
       [open]="isInvoiceSummaryModalOpen"
       (openChange)="isInvoiceSummaryModalOpen = $event"
       [cid]="defaultCid"
       (openAddMonthly)="addMonthlyInvoice()"
       (openAddInvoice)="addInvoice()"
       (editInvoiceEvent)="handleEditInvoice($event)"
       (markAsPaidEvent)="handleMarkAsPaid($event)">
    </app-admin-invoice-summary>
  `,
  styleUrls: ['./admin-company.component.scss']
})
export class AdminCompanyComponent implements OnInit {
  companies: any[] = [];
  accountList: any[] = [];
  accountGroups: any[] = [];
  allCompanyRows: any[] = [];
  selectedAccountName: string = '';
  defaultCid: number = 0;
  isLoading = false;
  errorMessage = '';

  
  isCompanyModalOpen = false;
  isInvoiceModalOpen = false;
  isMonthlyInvoiceModalOpen = false;
  isAddInvoiceModalOpen = false;
  isInvoiceSummaryModalOpen = false;
  isAddMode = false;
  isCompanySaving = false;
  editingInvoice: any = null;
  editingInvoiceType: 'regular' | 'monthly' | null = null;
  selectedCompany: any = {};
  selectedCompanyContext: any = {};

  private uid = 0;
  private cid = 0;
  private aid = 0;

  constructor(
    private apiService: ApiService, 
    private toast: ToastService,
    private companyContextService: CompanyContextService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAccountList();
  }

  private loadCurrentUser(): void {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.uid = Number(user.uid ?? user.Uid ?? user.id ?? 0);
        this.cid = Number(user.cid ?? user.Cid ?? 0);
        this.aid = Number(user.aid ?? user.Aid ?? 0);
        this.defaultCid = this.cid;
      }
    } catch (e) {
      console.error('Error parsing currentUser', e);
    }
  }

  
  
  
  private normalizeCompany(src: any): any {
    if (!src) return {};

    let directCompanyId = src.company_id ?? src.companyID ?? src.CompanyID ?? src.companyId ?? '';
    let rawTitle = src.Title ?? src.title ?? src.Name ?? src.name ?? src.Company ?? src.companyName ?? '';

    
    if (!directCompanyId && rawTitle) {
      const m = rawTitle.match(/^(.+?)\s*\(([A-Za-z0-9]+)\)\s*$/);
      if (m) {
        rawTitle = m[1].trim();
        directCompanyId = m[2];
      }
    }

    return {
      cid: src.cid ?? src.CID ?? src.Cid ?? null,
      company_id: directCompanyId,
      Title: rawTitle,
      description: src.description ?? src.notes ?? '',
      email: src.VEmail ?? src.email ?? src.eMail ?? src.validation_email ?? src.validationEmail ?? '',
      billing_email: src.billing_email ?? src.billingEmail ?? '',
      validation_email: src.VEmail ?? src.validation_email ?? src.validationEmail ?? '',
      ContactName: src.ContactName ?? src.contactName ?? '',
      BillingName: src.BillingName ?? src.billingName ?? '',
      phone1: src.phone1 ?? '',
      phone2: src.phone2 ?? '',
      StartDate: src.StartDate ?? src.startDate ?? src.SDate ?? null,
      ExpireDate: src.ExpireDate ?? src.expireDate ?? src.EDate ?? null,
      IsActive: !!(src.IsActive || src.isActive),
      prog_code: src.prog_code ?? src.progCode ?? '',
      aid: src.aid ?? src.AID ?? null,
      agid: src.agid ?? src.AGID ?? null,
      FERCPassword: src.FERCPassword ?? src.fercPassword ?? null,
      isPassChange: !!(src.isPassChange || src.IsPassChange),
      filingServicePrice: src.filingServicePrice ?? 0,
      isVenusFile: !!(src.isVenusFile || src.IsVenusFile),
      isFilingService: !!(src.isFilingService || src.IsFilingService),
      isFilingServicePremium: !!(src.isFilingServicePremium || src.IsFilingServicePremium),
      isAnnual: !!(src.IsAnnual || src.isAnnual),
      size: src.size ?? 1,
      price: src.price ?? 0,
      uid: src.uid ?? null,
      userSeeds: src.userSeeds ?? src.Users ?? null
    };
  }

  
  
  
  loadAccountList(): void {
    
    const cached = this.apiService.getAdminAccountsSync();
    if (cached) {
      this.processAccountList(cached);
    } else {
      this.isLoading = true;
    }
    
    this.apiService.adminGetAccounts().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.processAccountList(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading account list:', err);
      }
    });
  }

  private processAccountList(response: any): void {
    if (Array.isArray(response)) {
      this.accountList = response.map(acc => ({
        accName: acc.accName ?? acc.AccName ?? acc.AccountName ?? acc.Name ?? 'N/A',
        aid: acc.aid ?? acc.AID ?? acc.Aid ?? null,
        name: acc.accName ?? acc.AccName ?? 'N/A'
      }));

      
      if (this.accountList.length > 0) {
        const active = this.companyContextService.getCompany();
        const match = active ? this.accountList.find(a => (a.aid == active.aid || a.accName === (active.Account || active.accName))) : null;

        if (match) {
          this.selectedAccountName = match.accName;
        } else if (!this.selectedAccountName) {
          this.selectedAccountName = this.accountList[0].accName;
        }
        
        this.loadCompanies();
        this.loadAccountGroups();
      }
    } else {
      this.accountList = [];
      this.companies = [];
    }
  }

  
  
  
  
  loadCompanies(): void {
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aid = Number(selectedAcc?.aid || this.aid) || 0;

    if (aid) {
      const cached = this.apiService.getCompaniesByAIDSync(aid);
      if (cached) {
        this.processCompanyList(cached, aid);
      } else {
        this.isLoading = true;
      }
      this.errorMessage = '';

      this.apiService.adminGetCompaniesByAID(aid).subscribe({
        next: (response: any) => {
          // console.log('COMPANY API RESPONSE =>', response);
          this.isLoading = false;
          this.processCompanyList(response, aid);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.warn('GetCompanyListByAID failed, using filtered data:', err);
          this.filterCompaniesByAccount();
        }
      });
    } else {
      this.filterCompaniesByAccount();
    }
  }

  private processCompanyList(response: any, aid: number): void {
    let rawList: any[] = [];
    
    if (Array.isArray(response)) {
      
      const table = response.find((t: any) => t.tableName === 'Table1') || 
                    response.find((t: any) => t.tableName === 'Table');
      
      if (table && Array.isArray(table.rows)) {
        rawList = table.rows;
      } else {
        rawList = response;
      }
    } else if (response && Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response && typeof response === 'object' && !Array.isArray(response)) {
      rawList = [response];
    }

    if (rawList.length > 0) {
      this.companies = rawList.map((c: any) => ({
        ...this.normalizeCompany(c),
        userCount: c.userCount ?? c.UserCount ?? c.users ?? 0
      }));
    } else {
      this.filterCompaniesByAccount();
    }

    
    const ctx = this.companyContextService.getCompany();
    const ctxCid = ctx?.cid ? Number(ctx.cid) : null;
    if (ctxCid && this.companies.some((c: any) => Number(c.cid) === ctxCid)) {
      this.defaultCid = ctxCid;
    } else if (this.companies.length > 0 && !this.defaultCid) {
      this.defaultCid = this.companies[0].cid;
    }
    console.log('Companies processed for AID', aid, ':', this.companies.length);
  }

  
  private filterCompaniesByAccount(): void {
    if (!this.selectedAccountName) {
      this.companies = this.allCompanyRows.map((c: any) => this.normalizeCompany(c));
    } else {
      this.companies = this.allCompanyRows
        .filter((c: any) => (c.Account || c.account || c.AccName || c.accName) === this.selectedAccountName)
        .map((c: any) => this.normalizeCompany(c));
    }
  }

  
  loadAccountGroups(): void {
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aid = Number(selectedAcc?.aid || this.aid) || 0;
    if (aid) {
      this.apiService.getAccountGroupsByAIDWithParams(aid, 'accountgroup', 'agid', 'groupname').subscribe({
        next: (response: any) => {
          let rows: any[] = [];
          if (Array.isArray(response)) {
            const table = response.find((t: any) => t && Array.isArray(t.rows));
            rows = table ? table.rows : response;
          } else if (response?.rows) {
            rows = response.rows;
          } else if (response?.data) {
            rows = response.data;
          }
          this.accountGroups = rows
            .filter((g: any) => {
              const id = g?.value ?? g?.agid ?? g?.AGID ?? g?.id;
              return id !== -1 && id !== '-1';
            })
            .map((g: any) => {
              const id = g?.value ?? g?.agid ?? g?.AGID ?? g?.id;
              const rawName = g?.text ?? g?.groupName ?? g?.GroupName ?? g?.groupname ?? g?.agName ?? g?.Name ?? g?.Title ?? '';
              return {
                ...g,
                agid: id,
                groupName: rawName.trim() || 'Unnamed Group'
              };
            });
          if (!this.accountGroups.length) {
            this.accountGroups = [];
          }
        },
        error: (err: any) => {
          console.error('Error loading account groups:', err);
        }
      });
    }
  }

  onAccountChange(): void {
    
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    if (selectedAcc) {
      const company = this.companyContextService.getCompany();
      this.companyContextService.setCompany({
        ...company,
        aid: selectedAcc.aid,
        accName: selectedAcc.accName,
        Account: selectedAcc.accName
      });
    }
    this.loadCompanies();
    this.loadAccountGroups();
  }

  selectDefault(company: any): void {
    this.defaultCid = company.cid;
    console.log('Set active company context:', company.Title || company.Name, 'CID:', this.defaultCid);
    
    
    const normalized = this.normalizeCompany(company);
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    this.selectedCompanyContext = {
      ...normalized,
      aid: selectedAcc?.aid ?? normalized.aid
    };
    
    
    this.companyContextService.setCompany({
      ...normalized,
      aid: selectedAcc?.aid ?? normalized.aid,
      accName: this.selectedAccountName,
      Account: this.selectedAccountName
    });

    
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        let user = JSON.parse(userStr);
        
        user.cid = company.cid ?? user.cid;
        user.Cid = company.cid ?? user.Cid;
        user.aid = selectedAcc?.aid ?? company.aid ?? user.aid;
        user.Aid = selectedAcc?.aid ?? company.aid ?? user.Aid;
        
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (e) {
      console.error('Error updating global user context on company selection', e);
    }

    this.toast.success(`Active context set to: ${normalized.Title || normalized.company_id || normalized.cid}`);
  }

  
  
  

  openAddCompany(): void {
    this.isAddMode = true;
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    this.selectedCompany = { aid: selectedAcc?.aid };
    this.isCompanyModalOpen = true;
  }

  viewCompanyDetails(company: any): void {
    const cid = company.cid ?? company.CID;
    if (cid) {
      this.isLoading = true;
      this.apiService.getCompanyByID(cid).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          let detail = response;
          if (Array.isArray(response)) {
             const table = response.find((t: any) => t.tableName === 'Table1') || response[0];
             detail = table?.rows?.[0] || table || response[0];
          } else if (response && response.tableName && Array.isArray(response.rows)) {
             detail = response.rows[0];
          }
          
          this.selectedCompany = this.normalizeCompany(detail);
          this.isAddMode = false;
          this.isCompanyModalOpen = true;
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching company details:', err);
          this.toast.error('Failed to load company details.');
        }
      });
    }
  }

  editCompany(company: any): void {
    const cid = company.cid ?? company.CID;
    if (!cid) {
      this.selectedCompany = { ...company };
      this.isAddMode = false;
      this.isCompanyModalOpen = true;
      return;
    }

    this.isLoading = true;
    this.apiService.getCompanyByID(cid).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        let detail = response;
        if (Array.isArray(response)) {
           const table = response.find((t: any) => t.tableName === 'Table1') || response[0];
           detail = table?.rows?.[0] || table || response[0];
        } else if (response && response.tableName && Array.isArray(response.rows)) {
           detail = response.rows[0];
        }

        console.log('Company detailed data:', detail);
        this.selectedCompany = this.normalizeCompany(detail);
        this.isAddMode = false;
        this.isCompanyModalOpen = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading full company details:', err);
        this.selectedCompany = { ...company };
        this.isAddMode = false;
        this.isCompanyModalOpen = true;
      }
    });
  }

  onCompanyModalClose(open: boolean): void {
    this.isCompanyModalOpen = open;
  }

  onCompanySave(data: any): void {
    console.log('Company save data:', data);
    this.isCompanySaving = true;
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aidVal = parseInt(selectedAcc?.aid, 10) || parseInt(data.aid, 10) || 0;

    if (this.isAddMode) {
      
      const payload: any = {
        companyID: data.company_id ?? '',
        title: data.Title ?? '',
        description: data.description ?? '',
        contactName: data.ContactName ?? '',
        billingName: data.BillingName ?? '',
        eMail: data.email ?? data.validation_email ?? '',
        validationEmail: data.validation_email ?? data.email ?? '',
        billingEmail: data.billing_email ?? '',
        phone1: data.phone1 ?? '',
        phone2: data.phone2 ?? '',
        isActive: data.IsActive !== undefined ? data.IsActive : true,
        fercPassword: data.isPassChange ? (data.FERCPassword ?? null) : null,
        isPassChange: data.isPassChange ?? false,
        progCode: data.prog_code || 'M',
        agid: data.agid ? parseInt(data.agid, 10) : 1,
        aid: aidVal,
        uid: this.uid || 0,
        modifiedUID: this.uid || 0,
        cid: parseInt(data.cid, 10) || 0,
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
        copyToCID: parseInt(data.cid, 10) || 1
      };

      console.log('CreateCompany payload:', payload);
      this.apiService.createCompany(payload).subscribe({
        next: (res: any) => {
          this.isCompanySaving = false;
          console.log('Company created:', res);
          let parsed = res;
          if (typeof res === 'string') {
            try { parsed = JSON.parse(res); } catch (e) { parsed = res; }
          }
          if (parsed?.resultId === 0 && parsed?.errMsg) {
            const msg = parsed.errMsg === 'CompanyExist'
              ? 'A company with this Company ID already exists.'
              : parsed.errMsg;
            this.toast.warning(msg);
            return;
          }
          this.toast.success('Company created successfully!');
          this.isCompanyModalOpen = false;
          this.loadCompanies();
        },
        error: (err: any) => {
          this.isCompanySaving = false;
          console.error('Error creating company:', err);
          this.toast.error('Failed to create company. Please try again.');
        }
      });
    } else {
      
      const payload: any = {
        agid: data.agid ? parseInt(data.agid, 10) : 1,
        isPassChange: data.isPassChange ?? false,
        isFilingNotification: data.isFilingNotification ?? false,
        notEmailBody: data.notEmailBody ?? '',
        notEmailsubject: data.notEmailsubject ?? '',
        notEmailBCC: data.notEmailBCC ?? '',
        notEmailCC: data.notEmailCC ?? '',
        notEmailTo: data.notEmailTo ?? '',
        notEmailFrom: data.notEmailFrom ?? '',
        startDate: data.StartDate ?? null,
        expireDate: data.ExpireDate ?? null,
        size: parseInt(data.size, 10) || 1,
        price: parseInt(data.price, 10) || 1,
        aid: aidVal,
        cid: parseInt(data.cid, 10) || 0,
        filingServicePrice: parseInt(data.filingServicePrice, 10) || 1,
        isVenusFile: data.isVenusFile ?? true,
        isFilingService: data.isFilingService ?? true,
        isFilingServicePremium: data.isFilingServicePremium ?? true,
        isAnnual: data.isAnnual ?? true,
        isActive: data.IsActive !== undefined ? !!data.IsActive : true,
        companyID: data.company_id ?? '',
        fercPassword: data.isPassChange ? (data.FERCPassword ?? null) : null,
        progCode: data.prog_code || 'M',
        modifiedUID: this.uid || 0,
        title: data.Title ?? '',
        description: data.description ?? '',
        contactName: data.ContactName ?? '',
        billingName: data.BillingName ?? '',
        eMail: data.email ?? data.validation_email ?? '',
        validationEmail: data.validation_email ?? data.email ?? '',
        billingEmail: data.billing_email ?? '',
        phone1: data.phone1 ?? '',
        phone2: data.phone2 ?? '',
        incAuth: data.incAuth ?? true,
        incCS: data.incCS ?? true,
        incMit: data.incMit ?? true,
        incOR: data.incOR ?? true,
        incSL: data.incSL ?? true,
        incEtoE: data.incEtoE ?? true,
        incEtoGen: data.incEtoGen ?? true,
        incEtoPPA: data.incEtoPPA ?? true,
        incEtoVA: data.incEtoVA ?? true,
        incIMSS: data.incIMSS ?? true,
        incIPSS: data.incIPSS ?? true,
        copyAllAuth: data.copyAllAuth ?? true,
        copyAllCS: data.copyAllCS ?? true,
        copyAllMit: data.copyAllMit ?? true,
        copyAllOR: data.copyAllOR ?? true,
        copyAllSL: data.copyAllSL ?? true,
        copyAllEtoE: data.copyAllEtoE ?? true,
        copyAllEtoGen: data.copyAllEtoGen ?? true,
        copyAllEtoPPA: data.copyAllEtoPPA ?? true,
        copyAllEtoVA: data.copyAllEtoVA ?? true,
        copyAllIMSS: data.copyAllIMSS ?? true,
        copyAllIPSS: data.copyAllIPSS ?? true,
        copyToCID: data.copyToCID ?? (parseInt(data.cid, 10) || 1),
        uid: this.uid || 0
      };

      console.log('UpdateCompany payload:', payload);
      this.apiService.updateCompany(payload).subscribe({
        next: (res: any) => {
          console.log('Company updated:', res);
          this.loadCompanies();
        },
        error: (err: any) => {
          console.error('Error updating company:', err);
          this.toast.error('Failed to update company. Please try again.');
        }
      });
    }
    this.isCompanyModalOpen = false;
  }

  async deleteCompany(company: any) {
    const cid = company.cid || company.CID;
    if (!cid) {
      this.toast.warning('Cannot delete company: CID not found');
      return;
    }

    const name = company.Title || 'this company';
    if (await this.confirmService.show(`Are you sure you want to delete "${name}"?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      this.isLoading = true;
      this.apiService.adminDeleteCompany(cid).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          console.log('AdminDeleteCompany result:', res);
          if (res && (res.resultId > 0 || res.ResultId > 0)) {
            this.toast.success(`Company "${name}" deleted successfully!`);
            this.loadCompanies(); 
          } else {
            const errMsg = res?.errMsg || res?.ErrMsg || 'Unknown error deleting company.';
            this.toast.error(`Failed to delete company: ${errMsg}`);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error deleting company:', err);
          this.toast.error('Failed to delete company. Please try again.');
        }
      });
    }
  }

  
  changeAccount(): void {
    if (!this.selectedAccountName) {
      this.toast.warning('Please select an account first.');
      return;
    }

    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    if (!selectedAcc || !selectedAcc.aid) {
      this.toast.error('Unable to determine account ID. Please try again.');
      return;
    }

    const aid = Number(selectedAcc.aid);
    this.isLoading = true;
    this.apiService.adminChangeAccountForVen(aid).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Change account response:', response);
        
        const successMsg = response?.message || response?.result || response?.ToString?.() || 
                          `Successfully changed account context to ${this.selectedAccountName}.`;
        this.toast.success(String(successMsg));
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error changing account:', error);
        this.toast.error('Failed to change account. Please try again.');
      }
    });
  }
  updateFERCStatus(): void {
    if (!this.defaultCid) {
      this.toast.warning('Please select a company first');
      return;
    }

    this.apiService.updateFERCStatus({ cid: this.defaultCid }).subscribe({
      next: (response: any) => {
        this.toast.success('FERC Status updated successfully');
        this.loadCompanies();
      },
      error: (err: any) => {
        console.error('Error updating FERC status:', err);
        this.toast.error('Failed to update FERC status');
      }
    });
  }
  checkInvoices(): void { 
    if (!this.defaultCid) {
       this.toast.warning('Please select a company context first.');
       return;
    }
    this.isInvoiceModalOpen = true; 
  }
  addMonthlyInvoice(): void { 
    if (!this.defaultCid) {
       this.toast.warning('Please select a company from the list first.');
       return;
    }
    
    // Ensure selectedCompanyContext is set before opening modal
    if (!this.selectedCompanyContext) {
      const fromCtx = this.companyContextService.getCompany();
      if (fromCtx) {
        this.selectedCompanyContext = fromCtx;
      } else {
        const company = this.companies.find((c: any) => c.cid === this.defaultCid);
        if (company) this.selectDefault(company);
      }
    }
    
    this.isMonthlyInvoiceModalOpen = true; 
  }

  onMonthlyInvoiceSave(data: any): void {
    console.log('Saving monthly invoice:', data);
    this.isLoading = true;
    
    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('.')[0];
    };
    
    
    const selectedAccM = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aidM = selectedAccM?.aid ?? this.selectedCompanyContext?.aid ?? 0;

    
    const payload: any = {
      invoiceId: Math.floor(Date.now() / 1000),
      invoiceName: data.invoiceName,
      invoiceDate: formatDateToISO(data.invoiceDate),
      monthStartDate: formatDateToISO(data.startDate),
      monthEndDate: formatDateToISO(data.endDate),
      serviceName: data.serviceType,
      monthSize: data.size,
      monthPrice: Math.round(data.invoicePrice || 0),
      price: Math.round(data.price || 0),
      qty: data.qty || 0,
      agid: (data.agid && data.agid !== -1) ? parseInt(data.agid, 10) : 0,
      cid: this.defaultCid,
      aid: aidM,
      fid: 0,
      isInvoiceSent: data.isInvoiceSent || false,
      paymentReceived: data.isPaymentReceived || false,
      paymentDate: formatDateToISO(data.paymentReceivedDate),
      clientNotes: data.clientNotes,
      clientNotesTitle: data.clientNotesTitle,
      sizeNotes: data.note || null,
      isIncludeAnnual: false,
      isIncludeFS: false,
      isIncludeAdditionalUsers: false
    };

    this.apiService.createMonthlyInvoice(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success('Monthly invoice created successfully!');
        if (this.isInvoiceSummaryModalOpen) {
          this.isInvoiceSummaryModalOpen = false;
          setTimeout(() => { this.isInvoiceSummaryModalOpen = true; }, 100);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating monthly invoice:', err);
        this.toast.error('Failed to create monthly invoice.');
      }
    });
  }
  addInvoice(): void { 
    if (!this.defaultCid) {
       this.toast.warning('Please select a company from the list first.');
       return;
    }
    
    // Ensure selectedCompanyContext is set before opening modal
    if (!this.selectedCompanyContext) {
      const fromCtx = this.companyContextService.getCompany();
      if (fromCtx) {
        this.selectedCompanyContext = fromCtx;
      } else {
        const company = this.companies.find((c: any) => c.cid === this.defaultCid);
        if (company) this.selectDefault(company);
      }
    }
    
    this.isAddInvoiceModalOpen = true; 
  }

  onInvoiceSave(data: any): void {
    console.log('Saving invoice:', data);
    this.isLoading = true;
    
    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('.')[0];
    };
    
    
    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aid = selectedAcc?.aid ?? this.selectedCompanyContext?.aid ?? 0;

    
    const payload: any = {
      invoiceId: Math.floor(Date.now() / 1000),
      invoiceName: data.invoiceName,
      invoiceDate: formatDateToISO(data.invoiceDate),
      monthStartDate: formatDateToISO(data.monthStartDate),
      monthEndDate: formatDateToISO(data.monthEndDate),
      serviceName: data.serviceType,
      sizeNotes: data.note || null,
      price: Math.round(data.price || 0),
      qty: data.qty || 0,
      monthPrice: Math.round(data.invoicePrice || 0),
      fid: data.filingId || 0,
      cid: this.defaultCid,
      aid: aid,
      agid: (data.agid && data.agid !== -1) ? parseInt(data.agid, 10) : 0,
      isInvoiceSent: data.isInvoiceSent || false,
      paymentReceived: data.isPaymentReceived || false,
      paymentDate: formatDateToISO(data.paymentReceivedDate),
      isIncludeAnnual: data.isAnnualInclude || false,
      isIncludeFS: data.isFSInclude || false,
      isIncludeAdditionalUsers: data.isAdditionalUsersInclude || false,
      clientNotes: data.clientNotes,
      clientNotesTitle: data.clientNotesTitle,
      monthSize: data.size || null
    };

    this.apiService.createInvoice(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success('Invoice created successfully!');
        if (this.isInvoiceSummaryModalOpen) {
          this.isInvoiceSummaryModalOpen = false;
          setTimeout(() => { this.isInvoiceSummaryModalOpen = true; }, 100);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating invoice:', err);
        this.toast.error('Failed to create invoice.');
      }
    });
  }

  onInvoiceUpdate(data: any): void {
    console.log('Updating invoice:', data);
    this.isLoading = true;

    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('.')[0];
    };

    const selectedAcc = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aid = selectedAcc?.aid ?? this.selectedCompanyContext?.aid ?? 0;

    const payload: any = {
      invoiceId: data.invoiceId,
      invoiceName: data.invoiceName,
      invoiceDate: formatDateToISO(data.invoiceDate),
      monthStartDate: formatDateToISO(data.monthStartDate),
      monthEndDate: formatDateToISO(data.monthEndDate),
      serviceName: data.serviceType,
      sizeNotes: data.size,
      price: data.price || 0,
      qty: data.qty || 0,
      monthPrice: 0,
      fid: data.filingId || 0,
      cid: this.defaultCid,
      aid: aid,
      agid: (data.agid && data.agid !== -1) ? parseInt(data.agid, 10) : 0,
      isInvoiceSent: data.isInvoiceSent || false,
      paymentReceived: data.isPaymentReceived || false,
      paymentDate: formatDateToISO(data.paymentReceivedDate),
      isIncludeAnnual: data.isAnnualInclude || false,
      isIncludeFS: data.isFSInclude || false,
      isIncludeAdditionalUsers: data.isAdditionalUsersInclude || false,
      clientNotes: data.clientNotes,
      clientNotesTitle: data.clientNotesTitle,
      monthSize: null
    };

    this.apiService.updateInvoice(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success('Invoice updated successfully!');
        this.editingInvoice = null;
        this.editingInvoiceType = null;
        
        this.isInvoiceSummaryModalOpen = false;
        setTimeout(() => { this.isInvoiceSummaryModalOpen = true; }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating invoice:', err);
        this.toast.error('Failed to update invoice.');
      }
    });
  }

  onMonthlyInvoiceUpdate(data: any): void {
    console.log('Updating monthly invoice:', data);
    this.isLoading = true;

    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toISOString().split('.')[0];
    };

    const selectedAccM = this.accountList.find((a: any) => a.accName === this.selectedAccountName);
    const aidM = selectedAccM?.aid ?? this.selectedCompanyContext?.aid ?? 0;

    const payload: any = {
      invoiceId: data.invoiceId,
      invoiceName: data.invoiceName,
      invoiceDate: formatDateToISO(data.invoiceDate),
      monthStartDate: formatDateToISO(data.startDate),
      monthEndDate: formatDateToISO(data.endDate),
      serviceName: data.serviceType,
      monthSize: data.size,
      monthPrice: data.price || 0,
      price: 0,
      qty: 0,
      agid: (data.agid && data.agid !== -1) ? parseInt(data.agid, 10) : 0,
      cid: this.defaultCid,
      aid: aidM,
      fid: 0,
      isInvoiceSent: data.isInvoiceSent || false,
      paymentReceived: data.isPaymentReceived || false,
      paymentDate: formatDateToISO(data.paymentReceivedDate),
      clientNotes: data.clientNotes,
      clientNotesTitle: data.clientNotesTitle,
      sizeNotes: null
    };

    this.apiService.updateMonthlyInvoice(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success('Monthly invoice updated successfully!');
        this.editingInvoice = null;
        this.editingInvoiceType = null;
        
        this.isInvoiceSummaryModalOpen = false;
        setTimeout(() => { this.isInvoiceSummaryModalOpen = true; }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating monthly invoice:', err);
        this.toast.error('Failed to update monthly invoice.');
      }
    });
  }

  handleEditInvoice(invoice: any): void {
    
    const isMonthly = invoice.monthPrice !== undefined && invoice.monthPrice > 0 && invoice.monthSize;
    this.editingInvoice = invoice;
    this.editingInvoiceType = isMonthly ? 'monthly' : 'regular';

    if (isMonthly) {
      this.isMonthlyInvoiceModalOpen = true;
    } else {
      this.isAddInvoiceModalOpen = true;
    }
  }

  handleMarkAsPaid(invoice: any | any[]): void {
    const invoices = Array.isArray(invoice) ? invoice : [invoice];
    
    
    const invoiceIds = invoices
      .map(inv => {
        const id = inv.invoiceId || inv.InvoiceId || inv.InvoiceID || inv.id || inv.ID;
        if (!id) {
          console.warn('Invoice missing ID - object keys:', Object.keys(inv), inv);
        }
        return id;
      })
      .filter(id => id && id !== undefined && id !== null);

    if (invoiceIds.length === 0) {
      this.toast.error('No valid invoices to mark as paid.');
      return;
    }

    this.isLoading = true;
    
    const updatePromises = invoiceIds.map(invId => 
      this.apiService.updateSentInvoice(invId).toPromise()
    );
    
    Promise.all(updatePromises)
      .then(() => {
        this.isLoading = false;
        this.toast.success(`${invoiceIds.length} invoice(s) marked as paid successfully!`);
        
        this.isInvoiceSummaryModalOpen = false;
        setTimeout(() => { this.isInvoiceSummaryModalOpen = true; }, 100);
      })
      .catch((err) => {
        this.isLoading = false;
        console.error('Error marking invoices as paid:', err);
        this.toast.error('Failed to mark invoice(s) as paid.');
      });
  }

  openInvoices(): void { 
    if (!this.defaultCid) {
       this.toast.warning('Please select a company from the list first.');
       return;
    }
    this.isInvoiceSummaryModalOpen = true; 
  }

  trackByAccount(index: number, account: any): any {
    return account.aid || account.id || index;
  }

  trackByCompany(index: number, company: any): any {
    return company.cid || company.CID || company.id || index;
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
