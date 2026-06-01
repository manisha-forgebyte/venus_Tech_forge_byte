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
import { MBRCategoryStatusValidator } from '../../../../core/validators/mbr-category-status.validator';

@Component({
  selector: 'app-category-status-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Category Status"
        pageSubtitle="Category Status Details"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadCategoryStatus()">
      </app-top-cards-row>

      <!-- Main Content Card -->
      <div class="main-content-card">
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
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Category Status</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD_CATEGORY')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- Table -->
        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="7"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
            <thead>
              <tr>
                <th class="col-check">
                  <label class="checkbox-container">
                    <input type="checkbox" [checked]="isAllSelectedTable" (change)="toggleAllTable($event)">
                    <span class="checkmark"></span>
                    <span class="label-text">All</span>
                  </label>
                </th>
                <th class="col-sl">SL</th>
                <th class="col-ferc-id">
                  <div class="header-container">
                    <span class="label">FERC Id</span>
                    <button class="filter-toggle" (click)="toggleFilter('ferc', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'ferc'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterFercId" autofocus>
                      <button class="clear-btn" (click)="filterFercId = ''; activeFilter = null" *ngIf="filterFercId">Clear</button>
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
                <th class="col-region">
                   <div class="header-container">
                     <span class="label">Region Status</span>
                     <button class="filter-toggle" (click)="toggleFilter('region', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'region'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEntityType" autofocus>
                       <button class="clear-btn" (click)="filterEntityType = ''; activeFilter = null" *ngIf="filterEntityType">Clear</button>
                     </div>
                   </div>
                </th>
                <th class="col-cat-stat">
                   <div class="header-container">
                     <span class="label">Category Status</span>
                     <button class="filter-toggle" (click)="toggleFilter('status', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'status'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStatus" autofocus>
                       <button class="clear-btn" (click)="filterStatus = ''; activeFilter = null" *ngIf="filterStatus">Clear</button>
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
              <tr *ngFor="let item of filteredData; let i = index" [class.highlight-red]="item.isRed">
                <td class="col-check">
                  <label class="checkbox-container">
                    <input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)">
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td class="col-sl">{{ item.sl }}</td>
                <td class="col-ferc-id">{{ item.fercId }}</td>
                <td class="col-date">{{ item.date }}</td>
                <td class="col-region">{{ item.region }}</td>
                <td class="col-cat-stat">{{ item.catStatus }}</td>
                <td class="col-record">{{ item.record }}</td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button class="action-btn edit" (click)="onEditCategory(item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete" (click)="deleteCategoryStatus(item.raw?.pid ?? item.pid ?? 0, item.raw?.gid ?? item.gid ?? 0)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
        </table>
      </div>
      
        <!-- Shared Modals -->
        <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
            <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD_CATEGORY' || modalMode === 'EDIT_CATEGORY'" (click)="$event.stopPropagation()">
            <div class="modal-header">
               <div class="header-titles">
                  <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD_CATEGORY' || modalMode === 'EDIT_CATEGORY'">{{ modalMode === 'ADD_CATEGORY' ? 'MBRDB >> Add Category' : 'MBRDB >> Edit Category' }}</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : 
                     modalMode === 'ADD_CATEGORY' ? 'MBR Category Add' : 
                     modalMode === 'EDIT_CATEGORY' ? 'MBR Category Edit' : 'Category Status' }}
                </h2>
              </div>
               <button class="close-btn" (click)="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
               </button>
            </div>
            
            <div class="modal-body">
               <!-- Add Category Form -->
               <ng-container *ngIf="modalMode === 'ADD_CATEGORY' || modalMode === 'EDIT_CATEGORY'">
                 <div class="add-category-form">
                    <div class="form-field">
                        <label>Category Status: <span class="req">*</span></label>
                        <div class="select-wrapper">
                             <select class="category-input" [class.error]="categoryFormErrors.categoryStatus" [(ngModel)]="categoryForm.categoryStatus" (ngModelChange)="categoryFormErrors.categoryStatus = ''">
                                <option value="">--Select--</option>
                                <option *ngFor="let item of categoryStatuses" [value]="item.value">{{ item.text }}</option>
                             </select>
                        </div>
                        <small class="error-text" *ngIf="categoryFormErrors.categoryStatus">{{ categoryFormErrors.categoryStatus }}</small>
                    </div>
                    <div class="form-field">
                        <label>Region: <span class="req">*</span></label>
                        <div class="select-wrapper">
                             <select class="category-input" [class.error]="categoryFormErrors.region" [(ngModel)]="categoryForm.region" (ngModelChange)="categoryFormErrors.region = ''">
                                <option value="">--Select--</option>
                                <option *ngFor="let item of regions" [value]="item.value">{{ item.text }}</option>
                             </select>
                        </div>
                        <small class="error-text" *ngIf="categoryFormErrors.region">{{ categoryFormErrors.region }}</small>
                    </div>
                    <div class="form-field">
                        <label>Effective Date: <span class="req">*</span></label>
                        <input type="date" class="category-input" [class.error]="categoryFormErrors.effectiveDate" [(ngModel)]="categoryForm.effectiveDate" (input)="categoryFormErrors.effectiveDate = ''">
                        <small class="error-text" *ngIf="categoryFormErrors.effectiveDate">{{ categoryFormErrors.effectiveDate }}</small>
                        <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                    </div>
                    <div class="form-field">
                        <label>Record Type: <span class="req">*</span></label>
                        <div class="select-wrapper record-type-row">
                             <select class="category-input" [class.error]="categoryFormErrors.recordType" [(ngModel)]="categoryForm.recordType" (ngModelChange)="onCategoryRecordTypeChange($event)">
                                <option *ngFor="let opt of recordTypeOptions" [value]="opt.value">{{ opt.label }}</option>
                             </select>
                        </div>
                        <small class="error-text" *ngIf="categoryFormErrors.recordType">{{ categoryFormErrors.recordType }}</small>
                    </div>

                    <!-- Reference ID - Show only when Record Type is "Update" -->
                    <div class="form-field" *ngIf="categoryForm.recordType === 'Update'">
                        <label>Reference ID: <span class="req">*</span></label>
                        <input type="text" class="category-input" [class.error]="categoryFormErrors.referenceId" [(ngModel)]="categoryForm.referenceId" placeholder="Enter existing Category Status ID" readonly>
                        <small class="error-text" *ngIf="categoryFormErrors.referenceId">{{ categoryFormErrors.referenceId }}</small>
                        <small class="hint-text">Must match an existing Category Status ID</small>
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

             <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD_CATEGORY' || modalMode === 'EDIT_CATEGORY'">
               <!-- Add Category Buttons -->
               <ng-container *ngIf="modalMode === 'ADD_CATEGORY' || modalMode === 'EDIT_CATEGORY'">
                  <button class="btn-modal btn-submit" (click)="saveCategoryStatus()">{{ isEditCategory ? 'Save' : 'Add' }}</button>
                  <button class="btn-modal btn-save" (click)="resetCategoryForm()">Reset</button>
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
  styleUrls: ['./category-status.component.scss']
})
export class CategoryStatusComponent implements OnInit {
  modalMode: 'COPY_DATA' | 'ADD_CATEGORY' | 'EDIT_CATEGORY' | null = null;
  isLoading = false;
  errorMessage = '';
  companyId: number = 0;
  categoryForm = { categoryStatus: '', region: '', effectiveDate: '', recordType: 'New', referenceId: '', cat_status_id: null as number | null, pid: null as number | null, gid: null as number | null };
  categoryFormErrors = {
    categoryStatus: '',
    region: '',
    effectiveDate: '',
    recordType: '',
    referenceId: ''
  };
  recordTypeOptions = [{ value: 'New', label: 'New' }, { value: 'Update', label: 'Update' }, { value: 'Deactivate', label: 'Deactivate' }];
  isEditCategory = false;
  editingId: number | null = null;
  editingPid: number | null = null;
  editingGid: number | null = null;
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
  regions: any[] = [{ value: 'CE', text: 'Central' }, { value: 'NE', text: 'Northeast' }, { value: 'NW', text: 'Northwest' }, { value: 'SE', text: 'Southeast' }, { value: 'SPP', text: 'Southwest Power Pool' }, { value: 'SW', text: 'Southwest' }];
  categoryStatuses: any[] = [{ value: 1, text: 'Category 1' }, { value: 2, text: 'Category 2' }, { value: 3, text: 'No MBR authority in the region' }];
  originalCategoryRecordType: string | null = null;
  categoryData: any[] = [];
  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  
  searchTerm = '';
  filterFercId = '';
  filterEntityType = '';
  filterEntityId = '';
  filterStatus = '';
  filterDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private validator: InputValidatorService, private confirmService: ConfirmService) {
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
        this.loadCategoryStatus();
        this.loadDropdowns();
        this.loadCompanies();
      }
    });
  }

  loadDropdowns() { }

  loadCategoryStatus() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getCatStatusListByCID(this.companyId).subscribe({
      next: (data) => {
        const records = Array.isArray(data) ? data : (data?.rows ?? []);
        this.categoryData = records.map((r: any, idx: number) => this.normalizeCategoryRecord(r, idx + 1));
        this.extractRegionsFromData(records);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading category status:', error);
        this.errorMessage = 'Failed to load category status. Please try again.';
        this.isLoading = false;
        this.categoryData = [];
      }
    });
  }

  private extractRegionsFromData(records: any[]) {
    const regionsMap = new Map<string, string>();
    records.forEach(record => {
      const regionCode = record.region_cd;
      const regionDesc = record.region_desc;
      if (regionCode && regionDesc && !regionsMap.has(regionCode)) { regionsMap.set(regionCode, regionDesc); }
    });
    if (regionsMap.size > 0) {
      this.regions = Array.from(regionsMap.entries()).map(([code, desc]) => ({ value: code, text: desc }));
    }
  }

  private normalizeCategoryRecord(record: any, index: number) {
    const format = (d: any) => {
      if (!d) { return ''; }
      const iso = String(d);
      if (/^\d{4}-\d{2}-\d{2}T/.test(iso)) {
        const dt = new Date(iso);
        return (dt.getMonth() + 1).toString().padStart(2, '0') + '/' + dt.getDate().toString().padStart(2, '0') + '/' + dt.getFullYear();
      }
      return iso;
    };
    return {
      sl: record.SLNO ?? index,
      fercId: '',
      date: record.cat_status_effective_date ?? format(record.cat_status_effective_date1) ?? '',
      region: record.region_desc ?? record.region ?? '',
      catStatus: record.cat_status_in_region_desc ?? record.catStatus ?? '',
      active: format(record.active_date1) || format(record.active_date) || '',
      inactive: format(record.inactive_date1) || format(record.inactive_date) || '',
      record: record.record_type_cd ?? record.recordType ?? '',
      isRed: !!record.IsDeleteAtFERC || false,
      pid: record.pid ?? record.Pid ?? record.PID ?? null,
      gid: record.gid ?? record.Gid ?? record.GID ?? null,
      selected: !!record.IncInFiling || false,
      raw: record
    };
  }

  onCategoryRecordTypeChange(newValue: string) {
    this.categoryForm.recordType = newValue;
  }

  saveCategoryStatus() {
    
    this.categoryFormErrors = {
      categoryStatus: '',
      region: '',
      effectiveDate: '',
      recordType: '',
      referenceId: ''
    };

    
    let err = MBRCategoryStatusValidator.getRecordTypeCdError(this.categoryForm.recordType);
    if (err) {
      this.categoryFormErrors.recordType = err;
      this.toast.error(`Record Type: ${err}`);
      return;
    }

    
    err = MBRCategoryStatusValidator.getRegionCdError(this.categoryForm.region);
    if (err) {
      this.categoryFormErrors.region = err;
      this.toast.error(`Region: ${err}`);
      return;
    }

    
    err = MBRCategoryStatusValidator.getCategoryStatusError(this.categoryForm.categoryStatus);
    if (err) {
      this.categoryFormErrors.categoryStatus = err;
      this.toast.error(`Category Status: ${err}`);
      return;
    }

    
    if (!this.categoryForm.effectiveDate || this.categoryForm.effectiveDate.trim() === '') {
      this.categoryForm.effectiveDate = '1960-01-01';
      this.toast.info('Effective Date defaulted to 01/01/1960');
    }

    
    err = MBRCategoryStatusValidator.getCategoryStatusEffectiveDateError(
      this.categoryForm.effectiveDate,
      this.categoryForm.categoryStatus
    );
    if (err) {
      this.categoryFormErrors.effectiveDate = err;
      this.toast.error(`Effective Date: ${err}`);
      return;
    }

    
    err = MBRCategoryStatusValidator.getReferenceIdError(
      this.categoryForm.referenceId,
      this.categoryForm.recordType
    );
    if (err) {
      this.categoryFormErrors.referenceId = err;
      this.toast.error(`Reference ID: ${err}`);
      return;
    }

    this.isLoading = true;
    let currentUid = 1;
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUid = parseInt(String(user.uid || user.id || 1), 10);
      }
    } catch (e) { }
    const isEditMode = this.isEditCategory && !!this.editingPid;
    const payload: any = {
      record_type_fk: null,
      pid: isEditMode ? this.editingPid : 0,
      cid: this.companyId,
      cat_status_id: this.categoryForm.cat_status_id || 0,
      reporting_entity_cid_cd: null,
      mbr_submission_fk: null,
      active_date: null,
      inactive_date: null,
      updated_record_id: isEditMode && this.originalCategoryRecordType !== this.categoryForm.recordType ? this.editingPid : null,
      record_type_cd: this.validator.sanitizeText(this.categoryForm.recordType),
      reference_id: this.categoryForm.recordType === 'Update' ? parseInt(this.categoryForm.referenceId, 10) : null,
      region_cd: this.validator.sanitizeText(this.categoryForm.region),
      cat_status_in_region_fk: parseInt(this.categoryForm.categoryStatus, 10) || 0,
      cat_status_effective_date: this.toIsoDate(this.categoryForm.effectiveDate) || null,
      uid: currentUid,
      isActive: true
    };
    this.apiService.insUpdCatStatusUIWithResponse(payload).subscribe({
      next: (resp) => {
        this.toast.success('Category saved successfully!');
        this.closeModal();
        this.loadCategoryStatus();
        this.resetCategoryForm();
      },
      error: (error) => {
        console.error('Error saving category status:', error);
        this.toast.error('Failed to save category status.');
      },
      complete: () => { this.isLoading = false; }
    });
  }

  async deleteCategoryStatus(pid: number, gid: number) {
    if (!await this.confirmService.show('Are you sure you want to delete this category status?', 'Confirm Delete', 'Delete', 'Cancel')) { return; }
    this.isLoading = true;
    this.apiService.deleteCatStatusByID(pid, gid).subscribe({
      next: () => { this.toast.success('Deleted successfully!'); this.loadCategoryStatus(); },
      error: (error) => { console.error('Error deleting category status:', error); this.toast.error('Delete failed.'); this.isLoading = false; }
    });
  }

  private toIsoDate(d: string | null): string | null {
    if (!d) return null;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { return new Date(d + 'T00:00:00Z').toISOString(); }
      const parts = d.split('/');
      if (parts.length === 3) {
        const [m, day, y] = parts;
        return new Date(`${y}-${m.padStart(2,'0')}-${day.padStart(2,'0')}T00:00:00Z`).toISOString();
      }
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    } catch (e) { return null; }
  }

  private dateToInput(d: any): string {
    if (!d) return '';
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) { return s.split('T')[0]; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { return s; }
    if (s.includes('/')) {
      const [m, day, y] = s.split('/');
      return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${day.padStart(2,'0')}`;
    }
    return s;
  }

  onEditCategory(item: any) {
    const r = item.raw ?? item;
    this.isEditCategory = true;
    this.editingPid = r.pid ?? null;
    this.editingGid = r.gid ?? null;
    this.categoryForm = {
      categoryStatus: r.cat_status_in_region_fk ?? r.cat_status_in_region_desc ?? '',
      region: r.region_cd ?? r.region_desc ?? '',
      effectiveDate: this.dateToInput(r.cat_status_effective_date1 ?? r.cat_status_effective_date ?? ''),
      recordType: r.record_type_cd ?? 'New',
      referenceId: r.reference_id ? String(r.reference_id) : '',
      cat_status_id: r.cat_status_id ?? null,
      pid: this.editingPid,
      gid: this.editingGid
    };
    this.originalCategoryRecordType = this.categoryForm.recordType;
    this.openModal('EDIT_CATEGORY');
  }

  resetCategoryForm() {
    this.categoryForm = { categoryStatus: '', region: '', effectiveDate: '', recordType: 'New', referenceId: '', cat_status_id: null, pid: null, gid: null };
    this.categoryFormErrors = {
      categoryStatus: '',
      region: '',
      effectiveDate: '',
      recordType: '',
      referenceId: ''
    };
    this.isEditCategory = false;
    this.editingPid = null;
    this.editingGid = null;
    this.originalCategoryRecordType = null;
  }

  resetForm() { this.copyOptions.forEach(opt => { opt.selected = true; opt.mode = 'ALL'; }); }

  get isAllSelectedTable(): boolean { return this.categoryData && this.categoryData.length > 0 && this.categoryData.every(c => c.selected); }

  toggleAllTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.categoryData.forEach(c => c.selected = isChecked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, { table: 'mbr_category_status', tableId: 'pid', value: isChecked ? '1' : '0' }).subscribe();
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, { table: 'mbr_category_status', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid) }).subscribe();
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

  get isAllCopySelected(): boolean { return this.copyOptions.every(opt => opt.selected); }
  toggleAllCopy(event: Event) { const isChecked = (event.target as HTMLInputElement).checked; this.copyOptions.forEach(opt => opt.selected = isChecked); }
  checkIfAllCopySelected() { }

  get filteredData() {
    return this.categoryData.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const fercMatch = !this.filterFercId || String(item.fercId || item.ferc || '').toLowerCase().includes(this.filterFercId.toLowerCase());
      const typeMatch = !this.filterEntityType || String(item.entityType || item.type || '').toLowerCase().includes(this.filterEntityType.toLowerCase());
      const entityMatch = !this.filterEntityId || String(item.entityId || item.entity || '').toLowerCase().includes(this.filterEntityId.toLowerCase());
      const statusMatch = !this.filterStatus || String(item.catStatus || item.status || '').toLowerCase().includes(this.filterStatus.toLowerCase());
      const dateMatch = !this.filterDate || String(item.date || item.effectiveDate || '').toLowerCase().includes(this.filterDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.record || item.recordType || '').toLowerCase().includes(this.filterRecordType.toLowerCase());
      
      return globalMatch && fercMatch && typeMatch && entityMatch && statusMatch && dateMatch && recordMatch;
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

  confirmCopyData() { this.openModal('COPY_DATA'); }
  confirmImportFERC() { this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel'); }
  confirmImportOnly() { this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel'); }

  openModal(mode: string) { this.modalMode = mode as any; if (mode === 'ADD_CATEGORY') this.resetCategoryForm(); }
  closeModal() { this.modalMode = null; }
  handleFiles(files: FileList) { }

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
