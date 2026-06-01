import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CompanyContextService } from '../../../../core/services/company-context.service';
import { TopCardsRowComponent } from '../../../../shared/components/top-cards-row/top-cards-row.component';
import { FilingFlagsModalComponent } from '../../../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { SanitizeInputDirective } from '../../../../shared/directives/sanitize-input.directive';
import { DatePickerOnlyDirective } from '../../../../shared/directives/date-picker-only.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { InputValidatorService } from '../../../../core/services/input-validator.service';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';
import { MBRAuthorizationValidator } from '../../../../core/validators/mbr-authorization.validator';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-authorizations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective, FormatDatePipe],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Authorization List"
        pageSubtitle="Manage authorization list for the selected company"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadAuthorizations()">
      </app-top-cards-row>

      <!-- Main Content Card -->
      <div class="main-content-card">
        <!-- Error State -->
        <div class="alert alert-error" *ngIf="errorMessage" style="margin: 20px; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
          <button style="margin-left: 10px; padding: 5px 10px; background: #c00; color: white; border: none; border-radius: 3px; cursor: pointer;" (click)="loadAuthorizations()">Retry</button>
        </div>

        <!-- Actions & description area -->
        <div class="middle-actions-row">
          <div class="text-group">

            <div class="legend">
              <span class="legend-label">Legend:</span>
              <span class="legend-item edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
              </span>
              <span class="legend-item delete">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete
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
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Authorization</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD_AUTH')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- Table -->
        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="7"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
            <thead>
              <tr>
                <th class="col-check">
                  <label class="checkbox-container header-label">
                    <input type="checkbox" [checked]="isAllSelectedTable" (change)="toggleAllTable($event)">
                    <span class="checkmark"></span>
                    <span class="label-text">All</span>
                  </label>
                </th>
                <th class="col-sl">SL-No</th>
                <th class="col-auth-id">
                  <div class="header-container">
                    <span class="label">FERC Id</span>
                    <button class="filter-toggle" (click)="toggleFilter('ferc', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'ferc'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter FERC Id..." [(ngModel)]="filterFercId" autofocus>
                      <button class="clear-btn" (click)="filterFercId = ''; activeFilter = null" *ngIf="filterFercId">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-type">
                  <div class="header-container">
                    <span class="label">AuthDocket#</span>
                    <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterAuthType" autofocus>
                      <button class="clear-btn" (click)="filterAuthType = ''; activeFilter = null" *ngIf="filterAuthType">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-status">
                   <div class="header-container">
                     <span class="label">Auth Effective Date</span>
                     <button class="filter-toggle" (click)="toggleFilter('date', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'date'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEffectiveDate" autofocus>
                       <button class="clear-btn" (click)="filterEffectiveDate = ''; activeFilter = null" *ngIf="filterEffectiveDate">Clear</button>
                     </div>
                   </div>
                </th>
                <th class="col-date">
                   <div class="header-container">
                     <span class="label">Cancellation Docket#</span>
                     <button class="filter-toggle" (click)="toggleFilter('cancellation', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'cancellation'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterCancellationDate" autofocus>
                       <button class="clear-btn" (click)="filterCancellationDate = ''; activeFilter = null" *ngIf="filterCancellationDate">Clear</button>
                     </div>
                   </div>
                </th>
                <th class="col-record">
                   <div class="header-container">
                     <span class="label">Record Type</span>
                     <button class="filter-toggle" (click)="toggleFilter('record', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'record'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterRecordType" autofocus>
                       <button class="clear-btn" (click)="filterRecordType = ''; activeFilter = null" *ngIf="filterRecordType">Clear</button>
                     </div>
                   </div>
                </th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredData; let i = index">
                <td class="col-check">
                  <label class="checkbox-container">
                    <input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)">
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td class="col-sl">{{ i + 1 }}</td>
                <td class="col-auth-id">{{ item.fercId }}</td>
                <td class="col-type">{{ item.authDocketNum }}</td>
                <td class="col-status">{{ item.authEffectiveDate | formatDate }}</td>
                <td class="col-date">{{ item.cancellationDocketNum }}</td>
                <td class="col-record">{{ item.recordType }}</td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button class="action-btn edit" (click)="onEdit(item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete" (click)="onDelete(item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
        </table>
      </div>
      
      
        <!-- Generic Modal for Test/Submission/Copy/Add -->
        <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
          <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">{{ modalMode === 'ADD_AUTH' ? 'MBRDB >> Add Authorization' : 'MBRDB >> Edit Authorization' }}</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : 
                     modalMode === 'ADD_AUTH' ? 'MBR Authorization Add' : 
                     modalMode === 'EDIT_AUTH' ? 'MBR Authorization Edit' : 'MBR Authorizations' }}
                </h2>
              </div>
              <button class="close-btn" (click)="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div class="modal-body">
              <!-- Copy Data Mode Form -->
              <ng-container *ngIf="modalMode === 'COPY_DATA'">
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
                          <input type="checkbox" [(ngModel)]="opt.selected" (change)="checkIfAllCopySelected()">
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
              </ng-container>

              <!-- Add/Edit Auth Form -->
              <ng-container *ngIf="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">
                <div class="add-auth-form">
                  <!-- Row 1: Auth Docker | Cancellation Docker -->
                  <div class="form-row">
                    <div class="form-field">
                      <label>Auth Docker:*</label>
                      <input type="text" class="auth-offset-input" [(ngModel)]="authForm.authDocker" tabindex="1">
                    </div>
                    <div class="form-field">
                      <label>Cancellation Docker:</label>
                      <input type="text" class="auth-offset-input" [class.error]="authFormErrors.cancellationDocker" [(ngModel)]="authForm.cancellationDocker" tabindex="2">
                      <small class="error-text" *ngIf="authFormErrors.cancellationDocker">{{ authFormErrors.cancellationDocker }}</small>
                    </div>
                  </div>
                  <!-- Row 2: Auth Effective Date | Cancellation Effective Date -->
                  <div class="form-row">
                    <div class="form-field">
                      <label>Auth Effective Date:*</label>
                      <input type="date" class="auth-offset-input" [class.error]="authFormErrors.authEffectiveDate" [(ngModel)]="authForm.authEffectiveDate" tabindex="3">
                      <small class="error-text" *ngIf="authFormErrors.authEffectiveDate">{{ authFormErrors.authEffectiveDate }}</small>
                      <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                    </div>
                    <div class="form-field">
                      <label>Cancellation Effective Date:</label>
                      <input type="date" class="auth-offset-input" [class.error]="authFormErrors.cancellationEffectiveDate" [(ngModel)]="authForm.cancellationEffectiveDate" tabindex="4">
                      <small class="error-text" *ngIf="authFormErrors.cancellationEffectiveDate">{{ authFormErrors.cancellationEffectiveDate }}</small>
                      <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                    </div>
                  </div>
                  <!-- Row 3: Record Type | Reference ID (shown only when Update) -->
                  <div class="form-row">
                    <div class="form-field">
                      <label>Record Type:*</label>
                      <div class="select-wrapper">
                        <select class="auth-offset-input" [(ngModel)]="authForm.recordType" (ngModelChange)="onRecordTypeChange($event)" tabindex="5">
                          <option *ngFor="let opt of recordTypeOptions" [value]="opt.value">{{ opt.label }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-field" *ngIf="authForm.recordType === 'Update'">
                      <label>Reference ID:*</label>
                      <input type="text" class="auth-offset-input readonly-input" [(ngModel)]="authForm.referenceId"
                        [class.error]="authFormErrors.referenceId"
                        readonly tabindex="6">
                      <small class="error-text" *ngIf="authFormErrors.referenceId">{{ authFormErrors.referenceId }}</small>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>

            <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">
              <!-- Add Auth Buttons -->
              <ng-container *ngIf="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">
                <button class="btn-modal btn-submit compact" (click)="saveAuthorization()">{{ modalMode === 'EDIT_AUTH' ? 'Update' : 'Add' }}</button>
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
  styleUrls: ['./authorizations.component.scss']
})
export class AuthorizationsComponent implements OnInit {
  modalMode: 'COPY_DATA' | 'ADD_AUTH' | 'EDIT_AUTH' | null = null;
  activeFilter: string | null = null;
  editingId: number | null = null;
  editingPid: number | null = null;
  companies: any[] = [];
  currentCompanyName: string = 'Loading...';

  
  searchTerm = '';
  filterFercId = '';
  filterAuthType = '';
  filterEffectiveDate = '';
  filterCancellationDate = '';
  filterRecordType = '';

  filters = {
    authId: '',
    type: '',
    status: '',
    date: ''
  };

  
  isLoading = false;
  errorMessage = '';
  companyId = 1; 

  
  authForm = {
    authDocker: '',
    authEffectiveDate: '',
    cancellationDocker: '',
    cancellationEffectiveDate: '',
    recordType: 'New',
    referenceId: ''
  };

  
  authFormErrors = {
    authEffectiveDate: '',
    cancellationDocker: '',
    cancellationEffectiveDate: '',
    referenceId: ''
  };

  
  recordTypeOptions = [
    { value: 'New', label: 'New' },
    { value: 'Update', label: 'Update' },
    { value: 'Deactivate', label: 'Deactivate' }
  ];

  
  editingMBRAuthId: number | null = null
  
  editingFercId: string | null = null

  
  originalRecordType: string | null = null
  recordTypeChanged = false
  
  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

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

  checkIfAllCopySelected() { }

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

  confirmCopyData() {
    this.openModal('COPY_DATA');
  }

  confirmImportFERC() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
  }

  confirmImportOnly() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
  }

  openModal(mode: 'COPY_DATA' | 'ADD_AUTH' | 'EDIT_AUTH') {
    this.modalMode = mode;
  }

  authorizations: any[] = [];

  get filteredData() {
    return this.authorizations.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const fercMatch = !this.filterFercId || String(item.fercId || item.ferc || '').toLowerCase().includes(this.filterFercId.toLowerCase());
      const typeMatch = !this.filterAuthType || String(item.authType || item.type || '').toLowerCase().includes(this.filterAuthType.toLowerCase());
      const dateMatch = !this.filterEffectiveDate || String(item.effectiveDate || item.date || '').toLowerCase().includes(this.filterEffectiveDate.toLowerCase());
      const cancellationMatch = !this.filterCancellationDate || String(item.cancellationDate || '').toLowerCase().includes(this.filterCancellationDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType || item.record || '').toLowerCase().includes(this.filterRecordType.toLowerCase());
      
      return globalMatch && fercMatch && typeMatch && dateMatch && cancellationMatch && recordMatch;
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

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
    this.toast.info(`${files.length} file(s) selected: ${Array.from(files).map(f => f.name).join(', ')}`);
  }

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private validator: InputValidatorService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        const dispId = company.company_id || company.Company_ID || company.CompanyID || company.companyID || company.companyId || ('C' + this.companyId);
        this.currentCompanyName = 'Company ID - ' + dispId + ' | ' + (company.Title || company.title || company.company_name || company.CompanyName || company.COMPANY_NAME || company.full_name || company.trading_name || 'Unknown Company');
        this.loadAuthorizations();
        this.loadCompanies();
      }
    });
  }

  loadAuthorizations() {
    console.log('loadAuthorizations() called - fetching updated list from API...');
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getMBRAuthListByCID(this.companyId).subscribe({
      next: (data) => {
        console.log('MBRAuth refresh: API returned', Array.isArray(data) ? data.length : 'single object', 'item(s)');
        const records = this.extractRecords(data);
        console.log('After extracting: total records =', records.length);
        this.authorizations = records.map(r => this.normalizeEntity(r));
        console.log('UI updated with', this.authorizations.length, 'authorizations');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading MBR authorizations:', error);
        this.errorMessage = 'Failed to load authorizations. Please try again.';
        this.isLoading = false;
        this.authorizations = [];
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

  private normalizeEntity(record: any): any {
    return {
      
      fercId: '',
      authDocketNum: record.authorization_docket_number ?? record.AuthDocketNumber ?? record.authDocketNum ?? 'N/A',
      authEffectiveDate: record.authorization_effective_date ?? record.AuthEffectiveDate ?? record.authEffectiveDate ?? 'N/A',
      cancellationDocketNum: record.cancellation_docket_number ?? record.CancellationDocketNumber ?? record.cancellationDocketNum ?? 'N/A',
      activeDate: record.active_date ?? record.ActiveDate ?? record.activeDate ?? 'N/A',
      inactiveDate: record.inactive_date ?? record.InactiveDate ?? record.inactiveDate ?? 'N/A',
      recordType: record.record_type_cd ?? record.RecordType ?? record.recordType ?? 'N/A',
      
      
      authId: record.authorization_docket_number ?? record.mbr_authorization_id ?? record.authId ?? record.mbrauthid ?? 'N/A',
      type: record.type ?? record.Type ?? record.entityType ?? 'Market-Based Rate',
      status: record.isActive ? 'Active' : 'Inactive',
      date: this.dateFormatter.formatToDisplay(record.authorization_effective_date ?? record.active_date ?? record.effectiveDate ?? new Date()),
      
      
      mbrauthid: record.mbrauthid ?? record.MBRAuthId ?? 0,
      pid: record.pid ?? record.Pid ?? record.PID ?? 0,
      gid: record.gid ?? record.Gid ?? record.GID ?? 0,
      selected: !!record.IncInFiling || false,
      raw: record 
    };
  }

  private toIsoDateTime(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toISOString(); 
    } catch (e) {
      return null;
    }
  }

  saveAuthorization() {
    
    this.authFormErrors = {
      authEffectiveDate: '',
      cancellationDocker: '',
      cancellationEffectiveDate: '',
      referenceId: ''
    };

    
    if (this.authForm.recordType === 'Update' && this.editingFercId && this.editingFercId !== 'N/A') {
      if (!this.authForm.referenceId || !this.authForm.referenceId.trim()) {
        this.authFormErrors.referenceId = 'Reference ID is required when updating a record with a FERC ID.';
        this.toast.error('Reference ID is required for Update when FERC ID exists.');
        return;
      }
    }

    
    if (!this.authForm.authEffectiveDate || this.authForm.authEffectiveDate.trim() === '') {
      this.authForm.authEffectiveDate = '1960-01-01';
      this.toast.info('Auth Effective Date defaulted to 01/01/1960');
    }
    if (!this.authForm.cancellationEffectiveDate || this.authForm.cancellationEffectiveDate.trim() === '') {
      this.authForm.cancellationEffectiveDate = '1960-01-01';
      
    }

    
    const authDateErr = MBRAuthorizationValidator.getAuthorizationEffectiveDateError(this.authForm.authEffectiveDate);
    if (authDateErr) {
      this.authFormErrors.authEffectiveDate = authDateErr;
      this.toast.error(`Auth Effective Date: ${authDateErr}`);
      return;
    }

    
    if (this.authForm.cancellationDocker) {
      const docketErr = MBRAuthorizationValidator.getCancellationDocketNumberError(this.authForm.cancellationDocker);
      if (docketErr) {
        this.authFormErrors.cancellationDocker = docketErr;
        this.toast.error(`Cancellation Docket: ${docketErr}`);
        return;
      }
    }

    
    if (this.authForm.cancellationEffectiveDate) {
      const cancelDateErr = MBRAuthorizationValidator.getCancellationEffectiveDateError(
        this.authForm.cancellationEffectiveDate,
        this.authForm.authEffectiveDate
      );
      if (cancelDateErr) {
        this.authFormErrors.cancellationEffectiveDate = cancelDateErr;
        this.toast.error(`Cancellation Effective Date: ${cancelDateErr}`);
        return;
      }
    }

    
    if (!this.authForm.authDocker) {
      this.toast.warning('Please fill in all required fields');
      return;
    }

    
    if (this.validator.isDangerous(this.authForm.authDocker) || 
        this.validator.isDangerous(this.authForm.cancellationDocker)) {
      this.toast.error('Input contains invalid content');
      return;
    }

    this.isLoading = true;

    
    let uid: number | null = null;
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
      uid = cu?.uid ?? cu?.Uid ?? cu?.UID ?? cu?.id ?? cu?.userID ?? null;
    } catch (e) { uid = null; }

    
    const recordTypeMap: { [key: string]: number } = {
      'New': 1,
      'Update': 2,
      'Deactivate': 3
    };

    const isEditMode = this.modalMode === 'EDIT_AUTH' && this.editingMBRAuthId;
    
    const mbrauthid = (isEditMode && this.recordTypeChanged) ? 0 : (isEditMode ? this.editingMBRAuthId : 0);

    
    if (isEditMode && this.recordTypeChanged) {
      console.log(`Creating new linked record for changed record_type: originalId=${this.editingMBRAuthId}`);
    }

    const authData: any = {
      
      mbrauthid: mbrauthid,
      cid: this.companyId,
      authorization_effective_date: this.toIsoDateTime(this.authForm.authEffectiveDate),
      record_type_fk: null,
      record_type_cd: this.validator.sanitizeText(this.authForm.recordType || 'New'),
      isActive: true,
      
      
      authorization_docket_number: this.validator.sanitizeText(this.authForm.authDocker) || null,
      cancellation_docket_number: this.validator.sanitizeText(this.authForm.cancellationDocker) || null,
      cancellation_effective_date: this.toIsoDateTime(this.authForm.cancellationEffectiveDate) || null,
      
      
      active_date: null,
      inactive_date: null,
      
      
      mbr_authorization_id: isEditMode ? (this.recordTypeChanged ? null : mbrauthid) : null,
      mbr_submission_fk: null,
      reference_id: this.authForm.referenceId || null,
      updated_record_id: (isEditMode && this.recordTypeChanged) ? this.editingMBRAuthId : null,
      
      
      uid: uid,
      reporting_entity_cid_cd: null
    };

    console.log(`[${isEditMode ? 'EDIT' : 'CREATE'}] Payload:`, authData);

    
    this.apiService.insUpdMBRAuthDataUIWithResponse(authData).subscribe({
      next: (resp) => {
        console.log('Authorization saved response status:', resp.status, 'body:', resp.body);
        if (resp.status === 204) {
          
          this.toast.success('Authorization saved successfully!');
        } else {
          this.toast.success('Authorization saved successfully!');
        }
        this.closeModal();
        this.loadAuthorizations();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving authorization:', error);
        this.toast.error('Failed to save authorization. Please try again.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  async deleteAuthorization(mbrauthid: number, gid: number) {
    if (!await this.confirmService.show('Are you sure you want to delete this authorization?', 'Confirm Delete', 'Delete', 'Cancel')) {
      return;
    }

    this.isLoading = true;
    this.apiService.deleteMBRAuthByID(mbrauthid, gid).subscribe({
      next: () => {
        this.toast.success('Authorization deleted successfully!');
        this.loadAuthorizations();
      },
      error: (error) => {
        console.error('Error deleting authorization:', error);
        this.toast.error('Failed to delete authorization. Please try again.');
        this.isLoading = false;
      }
    });
  }
  
  get isAllSelectedTable(): boolean {
    return this.authorizations && this.authorizations.length > 0 && this.authorizations.every(a => a.selected);
  }

  toggleAllTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.authorizations) { return; }
    this.authorizations.forEach(a => a.selected = isChecked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'mbr_authorizations', tableId: 'mbrauthid', value: isChecked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const id = item.raw?.mbrauthid ?? item.mbrauthid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'mbr_authorizations', tableId: 'mbrauthid', value: item.selected ? '1' : '0', whereIds: String(id)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  resetForm() {
    this.authForm = {
      authDocker: '',
      authEffectiveDate: '',
      cancellationDocker: '',
      cancellationEffectiveDate: '',
      recordType: 'New',
      referenceId: ''
    };
    this.authFormErrors = {
      authEffectiveDate: '',
      cancellationDocker: '',
      cancellationEffectiveDate: '',
      referenceId: ''
    };
    this.editingMBRAuthId = null;
    this.editingFercId = null;
    this.originalRecordType = null;
    this.recordTypeChanged = false;
  }

  closeModal() { this.modalMode = null; this.resetForm(); }

  onEdit(item: any) {
    
    const r = item.raw ?? item;
    this.authForm.authDocker = r.authorization_docket_number ?? r.authorization_docket ?? item.authId ?? '';

    const toDateInput = (d: any) => {
      if (!d) { return ''; }
      const s = String(d);
      if (s.includes('T')) { return s.split('T')[0]; }
      if (s.includes('/')) {
        const [m, day, y] = s.split('/');
        return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${day.padStart(2,'0')}`;
      }
      return s;
    };

    this.authForm.authEffectiveDate = toDateInput(r.authorization_effective_date1 ?? r.authorization_effective_date ?? r.authorization_effective_date1);
    this.authForm.cancellationDocker = r.cancellation_docket_number ?? '';
    this.authForm.cancellationEffectiveDate = toDateInput(r.cancellation_effective_date1 ?? r.cancellation_effective_date ?? r.cancellation_effective_date1);
    this.authForm.referenceId = r.reference_id ?? r.ReferenceId ?? r.referenceId ?? '';
    
    this.editingFercId = item.fercId ?? r.ferc_id ?? r.FercId ?? null;
    
    
    const apiRecordType = r.record_type_cd ?? r.record_type ?? '';
    if (apiRecordType && this.recordTypeOptions.some(opt => opt.value.toLowerCase() === apiRecordType.toLowerCase())) {
      
      this.authForm.recordType = this.recordTypeOptions.find(opt => opt.value.toLowerCase() === apiRecordType.toLowerCase())?.value ?? 'New';
    } else if (apiRecordType) {
      
      this.authForm.recordType = apiRecordType;
    } else {
      
      this.authForm.recordType = 'New';
    }
    
    console.log(`[onEdit] Loaded record_type_cd from API: "${apiRecordType}" -> form recordType: "${this.authForm.recordType}"`);

    
    this.originalRecordType = this.authForm.recordType;
    this.recordTypeChanged = false;

    this.editingMBRAuthId = r.mbrauthid ?? r.MBRAuthId ?? item.mbrauthid ?? 0;

    this.modalMode = 'EDIT_AUTH';
  }

  onRecordTypeChange(newValue: string) {
    console.log(`[onRecordTypeChange] User selected: "${newValue}"`);
    this.recordTypeChanged = (this.originalRecordType !== null && this.originalRecordType !== newValue);
    this.authForm.recordType = newValue;
  }

  async onDelete(item: any) {
    const label = item.authDocketNum !== 'N/A' ? item.authDocketNum : (item.mbrauthid || 'this record');
    if (await this.confirmService.show(`Are you sure you want to delete authorization "${label}"?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      const r = item.raw ?? item;
      
      
      const mbrauthid = r.mbrauthid ?? r.MBRAuthId ?? r.mbr_authorization_id ?? item.mbrauthid ?? 0;
      
      
      let gid = 0;
      try {
        const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
        gid = cu?.gid ?? cu?.Gid ?? cu?.GID ?? 0;
      } catch (e) { 
        console.error('Error parsing currentUser:', e);
        gid = 0; 
      }
      
      console.log('Delete initiated: mbrauthid=' + mbrauthid + ', gid=' + gid + ', calling API endpoint: /api/MBRAuth/DeleteByID/' + mbrauthid + '/' + gid);
      
      if (mbrauthid > 0 && gid > 0) {
        this.isLoading = true;
        this.apiService.deleteMBRAuthByID(mbrauthid, gid).subscribe({
          next: (res) => {
            console.log('Authorization deleted successfully:', res);
            this.toast.success('Authorization deleted successfully');
            setTimeout(() => {
              this.loadAuthorizations();
            }, 500);
          },
          error: (error) => {
            console.error('API error:', error);
            this.isLoading = false;
            this.toast.error('Failed to delete authorization: ' + (error?.error?.message || error?.error || error?.message || 'Unknown error'));
          }
        });
      } else {
        console.warn('Cannot delete: mbrauthid=' + mbrauthid + ', gid=' + gid);
        this.toast.error('Cannot delete: Missing authorization ID (mbrauthid=' + mbrauthid + ') or user ID (gid=' + gid + ')');
      }
    }
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
