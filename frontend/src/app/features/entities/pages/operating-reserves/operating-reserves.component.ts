import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CompanyContextService } from '../../../../core/services/company-context.service';
import { TopCardsRowComponent } from '../../../../shared/components/top-cards-row/top-cards-row.component';
import { FilingFlagsModalComponent } from '../../../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { BalancingAuthorityDropdownComponent } from '../../../../shared/components/balancing-authority-dropdown/balancing-authority-dropdown.component';
import { SanitizeInputDirective } from '../../../../shared/directives/sanitize-input.directive';
import { DatePickerOnlyDirective } from '../../../../shared/directives/date-picker-only.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { InputValidatorService } from '../../../../core/services/input-validator.service';
import { MBROperatingReserveValidator } from '../../../../core/validators/mbr-operating-reserve.validator';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';

@Component({
  selector: 'app-operating-reserves-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Operating Reserves"
        pageSubtitle="Operating reserves list for the selected company"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadORs()">
      </app-top-cards-row>

      <div class="main-content-card">
        <div class="alert alert-error" *ngIf="errorMessage" style="margin: 20px; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
          <span class="error-icon">⚠️</span> {{ errorMessage }} <button style="margin-left: 10px; padding: 5px 10px; background: #c00; color: white; border: none; border-radius: 3px; cursor: pointer;" (click)="loadORs()">Retry</button>
        </div>

        <div class="middle-actions-row">
          <div class="text-group">
            <div class="legend">
              <span class="legend-label">Legend:</span>
              <span class="legend-item edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
              </span>
              <span class="legend-item delete">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete
              </span>
            </div>
          </div>
          
          <div class="action-buttons-group">
             <div class="search-box">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
             </div>
             <button class="btn btn-blue-copy" (click)="confirmCopyData()">Copy Data (All Screens)</button>
             <button class="btn btn-salmon-import" (click)="confirmImportFERC()">Import/Update Data from FERC</button>
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Operating Reserves</button>
            <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="6"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th class="col-check">
                <label class="checkbox-container header-label">
                  <input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)">
                  <span class="checkmark"></span>
                  <span class="label-text">All</span>
                </label>
              </th>
              <th class="col-sl">SL</th>
              <th class="col-ferc-id">
                <div class="header-container">
                  <span class="label">FERC Id</span>
                  <button class="filter-toggle" (click)="toggleFilter('id', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'id'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter FERC Id..." [(ngModel)]="filterId" autofocus>
                    <button class="clear-btn" (click)="filterId = ''; activeFilter = null" *ngIf="filterId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-bal-auth">
                <div class="header-container">
                  <span class="label">Balancing Authority</span>
                  <button class="filter-toggle" (click)="toggleFilter('balAuth', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'balAuth'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Authority..." [(ngModel)]="filterName" autofocus>
                    <button class="clear-btn" (click)="filterName = ''; activeFilter = null" *ngIf="filterName">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-eff">
                <div class="header-container">
                  <span class="label">Effective Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('startDate', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'startDate'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Date..." [(ngModel)]="filterStartDate" autofocus>
                    <button class="clear-btn" (click)="filterStartDate = ''; activeFilter = null" *ngIf="filterStartDate">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-end">
                <div class="header-container">
                  <span class="label">End Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('endDate', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'endDate'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter End Date..." [(ngModel)]="filterEndDate" autofocus>
                    <button class="clear-btn" (click)="filterEndDate = ''; activeFilter = null" *ngIf="filterEndDate">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-record">
                <div class="header-container">
                  <span class="label">Record Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('recordType', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'recordType'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Record Type..." [(ngModel)]="filterRecordType" autofocus>
                    <button class="clear-btn" (click)="filterRecordType = ''; activeFilter = null" *ngIf="filterRecordType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredData; let i = index">
              <td class="col-check"><label class="checkbox-container"><input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)"><span class="checkmark"></span></label></td>
              <td class="col-sl">{{ i + 1 }}</td>
              <td class="col-ferc-id">{{ item.fercId }}</td>
              <td class="col-bal-auth">{{ item.balAuth }}</td>
              <td class="col-eff">{{ item.effectiveDate }}</td>
              <td class="col-end">{{ item.endDate }}</td>
              <td class="col-record">{{ item.recordType }}</td>
              <td class="col-actions">
                <div class="action-cell">
                  <button class="action-btn edit" (click)="onEdit(item)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" (click)="onDelete(item)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
        <div class="modal-content" [class.wide]="modalMode === 'ADD' || modalMode === 'EDIT' || modalMode === 'COPY_DATA'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
              <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
              <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">MBRDB >> Add Auth</span>
              <h2 class="main-title">{{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : (modalMode === 'ADD' ? 'Operating Reserve Add' : 'Operating Reserve Edit') }}</h2>
            </div>
            <button class="close-btn" (click)="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
            <div class="add-form">
              <div class="form-row">
                <div class="form-field">
                  <label>Balancing Authority : <span class="req">*</span></label>
                  <app-balancing-authority-dropdown 
                    [ngClass]="{ 'error': formErrors.balancingAuthority }"
                    [(ngModel)]="form.balancingAuthority"
                    (ngModelChange)="formErrors.balancingAuthority = ''"
                    [balancingAuthorities]="balancingAuthorities">
                  </app-balancing-authority-dropdown>
                  <small class="error-text" *ngIf="formErrors.balancingAuthority">{{ formErrors.balancingAuthority }}</small>
                </div>
                <div class="form-field">
                  <label>Record Type:<span class="req">*</span></label>
                  <div class="select-wrapper">
                    <select class="form-input" [class.error]="formErrors.recordType" [(ngModel)]="form.recordType" (ngModelChange)="onRecordTypeChange($event)" name="recordType">
                      <option value="New">New</option>
                      <option value="Update">Update</option>
                      <option value="Deactivate">Deactivate</option>
                    </select>
                  </div>
                  <small class="error-text" *ngIf="formErrors.recordType">{{ formErrors.recordType }}</small>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Effective Date: <span class="req">*</span></label>
                  <input type="date" class="form-input" [class.error]="formErrors.effectiveDate" [(ngModel)]="form.effectiveDate" (input)="formErrors.effectiveDate = ''" name="effectiveDate">
                  <small class="error-text" *ngIf="formErrors.effectiveDate">{{ formErrors.effectiveDate }}</small>
                  <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                </div>
                <div class="form-field">
                   <label>End Date:</label>
                   <input type="date" class="form-input" [class.error]="formErrors.endDate" [(ngModel)]="form.endDate" (input)="formErrors.endDate = ''" name="endDate">
                   <small class="error-text" *ngIf="formErrors.endDate">{{ formErrors.endDate }}</small>
                </div>
              </div>

                <!-- Reference ID - Show only when Record Type is "Update" -->
                <div class="form-row" *ngIf="form.recordType === 'Update'">
                  <div class="form-field">
                    <label>Reference ID: <span class="req">*</span></label>
                    <input type="text" class="form-input" [class.error]="formErrors.referenceId" [(ngModel)]="form.referenceId" name="referenceId" placeholder="Enter existing Operating Reserve ID" readonly>
                    <small class="error-text" *ngIf="formErrors.referenceId">{{ formErrors.referenceId }}</small>
                    <small class="hint-text">Must match an existing Operating Reserve ID</small>
                  </div>
                </div>
            </div>
          </div>

          <!-- Copy Data Mode Form -->
          <div class="modal-body" *ngIf="modalMode === 'COPY_DATA'">
             <div class="copy-form-inputs">
               <div class="form-group">
                 <label>Copy Data From Company: <span class="req">*</span></label>
                 <div class="from-company-label">{{ currentCompanyName }}</div>
               </div>
               <div class="form-group">
                 <label>Select Company To Copy: <span class="req">*</span></label>
                 <select class="form-control" [(ngModel)]="selectedCompanyToCopy">
                    <option value="">--Select Company--</option>
                    <option *ngFor="let c of companies" [value]="c.cid || c.CID || c.CompanyId || c.CompanyID || c.company_id">{{ c.full_name || c.trading_name || c.company_name || c.CompanyName || c.COMPANY_NAME || c.Title || c.title }}</option>
                 </select>
               </div>
             </div>

             <div class="copy-matrix">
               <div class="matrix-header">
                 <div class="col-main">
                    <span class="matrix-label" style="color: #152238;">Select/Unselect ALL:</span>
                    <label class="checkbox-container white">
                       <input type="checkbox" [checked]="isAllCopySelected" (change)="toggleAllCopy($event)">
                       <span class="checkmark"></span>
                    </label>
                 </div>
                 <div class="col-opt">Copy All Records</div>
                 <div class="col-opt">Copy Only Selected Records</div>
               </div>
               
               <div class="matrix-row" *ngFor="let opt of copyOptions; let i = index">
                 <div class="col-main">
                   <span class="row-label">{{ opt.label }}</span>
                   <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="opt.selected">
                      <span class="checkmark"></span>
                   </label>
                 </div>
                 <div class="col-opt">
                   <label class="custom-radio">
                     <input type="radio" [name]="'mode'+i" value="ALL" [(ngModel)]="opt.mode">
                     <span class="radiomark"></span>
                   </label>
                 </div>
                 <div class="col-opt">
                    <label class="custom-radio">
                     <input type="radio" [name]="'mode'+i" value="SELECTED" [(ngModel)]="opt.mode">
                     <span class="radiomark"></span>
                   </label>
                 </div>
               </div>
             </div>
          </div>            <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD' || modalMode === 'EDIT'">
              <!-- Add/Edit Buttons -->
              <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                <button class="btn-modal btn-submit compact" (click)="saveOR()">{{ modalMode === 'ADD' ? 'Add' : 'Update' }}</button>
                <button class="btn-modal btn-save compact" (click)="resetForm()">Reset</button>
                <button class="btn-modal btn-cancel compact" (click)="closeModal()">Cancel</button>
              </ng-container>

              <!-- Copy Data Buttons -->
              <ng-container *ngIf="modalMode === 'COPY_DATA'">
                <button class="btn-modal btn-submit" (click)="submitCopyData()">Copy Selected Screens</button>
                <button class="btn-modal btn-save" (click)="resetForm()">Reset</button>
                <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
              </ng-container>
            </div>
        </div>
      </div>

      <app-filing-flags-modal [mode]="filingModalMode" (closed)="filingModalMode = null"></app-filing-flags-modal>
    </div>
  `,
  styleUrls: ['./operating-reserves.component.scss']
})
export class OperatingReservesComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  modalMode: 'ADD' | 'EDIT' | 'COPY_DATA' | null = null;
  companyId = 1;
  portfolioId = 1; 
  form: any = { balancingAuthority: '', effectiveDate: '', endDate: '', recordType: 'New', referenceId: '' };
  formErrors = {
    recordType: '',
    referenceId: '',
    balancingAuthority: '',
    effectiveDate: '',
    endDate: ''
  };
  editingId: number | null = null;
  balancingAuthorities: any[] = [];
  companies: any[] = [];
  currentCompanyName: string = 'Loading...';

  copyOptions = [
    { label: 'Copy MBR Authorizations:*', selected: true, mode: 'ALL', key: 'authorizations' },
    { label: 'Copy MBR Category Status:*', selected: true, mode: 'ALL', key: 'categoryStatus' },
    { label: 'Copy MBR Mitigations:*', selected: true, mode: 'ALL', key: 'mitigations' },
    { label: 'Copy MBR Operating Reserves:*', selected: true, mode: 'ALL', key: 'operatingReserves' },
    { label: 'Copy MBR Self Limitation:*', selected: true, mode: 'ALL', key: 'selfLimitation' },
    { label: 'Copy Entities to Entities:*', selected: true, mode: 'ALL', key: 'entitiesToEntities' },
    { label: 'Copy Entities to Gen Assets:*', selected: true, mode: 'ALL', key: 'entitiesToGenAssets' },
    { label: 'Copy Entities to PPA\'s:*', selected: true, mode: 'ALL', key: 'entitiesToPPAs' },
    { label: 'Copy Entities to Vertical Assets:*', selected: true, mode: 'ALL', key: 'entitiesToVerticalAssets' },
    { label: 'Copy Indicative PSS:*', selected: true, mode: 'ALL', key: 'indicativePss' },
    { label: 'Copy Indicative MSS:*', selected: true, mode: 'ALL', key: 'indicativeMss' }
  ];

  get isAllCopySelected(): boolean {
    return this.copyOptions.every(opt => opt.selected);
  }

  toggleAllCopy(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.copyOptions.forEach(opt => opt.selected = isChecked);
  }

  get filteredData() {
    return this.data.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const idMatch = !this.filterId || String(item.fercId || '').toLowerCase().includes(this.filterId.toLowerCase());
      const nameMatch = !this.filterName || String(item.name || '').toLowerCase().includes(this.filterName.toLowerCase());
      const typeMatch = !this.filterType || String(item.type || '').toLowerCase().includes(this.filterType.toLowerCase());
      const amountMatch = !this.filterAmount || String(item.amount || '').toLowerCase().includes(this.filterAmount.toLowerCase());
      const startMatch = !this.filterStartDate || String(item.effectiveDate || '').toLowerCase().includes(this.filterStartDate.toLowerCase());
      const endMatch = !this.filterEndDate || String(item.endDate || '').toLowerCase().includes(this.filterEndDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType || '').toLowerCase().includes(this.filterRecordType.toLowerCase());

      return globalMatch && idMatch && nameMatch && typeMatch && amountMatch && startMatch && endMatch && recordMatch;
    });
  }

  toggleFilter(column: string, event: Event) {
    event.stopPropagation();
    if (this.activeFilter === column) {
      this.activeFilter = null;
    } else {
      this.activeFilter = column;
    }
  }

  
  searchTerm = '';
  filterId = '';
  filterName = '';
  filterType = '';
  filterAmount = '';
  filterStartDate = '';
  filterEndDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;

  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  
  get isAllSelected(): boolean {
    return this.data.length > 0 && this.data.every(item => item.selected);
  }

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private validator: InputValidatorService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit(): void {
    this.extractPortfolioId();
    this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        const dispId = company.company_id || company.Company_ID || company.CompanyID || company.companyID || company.companyId || ('C' + this.companyId);
        this.currentCompanyName = 'Company ID - ' + dispId + ' | ' + (company.Title || company.title || company.company_name || company.CompanyName || company.COMPANY_NAME || company.full_name || company.trading_name || 'Unknown Company');
        this.loadORs();
        this.loadDropdowns();
        this.loadCompanies();
      }
    });
  }

  loadDropdowns() {
    this.apiService.getDropDownList('lookbaa', 'ID', 'baa_desc').subscribe({
      next: (res) => { this.balancingAuthorities = (res && Array.isArray(res)) ? res : []; },
      error: (err) => { console.error('Error loading BA list:', err); }
    });
  }

  private extractPortfolioId() {
    try { const user = JSON.parse(localStorage.getItem('currentUser') || '{}'); this.portfolioId = user.pid ?? user.Pid ?? user.portfolioId ?? 0; } catch (e) {}
  }

  loadORs() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getORListByCID(this.companyId).subscribe({ 
      next: (res: any) => {
        const rows: any[] = Array.isArray(res) ? res : (res.rows && Array.isArray(res.rows) ? res.rows : []);
        this.data = rows.map((r: any, idx: number) => ({
          fercId: r.mbr_submission_fk ?? '',
          balAuth: r.balancing_Authority_cd ?? r.baa_desc ?? r.Balancing_Authority_cd ?? '',
          reserveType: r.reserve_type ?? r.or_reserve_type ?? '',
          capacity: r.capacity ?? r.or_capacity ?? '',
          effectiveDate: this.dateFormatter.formatToInputDate(r.or_authorization_effective_date ?? r.or_authorization_effective_date1 ?? ''),
          endDate: this.dateFormatter.formatToInputDate(r.or_authorization_end_date ?? r.or_authorization_end_date1 ?? ''),
          recordType: r.record_type_cd ?? '',
          activeDate: r.active_date ?? '',
          inactiveDate: r.inactive_date ?? '',
          raw: r,
          selected: !!r.IncInFiling || false
        }));
        this.isLoading = false;
      }, 
      error: (err) => { 
        console.error('Error loading ORs', err); 
        this.errorMessage = 'Failed to load operating reserves.'; 
        this.isLoading = false; 
      } 
    });
  }

  confirmCopyData() {
    this.openModal('COPY_DATA');
  }

  confirmImportFERC() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
  }

  confirmImportOnly() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
  }

  openModal(mode: string) {
    if (mode === 'ADD') { this.resetForm(); }
    this.modalMode = mode as any;
  }

  loadCompanies() {
    try {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : {};
      const uid = user.uid || user.id || 1;
      const agid = user.agid || 0;
      this.apiService.getCompanyListByUIDAGID(uid, agid).subscribe({
        next: (res: any) => { 
          this.companies = Array.isArray(res) ? res : []; 
        },
        error: (err: any) => console.error('Error loading companies:', err)
      });
    } catch (e) { console.error(e); }
  }

  closeModal() { this.modalMode = null; if (this.modalMode !== 'EDIT') this.resetForm(); }

  resetForm() {
    this.form = { balancingAuthority: '', effectiveDate: '', endDate: '', recordType: 'New', referenceId: '' };
    this.formErrors = {
      recordType: '',
      referenceId: '',
      balancingAuthority: '',
      effectiveDate: '',
      endDate: ''
    };
    this.editingId = null;
  }

  
  handleFiles(files: FileList) {
    console.log('Files dropped:', files);
    this.toast.info('File upload logic not implemented yet.');
  }

  toggleAll(e: any) {
    const checked = e.target.checked;
    this.data.forEach(item => item.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'mbr_operating_reserves', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'mbr_operating_reserves', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  onRecordTypeChange(newValue: string) {
    this.form.recordType = newValue;
    
    if (newValue !== 'Update') {
      this.form.referenceId = '';
      this.formErrors.referenceId = '';
    }
  }

  saveOR() {
    
    this.formErrors = {
      recordType: '',
      referenceId: '',
      balancingAuthority: '',
      effectiveDate: '',
      endDate: ''
    };

    
    let err = MBROperatingReserveValidator.getRecordTypeCdError(this.form.recordType);
    if (err) {
      this.formErrors.recordType = err;
      this.toast.error(`Record Type: ${err}`);
      return;
    }

    
    err = MBROperatingReserveValidator.getBalancingAuthorityCdError(this.form.balancingAuthority);
    if (err) {
      this.formErrors.balancingAuthority = err;
      this.toast.error(`Balancing Authority: ${err}`);
      return;
    }

    
    if (!this.form.effectiveDate || this.form.effectiveDate.trim() === '') {
      this.form.effectiveDate = '1960-01-01'; 
    }

    
    err = MBROperatingReserveValidator.getOrAuthorizationEndDateError(this.form.endDate, this.form.effectiveDate);
    if (err) {
      this.formErrors.endDate = err;
      this.toast.error(`End Date: ${err}`);
      return;
    }

    
    err = MBROperatingReserveValidator.getReferenceIdError(this.form.referenceId, this.form.recordType);
    if (err) {
      this.formErrors.referenceId = err;
      this.toast.error(`Reference ID: ${err}`);
      return;
    }

    
    let uid = null;
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        uid = user.uid || user.id || user.GID || null;
      }
    } catch (e) {
      console.warn('Failed to extract uid from localStorage', e);
    }

    
    const isEditMode = this.modalMode === 'EDIT' && !!this.editingId;
    const payload: any = {
      record_type_fk: null,
      record_type_cd: this.validator.sanitizeText(this.form.recordType),
      pid: isEditMode ? this.editingId : 0,
      cid: this.companyId || null,
      mbr_operating_reserves_id: isEditMode ? this.editingId : null,
      reporting_entity_cid_cd: null,
      mbr_submission_fk: null,
      active_date: null,
      inactive_date: null,
      updated_record_id: null,
      reference_id: this.form.recordType === 'Update' ? parseInt(this.form.referenceId, 10) : null,
      balancing_Authority_cd: this.validator.sanitizeText(this.form.balancingAuthority),
      or_authorization_effective_date: this.form.effectiveDate ? (this.form.effectiveDate + 'T00:00:00') : '',
      or_authorization_end_date: this.form.endDate ? (this.form.endDate + 'T00:00:00') : null,
      uid: uid,
      isActive: true
    };

    console.log('Saving OR with payload:', payload);
    this.isLoading = true;
    this.apiService.insUpdORUI(payload).subscribe({ 
      next: (res) => { 
        this.toast.success(this.modalMode === 'ADD' ? 'Operating Reserve added.' : 'Operating Reserve updated.'); 
        this.closeModal(); 
        this.loadORs(); 
        this.isLoading = false; 
      }, 
      error: (err) => { 
        console.error('Save OR error', err); 
        this.toast.error('Failed to save.'); 
        this.isLoading = false; 
      } 
    });
  }

  onEdit(item: any) {
    const r = item.raw ?? item;
    
    if (r && r.pid) {
      this.isLoading = true;
      this.apiService.getORRecordByID(r.pid).subscribe({
        next: (resp: any) => {
          const rec = Array.isArray(resp) ? resp[0] : resp;
          this.populateFormFromRecord(rec);
          this.isLoading = false;
        },
        error: (err) => {
          console.warn('GetRecordByID failed, falling back to item data', err);
          this.populateFormFromRecord(r);
          this.isLoading = false;
        }
      });
    } else {
      this.populateFormFromRecord(r);
    }
  }

  private populateFormFromRecord(r: any) {
    this.form = {
      balancingAuthority: r.baa_desc ?? r.Balancing_Authority_cd ?? r.balancing_Authority_cd ?? '',
      effectiveDate: (r.or_authorization_effective_date1 || r.or_authorization_effective_date || '').toString().substring(0,10) || '',
      endDate: (r.or_authorization_end_date1 || r.or_authorization_end_date || '').toString().substring(0,10) || '',
      recordType: r.record_type_cd ?? 'New',
      referenceId: r.reference_id ? String(r.reference_id) : ''
    };
    this.editingId = r.pid ?? r.mbr_operating_reserves_id ?? null;
    this.modalMode = 'EDIT';
  }

  async onDelete(item: any) {
    if (!await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { return; }
    const r = item.raw ?? item;
    this.apiService.deleteORByID(r.pid ?? 0, r.mbr_operating_reserves_id ?? 0).subscribe({ next: () => { this.loadORs(); }, error: (e) => { console.error(e); this.toast.error('Delete failed'); } });
  }

  selectedCompanyToCopy: number | string = '';

  submitCopyData() {
    if (!this.selectedCompanyToCopy) {
      if (this.toast && this.toast.warning) {
        this.toast.warning('Please select a target company to copy data to.');
      } else {
        this.alertService.warning('Please select a target company to copy data to.', 'Select Target Company');
      }
      return;
    }

    const resolveInc = (key: string) => this.copyOptions.find(o => o.key === key)?.selected ?? false;
    const resolveAll = (key: string) => resolveInc(key) && (this.copyOptions.find(o => o.key === key)?.mode === 'ALL');

    const payload = {
      cid: this.companyId,
      incAuth: resolveInc('authorizations'),
      incCS: resolveInc('categoryStatus'),
      incMit: resolveInc('mitigations'),
      incOR: resolveInc('operatingReserves'),
      incSL: resolveInc('selfLimitation'),
      incEtoE: resolveInc('entitiesToEntities'),
      incEtoGen: resolveInc('entitiesToGenAssets'),
      incEtoPPA: resolveInc('entitiesToPPAs'),
      incEtoVA: resolveInc('entitiesToVerticalAssets'),
      incIMSS: resolveInc('indicativeMss'),
      incIPSS: resolveInc('indicativePss'),

      copyAllAuth: resolveAll('authorizations'),
      copyAllCS: resolveAll('categoryStatus'),
      copyAllMit: resolveAll('mitigations'),
      copyAllOR: resolveAll('operatingReserves'),
      copyAllSL: resolveAll('selfLimitation'),
      copyAllEtoE: resolveAll('entitiesToEntities'),
      copyAllEtoGen: resolveAll('entitiesToGenAssets'),
      copyAllEtoPPA: resolveAll('entitiesToPPAs'),
      copyAllEtoVA: resolveAll('entitiesToVerticalAssets'),
      copyAllIMSS: resolveAll('indicativeMss'),
      copyAllIPSS: resolveAll('indicativePss'),

      copyToCID: Number(this.selectedCompanyToCopy),
      uid: Number(JSON.parse(localStorage.getItem('currentUser') || '{}').uid || (this as any).uid || 1)
    };

    this.isLoading = true;
    this.apiService.copyEntityData(payload).subscribe({
      next: (res: any) => {
        if (res && [200, 201, 204].includes(res.status)) {
          if (this.toast) this.toast.success('Data copied successfully.');
          this.closeModal();
        } else {
          if (this.toast) this.toast.warning('Copy executed but server returned status: ' + (res.status || 'unknown'));
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error copying data:', err);
        if (this.toast) this.toast.error('Failed to copy data. Please try again.');
        this.isLoading = false;
      }
    });
  }

}
