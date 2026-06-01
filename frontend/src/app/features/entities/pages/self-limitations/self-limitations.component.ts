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
import { MBRSelfLimitationValidator } from '../../../../core/validators/mbr-self-limitation.validator';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';

@Component({
  selector: 'app-self-limitations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Self Limitations"
        pageSubtitle="Self limitations list for the selected company"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadData()">
      </app-top-cards-row>

      <div class="main-content-card">
        <div class="alert alert-error" *ngIf="errorMessage" style="margin: 20px; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
          <span class="error-icon">⚠️</span> {{ errorMessage }} <button style="margin-left: 10px; padding: 5px 10px; background: #c00; color: white; border: none; border-radius: 3px; cursor: pointer;" (click)="loadData()">Retry</button>
        </div>

        <div class="middle-actions-row">
          <div class="text-group">
            <div class="legend">
              <span class="legend-label">Legend:</span>
              <span class="legend-item edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</span>
              <span class="legend-item delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete</span>
            </div>
          </div>
          <div class="action-buttons-group">
             <div class="search-box">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
             </div>
             <button class="btn btn-blue-copy" (click)="confirmCopyData()">Copy Data (All Screens)</button>
             <button class="btn btn-salmon-import" (click)="confirmImportFERC()">Import/Update Data from FERC</button>
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Self Limitations</button>
            <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="6"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th class="col-check"><label class="checkbox-container"><input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)"><span class="checkmark"></span><span class="label-text">All</span></label></th>
              <th class="col-sl">SL</th>
              <th class="col-id">
                <div class="header-container">
                  <span class="label">FERC ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('id', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'id'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterId" autofocus>
                    <button class="clear-btn" (click)="filterId = ''; activeFilter = null" *ngIf="filterId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-name">
                <div class="header-container">
                  <span class="label">Name</span>
                  <button class="filter-toggle" (click)="toggleFilter('name', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'name'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterName" autofocus>
                    <button class="clear-btn" (click)="filterName = ''; activeFilter = null" *ngIf="filterName">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-type">
                <div class="header-container">
                  <span class="label">Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterType" autofocus>
                    <button class="clear-btn" (click)="filterType = ''; activeFilter = null" *ngIf="filterType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-date">
                <div class="header-container">
                  <span class="label">Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('date', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'date'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterDate" autofocus>
                    <button class="clear-btn" (click)="filterDate = ''; activeFilter = null" *ngIf="filterDate">Clear</button>
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
              <td class="col-id">{{ item.id }}</td>
              <td class="col-name">{{ item.name }}</td>
              <td class="col-type">{{ item.type }}</td>
              <td class="col-date">{{ item.date }}</td>
              <td class="col-actions"><div class="action-cell"><button class="action-btn edit" (click)="onEdit(item)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" (click)="onDelete(item)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div></td>
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
              <h2 class="main-title">{{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : (modalMode === 'ADD' ? 'Self Limitation Add' : 'Self Limitation Edit') }}</h2>
            </div>
            <button class="close-btn" (click)="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
             <!-- Add/Edit Form -->
             <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
               <div class="add-form">
                 <div class="form-row">
                   <div class="form-field">
                     <label>Region: <span class="req">*</span></label>
                     <div class="select-wrapper">
                       <select class="form-input" [class.error]="formErrors.region" [(ngModel)]="formData.region" (input)="formErrors.region = ''" name="region">
                         <option value="">--Select--</option>
                         <option value="CE">Central</option>
                         <option value="NE">Northeast</option>
                         <option value="NW">Northwest</option>
                         <option value="SE">Southeast</option>
                         <option value="SPP">Southwest Power Pool</option>
                         <option value="SW">Southwest</option>
                       </select>
                     </div>
                     <small class="error-text" *ngIf="formErrors.region">{{ formErrors.region }}</small>
                   </div>
                   <div class="form-field">
                     <label>Balancing Authority:</label>
                     <app-balancing-authority-dropdown 
                       [ngClass]="{ 'error': formErrors.balancingAuthority }"
                       [(ngModel)]="formData.balancingAuthority"
                       (ngModelChange)="formErrors.balancingAuthority = ''"
                       [balancingAuthorities]="balancingAuthorities">
                     </app-balancing-authority-dropdown>
                     <small class="error-text" *ngIf="formErrors.balancingAuthority">{{ formErrors.balancingAuthority }}</small>
                   </div>
                 </div>

                 <div class="form-row">
                   <div class="form-field">
                     <label>Effective Date: <span class="req">*</span></label>
                     <input type="date" class="form-input" [class.error]="formErrors.effectiveDate" [(ngModel)]="formData.effectiveDate" (input)="formErrors.effectiveDate = ''" name="effectiveDate">
                     <small class="error-text" *ngIf="formErrors.effectiveDate">{{ formErrors.effectiveDate }}</small>
                     <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                   </div>
                   <div class="form-field">
                     <label>End Date:</label>
                     <input type="date" class="form-input" [class.error]="formErrors.endDate" [(ngModel)]="formData.endDate" (input)="formErrors.endDate = ''" name="endDate">
                     <small class="error-text" *ngIf="formErrors.endDate">{{ formErrors.endDate }}</small>
                   </div>
                 </div>

                 <div class="form-row">
                   <div class="form-field">
                     <label>Record Type: <span class="req">*</span></label>
                     <div class="select-wrapper">
                       <select class="form-input" [class.error]="formErrors.recordType" [(ngModel)]="formData.recordType" (ngModelChange)="onRecordTypeChange($event)" name="recordType">
                         <option value="New">New</option>
                         <option value="Update">Update</option>
                         <option value="Deactivate">Deactivate</option>
                       </select>
                     </div>
                     <small class="error-text" *ngIf="formErrors.recordType">{{ formErrors.recordType }}</small>
                   </div>
                 </div>

                 <!-- Reference ID - Show only when Record Type is "Update" -->
                 <div class="form-row" *ngIf="formData.recordType === 'Update'">
                   <div class="form-field">
                     <label>Reference ID: <span class="req">*</span></label>
                     <input type="text" class="form-input" [class.error]="formErrors.referenceId" [(ngModel)]="formData.referenceId" name="referenceId" placeholder="Enter existing Self Limitation ID" readonly>
                     <small class="error-text" *ngIf="formErrors.referenceId">{{ formErrors.referenceId }}</small>
                     <small class="hint-text">Must match an existing Self Limitation ID</small>
                   </div>
                 </div>
               </div>
             </ng-container>

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
          </div>

        <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD' || modalMode === 'EDIT'">
               <!-- Add/Edit Buttons -->
               <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                  <button class="btn-modal btn-submit compact" (click)="saveData()">{{ modalMode === 'ADD' ? 'Add' : 'Update' }}</button>
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
  styleUrls: ['./self-limitations.component.scss']
})
export class SelfLimitationsComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 1;
  
  formData: any = { region: '', balancingAuthority: '', effectiveDate: '', endDate: '', recordType: 'New', referenceId: '' };
  
  formErrors = {
    recordType: '',
    referenceId: '',
    region: '',
    balancingAuthority: '',
    effectiveDate: '',
    endDate: ''
  };
  
  editingSelfLimitId: number | null = null;
  editingPid: number | null = null;
  regions: any[] = [];
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

  checkIfAllCopySelected() { }

  get filteredData() {
    return this.data.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const idMatch = !this.filterId || String(item.id || '').toLowerCase().includes(this.filterId.toLowerCase());
      const nameMatch = !this.filterName || String(item.name || '').toLowerCase().includes(this.filterName.toLowerCase());
      const typeMatch = !this.filterType || String(item.type || '').toLowerCase().includes(this.filterType.toLowerCase());
      const dateMatch = !this.filterDate || String(item.date || '').toLowerCase().includes(this.filterDate.toLowerCase());
      
      return globalMatch && idMatch && nameMatch && typeMatch && dateMatch;
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

  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  uid: number = 0;

  
  searchTerm = '';
  filterId = '';
  filterName = '';
  filterType = '';
  filterDate = '';
  activeFilter: string | null = null;

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit(): void {
    this.extractUid();
    this.companyContextService.currentCompany$.subscribe(company => {

      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        const dispId = company.company_id || company.Company_ID || company.CompanyID || company.companyID || company.companyId || ('C' + this.companyId);
        this.currentCompanyName = 'Company ID - ' + dispId + ' | ' + (company.Title || company.title || company.company_name || company.CompanyName || company.COMPANY_NAME || company.full_name || company.trading_name || 'Unknown Company');
        this.loadData();
        this.loadDropdowns();
        this.loadCompanies();
      }
    });
  }

  loadDropdowns() {
    this.apiService.getDropDownList('lookregion', 'region_cd', 'region_nm').subscribe({
      next: (res) => { this.regions = res; },
      error: (err) => { console.error('Error loading regions:', err); }
    });
    this.apiService.getDropDownList('lookbaa', 'ID', 'baa_desc').subscribe({
      next: (res) => { this.balancingAuthorities = (res && Array.isArray(res)) ? res : []; },
      error: (err) => { console.error('Error loading BA list:', err); }
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getSelfLimitListByCID(this.companyId).subscribe({
      next: (response: any) => {
        const records: any[] = Array.isArray(response) ? response : (response.rows && Array.isArray(response.rows) ? response.rows : (response.data && Array.isArray(response.data) ? response.data : []));
        this.data = records.map((r: any, idx: number) => ({
          id: '',
          name: r.baa_desc ?? r.region_desc ?? r.reference_id ?? '',
          type: r.record_type_cd ?? '',
          date: this.dateFormatter.formatToDisplay(r.self_limit_effective_date ?? r.self_limit_effective_date1 ?? r.modifieddate ?? ''),
          raw: r,
          selected: !!r.IncInFiling || false
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading self limitations:', err);
        this.errorMessage = 'Failed to load self limitations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
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
    if (mode === 'ADD') {
      this.resetForm();
      this.editingSelfLimitId = null;
    }
    this.modalMode = mode;
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

  closeModal() { this.modalMode = null; this.resetForm(); }

  resetForm() { 
    this.formData = { region: '', balancingAuthority: '', effectiveDate: '', endDate: '', recordType: 'New', referenceId: '' }; 
    this.formErrors = {
      recordType: '',
      referenceId: '',
      region: '',
      balancingAuthority: '',
      effectiveDate: '',
      endDate: ''
    };
    this.editingSelfLimitId = null; 
    this.editingPid = null;
  }

  private extractUid() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        this.uid = user.uid ?? user.Uid ?? user.UID ?? user.userId ?? user.id ?? 0;
      } catch (e) {
        console.error('Error parsing currentUser:', e);
      }
    }
  }

  
  private toIsoNoTZWithMsFromDateString(dateStr: string) {
    if (!dateStr) { return null; }
    const d = new Date(dateStr + 'T00:00:00');
    const YYYY = d.getFullYear();
    const MM = (d.getMonth() + 1).toString().padStart(2, '0');
    const DD = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    const SSS = d.getMilliseconds().toString().padStart(3, '0');
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${SSS}`;
  }

  onRecordTypeChange(newValue: string) {
    this.formData.recordType = newValue;
    
    if (newValue !== 'Update') {
      this.formData.referenceId = '';
      this.formErrors.referenceId = '';
    }
  }

  saveData() {
    
    this.formErrors = {
      recordType: '',
      referenceId: '',
      region: '',
      balancingAuthority: '',
      effectiveDate: '',
      endDate: ''
    };

    
    let err = MBRSelfLimitationValidator.getRecordTypeCdError(this.formData.recordType);
    if (err) {
      this.formErrors.recordType = err;
      this.toast.error(`Record Type: ${err}`);
      return;
    }

    
    if (!this.formData.effectiveDate || this.formData.effectiveDate.trim() === '') {
      this.formData.effectiveDate = '1960-01-01';
      this.toast.info('Effective Date defaulted to 01/01/1960');
    }

    
    err = MBRSelfLimitationValidator.getRegionCdError(this.formData.region);
    if (err) {
      this.formErrors.region = err;
      this.toast.error(`Region: ${err}`);
      return;
    }

    
    err = MBRSelfLimitationValidator.getSelfLimitEffectiveDateError(this.formData.effectiveDate);
    if (err) {
      this.formErrors.effectiveDate = err;
      this.toast.error(`Effective Date: ${err}`);
      return;
    }

    
    err = MBRSelfLimitationValidator.getSelfLimitEndDateError(this.formData.endDate, this.formData.effectiveDate);
    if (err) {
      this.formErrors.endDate = err;
      this.toast.error(`End Date: ${err}`);
      return;
    }

    
    err = MBRSelfLimitationValidator.getBalancingAuthorityCdError(this.formData.balancingAuthority);
    if (err) {
      this.formErrors.balancingAuthority = err;
      this.toast.error(`Balancing Authority: ${err}`);
      return;
    }

    
    err = MBRSelfLimitationValidator.getReferenceIdError(this.formData.referenceId, this.formData.recordType);
    if (err) {
      this.formErrors.referenceId = err;
      this.toast.error(`Reference ID: ${err}`);
      return;
    }

    const effectiveDateIso = this.toIsoNoTZWithMsFromDateString(this.formData.effectiveDate);
    const endDateIso = this.formData.endDate ? this.toIsoNoTZWithMsFromDateString(this.formData.endDate) : null;

    const payload: any = {
      record_type_fk: null,
      pid: this.modalMode === 'EDIT' && this.editingPid !== null ? this.editingPid : 0,
      cid: this.companyId || 0,
      mbr_self_limitations_id: this.editingSelfLimitId ?? null,
      reporting_entity_cid_cd: null,
      mbr_submission_fk: null,
      active_date: effectiveDateIso,
      inactive_date: effectiveDateIso, 
      updated_record_id: null,
      record_type_cd: this.formData.recordType,
      reference_id: this.formData.recordType === 'Update' ? parseInt(this.formData.referenceId, 10) : null,
      region_cd: this.formData.region,
      balancing_Authority_cd: this.formData.balancingAuthority || '',
      self_limit_effective_date: effectiveDateIso,
      self_limit_end_date: endDateIso,
      uid: this.uid,
      isActive: true
    };

    console.log('[saveData] Payload:', JSON.stringify(payload, null, 2));

    this.isLoading = true;
    this.apiService.insUpdSelfLimitUI(payload).subscribe({
      next: (res) => {
        console.log('Saved self limitation:', res);
        this.toast.success(this.modalMode === 'ADD' ? 'Self limitation added.' : 'Self limitation updated.');
        this.closeModal();
        this.loadData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error saving self limitation:', err);
        if (err.error && err.error.errors) {
          const errorMessages = Object.keys(err.error.errors).map(k => `${k}: ${err.error.errors[k].join(', ')}`).join('\n');
          this.toast.error('Validation Error: ' + errorMessages);
        } else {
          this.toast.error('Failed to save. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }

  onEdit(item: any) {
    const r = item.raw ?? item;
    
    this.formData = {
      region: r.region_cd ?? '',
      balancingAuthority: r.balancing_Authority_cd ?? r.baa_desc ?? '',
      effectiveDate: (r.self_limit_effective_date || r.self_limit_effective_date1 || r.active_date || '').toString().substring(0, 10) || '',
      endDate: (r.self_limit_end_date || r.self_limit_end_date1 || r.inactive_date || '').toString().substring(0, 10) || '',
      recordType: r.record_type_cd ?? 'Update'
    };
    this.editingSelfLimitId = r.mbr_self_limitations_id ?? r.mbr_self_limitations_id_fk ?? null;
    this.editingPid = r.pid ?? null;
    this.modalMode = 'EDIT';
  }

  async onDelete(item: any) { if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { const r = item.raw ?? item; this.apiService.deleteSelfLimitByID(r.pid ?? 0, r.mbr_self_limitations_id ?? 0).subscribe({next: ()=>{this.loadData();}, error: (e)=>{console.error(e); this.toast.error('Delete failed')}}); } }

  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.data.forEach(x => x.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'mbr_self_limitations', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'mbr_self_limitations', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  get isAllSelected(): boolean { return this.data.length > 0 && this.data.every(x => x.selected); }

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
