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
import { MBRMitigationValidator } from '../../../../core/validators/mbr-mitigation.validator';
import { DateFormatterService } from '../../../../core/services/date-formatter.service';

@Component({
  selector: 'app-mitigations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Mitigations"
        pageSubtitle="Mitigations List"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadMitigations()">
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
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Mitigations</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD_MITIGATION')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- Table -->
        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="8"></app-skeleton-loader>
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
                 <th class="col-bal-auth">
                  <div class="header-container">
                    <span class="label">Balancing Authority</span>
                    <button class="filter-toggle" (click)="toggleFilter('ba', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'ba'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterBA" autofocus>
                      <button class="clear-btn" (click)="filterBA = ''; activeFilter = null" *ngIf="filterBA">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-mit-name">
                  <div class="header-container">
                    <span class="label">Mitigation Naming</span>
                    <button class="filter-toggle" (click)="toggleFilter('desc', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'desc'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterDescription" autofocus>
                      <button class="clear-btn" (click)="filterDescription = ''; activeFilter = null" *ngIf="filterDescription">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-eff-date">
                   <div class="header-container">
                     <span class="label">Effective Date</span>
                     <button class="filter-toggle" (click)="toggleFilter('start', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'start'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStartDate" autofocus>
                       <button class="clear-btn" (click)="filterStartDate = ''; activeFilter = null" *ngIf="filterStartDate">Clear</button>
                     </div>
                   </div>
                </th>
                <th class="col-end-date">
                   <div class="header-container">
                     <span class="label">End Date</span>
                     <button class="filter-toggle" (click)="toggleFilter('end', $event)">
                       <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div class="filter-dropdown" *ngIf="activeFilter === 'end'" (click)="$event.stopPropagation()">
                       <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEndDate" autofocus>
                       <button class="clear-btn" (click)="filterEndDate = ''; activeFilter = null" *ngIf="filterEndDate">Clear</button>
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
                <td class="col-sl">{{ item.sl }}</td>
                <td class="col-ferc-id">{{ item.fercId }}</td>
                <td class="col-bal-auth">{{ item.balAuth }}</td>
                <td class="col-mit-name">{{ item.mitName }}</td>
                <td class="col-eff-date">{{ item.effDate }}</td>
                <td class="col-end-date">{{ item.endDate }}</td>
                <td class="col-record">{{ item.record }}</td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button class="action-btn edit" (click)="openEditMitigation(item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete" (click)="onDeleteMitigation(item)">
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
          <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION'" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >>Copy Data To Selected Company</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION'">MBRDB >> Add Mitigation</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data To Selected Company' :
                     (modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION') ? 'Mitigation Add' : 'Mitigation' }}
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

              <!-- Add/Edit Mitigation Form -->
              <ng-container *ngIf="modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION'">
                <div class="add-mitigation-form">
                  <div class="form-row">
                    <div class="form-field">
                      <label>Balancing Authority: <span class="req">*</span></label>
                      <app-balancing-authority-dropdown 
                        [(ngModel)]="mitigationForm.balancingAuthorityCd"
                        [ngClass]="{ 'error': mitigationFormErrors.balancingAuthorityCd }"
                        [balancingAuthorities]="balancingAuthorities"
                        (ngModelChange)="mitigationFormErrors.balancingAuthorityCd = ''">
                      </app-balancing-authority-dropdown>
                      <small class="error-text" *ngIf="mitigationFormErrors.balancingAuthorityCd">{{ mitigationFormErrors.balancingAuthorityCd }}</small>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Effective Date: <span class="req">*</span></label>
                      <input type="date" class="mitigation-input" [class.error]="mitigationFormErrors.effectiveDate" [(ngModel)]="mitigationForm.effectiveDate" (input)="mitigationFormErrors.effectiveDate = ''" name="effectiveDate">
                      <small class="error-text" *ngIf="mitigationFormErrors.effectiveDate">{{ mitigationFormErrors.effectiveDate }}</small>
                      <small class="hint-text" style="color: #666; font-size: 12px; margin-top: 2px; display: block;">Defaults to 01/01/1960 if not provided</small>
                    </div>
                    <div class="form-field">
                      <label>End Date:</label>
                      <input type="date" class="mitigation-input" [class.error]="mitigationFormErrors.endDate" [(ngModel)]="mitigationForm.endDate" (input)="mitigationFormErrors.endDate = ''" name="endDate">
                      <small class="error-text" *ngIf="mitigationFormErrors.endDate">{{ mitigationFormErrors.endDate }}</small>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Mitigation Narrative: <span class="req">*</span></label>
                      <input type="text" class="mitigation-input" [class.error]="mitigationFormErrors.mitigationNarrative" [(ngModel)]="mitigationForm.mitigationNarrative" (input)="mitigationFormErrors.mitigationNarrative = ''" name="mitigationNarrative" placeholder="e.g., Change">
                      <small class="error-text" *ngIf="mitigationFormErrors.mitigationNarrative">{{ mitigationFormErrors.mitigationNarrative }}</small>
                    </div>
                    <div class="form-field">
                      <label>Record Type: <span class="req">*</span></label>
                      <div class="select-wrapper">
                         <select class="mitigation-input" [class.error]="mitigationFormErrors.recordType" [(ngModel)]="mitigationForm.recordType" (ngModelChange)="onMitigationRecordTypeChange($event)" name="recordType">
                            <option value="New">New</option>
                            <option value="Update">Update</option>
                            <option value="Deactivate">Deactivate</option>
                         </select>
                      </div>
                      <small class="error-text" *ngIf="mitigationFormErrors.recordType">{{ mitigationFormErrors.recordType }}</small>
                    </div>
                  </div>

                  <!-- Reference ID - Show only when Record Type is "Update" -->
                  <div class="form-row" *ngIf="mitigationForm.recordType === 'Update'">
                    <div class="form-field">
                      <label>Reference ID: <span class="req">*</span></label>
                      <input type="text" class="mitigation-input" [class.error]="mitigationFormErrors.referenceId" [(ngModel)]="mitigationForm.referenceId" name="referenceId" placeholder="Enter existing Mitigation ID" readonly>
                      <small class="error-text" *ngIf="mitigationFormErrors.referenceId">{{ mitigationFormErrors.referenceId }}</small>
                      <small class="hint-text">Must match an existing Mitigation ID</small>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>

            <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION'">
              <!-- Add/Edit Buttons -->
              <ng-container *ngIf="modalMode === 'ADD_MITIGATION' || modalMode === 'EDIT_MITIGATION'">
                <button class="btn-modal btn-submit compact" (click)="saveMitigation()">{{ modalMode === 'ADD_MITIGATION' ? 'Add' : 'Update' }}</button>
                <button class="btn-modal btn-save compact" (click)="resetMitigationForm()">Reset</button>
                <button class="btn-modal btn-cancel compact" (click)="closeModal()">Cancel</button>
              </ng-container>

              <!-- Copy Data Buttons -->
              <ng-container *ngIf="modalMode === 'COPY_DATA'">
                <button class="btn-modal btn-submit" (click)="submitCopyData()">Copy Selected Screens</button>
                <button class="btn-modal btn-save" (click)="resetMitigationForm()">Reset</button>
                <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
              </ng-container>
            </div>
          </div>
        </div>

      <app-filing-flags-modal [mode]="filingModalMode" (closed)="filingModalMode = null"></app-filing-flags-modal>
    </div>
  `,
  styleUrls: ['./mitigations.component.scss']
})
export class MitigationsComponent implements OnInit {
  modalMode: 'COPY_DATA' | 'ADD_MITIGATION' | 'EDIT_MITIGATION' | null = null;

  
  isLoading = false;
  errorMessage = '';
  companyId = 1;
  uid = 1;
  companies: any[] = [];
  currentCompanyName: string = 'Loading...';

  
  
  mitigationForm = {
    balancingAuthorityCd: '',
    mitigationNarrative: '',
    effectiveDate: '',
    endDate: '',
    recordType: 'New',
    referenceId: ''
  };

  
  mitigationFormErrors = {
    recordType: '',
    referenceId: '',
    balancingAuthorityCd: '',
    mitigationNarrative: '',
    effectiveDate: '',
    endDate: ''
  };

  
  editingMitigationId: number | null = null;
  editingPid: number | null = null;

  
  balancingAuthorities: any[] = [];

  
  mitigationsData: any[] = []; 
  
  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  
  searchTerm = '';
  filterFercId = '';
  filterBA = '';
  filterDescription = '';
  filterStartDate = '';
  filterEndDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;

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
    return this.mitigationsData.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const fercMatch = !this.filterFercId || String(item.fercId || item.ferc || '').toLowerCase().includes(this.filterFercId.toLowerCase());
      const baMatch = !this.filterBA || String(item.balancingAuthority || item.ba || '').toLowerCase().includes(this.filterBA.toLowerCase());
      const descMatch = !this.filterDescription || String(item.mitigationNarrative || item.description || '').toLowerCase().includes(this.filterDescription.toLowerCase());
      const startMatch = !this.filterStartDate || String(item.effectiveDate || item.startDate || '').toLowerCase().includes(this.filterStartDate.toLowerCase());
      const endMatch = !this.filterEndDate || String(item.endDate || '').toLowerCase().includes(this.filterEndDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType || item.record || '').toLowerCase().includes(this.filterRecordType.toLowerCase());
      
      return globalMatch && fercMatch && baMatch && descMatch && startMatch && endMatch && recordMatch;
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

  get isAllSelectedTable(): boolean {
    return this.mitigationsData.length > 0 && this.mitigationsData.every(item => item.selected);
  }

  toggleAllTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.mitigationsData.forEach(item => item.selected = isChecked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'mbr_mitigations', tableId: 'pid', value: isChecked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'mbr_mitigations', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
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

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
  }

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private validator: InputValidatorService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.extractUid();
    this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        const dispId = company.company_id || company.Company_ID || company.CompanyID || company.companyID || company.companyId || ('C' + this.companyId);
        this.currentCompanyName = 'Company ID - ' + dispId + ' | ' + (company.Title || company.title || company.company_name || company.CompanyName || company.COMPANY_NAME || company.full_name || company.trading_name || 'Unknown Company');
        this.loadMitigations();
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

  private extractUid() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        this.uid = user.uid ?? user.Uid ?? user.UID ?? user.userId ?? 1;
      } catch (e) { }
    }
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

  loadMitigations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getMitigationsListByCID(this.companyId).subscribe({
      next: (data) => {
        const records = this.extractRecords(data);
        this.mitigationsData = records.map((r: any, idx: number) => this.normalizeMitigation(r, idx + 1));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading mitigations:', error);
        this.errorMessage = 'Failed to load mitigations. Please try again.';
        this.isLoading = false;
        this.mitigationsData = []; 
      }
    });
  }

  private extractRecords(apiData: any): any[] {
    if (!apiData) { return []; }
    if (Array.isArray(apiData)) {
      return apiData;
    }
    if (apiData.rows && Array.isArray(apiData.rows)) {
      return apiData.rows;
    }
    return [apiData];
  }

  private normalizeMitigation(r: any, index: number) {
    return {
      sl: r.SLNO ?? index,
      fercId: '',
      balAuth: r.baa_desc ?? r.Balancing_Authority_cd ?? r.balancing_authority_cd ?? '',
      mitName: r.mitigation_narrative ?? r.narrative ?? '',
      effDate: this.dateFormatter.formatToDisplay(r.mitigation_effective_date ?? r.mitigation_effective_date1 ?? ''),
      endDate: this.dateFormatter.formatToDisplay(r.mitigation_end_date ?? r.mitigation_end_date1 ?? ''),
      record: r.record_type_cd ?? 'New',
      inactive: r.inactive_date ?? '',
      selected: !!r.IncInFiling || false,
      raw: r
    };
  }

  saveMitigation() {
    
    this.mitigationFormErrors = {
      recordType: '',
      referenceId: '',
      balancingAuthorityCd: '',
      mitigationNarrative: '',
      effectiveDate: '',
      endDate: ''
    };

    
    let err = MBRMitigationValidator.getRecordTypeCdError(this.mitigationForm.recordType);
    if (err) {
      this.mitigationFormErrors.recordType = err;
      this.toast.error(`Record Type: ${err}`);
      return;
    }

    
    if (!this.mitigationForm.effectiveDate || this.mitigationForm.effectiveDate.trim() === '') {
      this.mitigationForm.effectiveDate = '1960-01-01';
      this.toast.info('Effective Date defaulted to 01/01/1960');
    }

    
    err = MBRMitigationValidator.getBalancingAuthorityCdError(this.mitigationForm.balancingAuthorityCd);
    if (err) {
      this.mitigationFormErrors.balancingAuthorityCd = err;
      this.toast.error(`Balancing Authority: ${err}`);
      return;
    }

    
    err = MBRMitigationValidator.getMitigationNarrativeError(this.mitigationForm.mitigationNarrative);
    if (err) {
      this.mitigationFormErrors.mitigationNarrative = err;
      this.toast.error(`Mitigation Narrative: ${err}`);
      return;
    }

    
    err = MBRMitigationValidator.getMitigationEffectiveDateError(this.mitigationForm.effectiveDate);
    if (err) {
      this.mitigationFormErrors.effectiveDate = err;
      this.toast.error(`Effective Date: ${err}`);
      return;
    }

    
    err = MBRMitigationValidator.getMitigationEndDateError(this.mitigationForm.endDate, this.mitigationForm.effectiveDate);
    if (err) {
      this.mitigationFormErrors.endDate = err;
      this.toast.error(`End Date: ${err}`);
      return;
    }

    
    err = MBRMitigationValidator.getReferenceIdError(this.mitigationForm.referenceId, this.mitigationForm.recordType);
    if (err) {
      this.mitigationFormErrors.referenceId = err;
      this.toast.error(`Reference ID: ${err}`);
      return;
    }

    this.isLoading = true;
    
    
    const effectiveDateObj = new Date(this.mitigationForm.effectiveDate);
    const endDateObj = this.mitigationForm.endDate ? new Date(this.mitigationForm.endDate) : null;
    
    const effectiveDateFormatted = effectiveDateObj ? 
      `${(effectiveDateObj.getMonth() + 1).toString().padStart(2, '0')}/${effectiveDateObj.getDate().toString().padStart(2, '0')}/${effectiveDateObj.getFullYear()}` 
      : '';
    
    const endDateFormatted = endDateObj ? 
      `${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}/${endDateObj.getDate().toString().padStart(2, '0')}/${endDateObj.getFullYear()}` 
      : '';

    
    const toIsoNoTZWithMs = (d: Date) => {
      const YYYY = d.getFullYear();
      const MM = (d.getMonth() + 1).toString().padStart(2, '0');
      const DD = d.getDate().toString().padStart(2, '0');
      const hh = '00'; 
      const mm = '00';
      const ss = '00';
      return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}`;
    };

    
    const recordTypeFkMap: any = { 'New': 1, 'Update': 2, 'Correction': 3 };
    const mitData = {
      record_type_fk: null,
      pid: this.modalMode === 'EDIT_MITIGATION' ? (this.editingPid || 0) : 0, 
      cid: this.companyId,
      mbr_mitigations_id: this.editingMitigationId ?? null,
      reporting_entity_cid_cd: null,
      mbr_submission_fk: null,
      active_date: null,
      inactive_date: null,
      updated_record_id: null, 
      record_type_cd: this.validator.sanitizeText(this.mitigationForm.recordType),
      reference_id: this.mitigationForm.recordType === 'Update' ? parseInt(this.mitigationForm.referenceId, 10) : null,
      balancing_Authority_cd: this.validator.sanitizeText(this.mitigationForm.balancingAuthorityCd),
      mitigation_narrative: this.validator.sanitizeNarrative(this.mitigationForm.mitigationNarrative),
      
      mitigation_effective_date: effectiveDateObj ? toIsoNoTZWithMs(effectiveDateObj) : "",
      mitigation_end_date: endDateObj ? toIsoNoTZWithMs(endDateObj) : null,
      uid: this.uid,
      isActive: true
    };

    console.log('Sending mitigation payload:', mitData);

    this.apiService.insUpdMitigationsUIWithResponse(mitData).subscribe({
      next: (response) => {
        console.log('Mitigation saved response:', response);
        if (response.status === 200 || response.status === 201 || response.status === 204) {
          this.toast.success(`Mitigation ${this.modalMode === 'EDIT_MITIGATION' ? 'updated' : 'added'} successfully!`);
          this.closeModal();
          this.loadMitigations();
          this.resetMitigationForm();
        } else {
          this.toast.warning('Saved but received unexpected status: ' + response.status);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving mitigation:', error);
        if (error.error) {
          console.error('Error details:', error.error);
          if (error.error.errors) {
            console.error('Validation errors:', error.error.errors);
            const errorMessages = Object.keys(error.error.errors)
              .map(key => `${key}: ${error.error.errors[key].join(', ')}`)
              .join('\n');
            this.toast.error(`Validation Error: ${errorMessages}`);
          } else {
            this.toast.error('Failed to save mitigation. Please try again.');
          }
        }
        this.isLoading = false;
      }
    });
  }

  async deleteMitigation(pid: number, gid: number) {
    if (!await this.confirmService.show('Are you sure you want to delete this mitigation?', 'Confirm Delete', 'Delete', 'Cancel')) {
      return;
    }

    this.isLoading = true;
    this.apiService.deleteMitigationsByID(pid, gid).subscribe({
      next: () => {
        this.loadMitigations();
      },
      error: (error) => {
        console.error('Error deleting mitigation:', error);
        this.toast.error('Failed to delete mitigation. Please try again.');
        this.isLoading = false;
      }
    });
  }

  private formatToInputDate(val: any): string {
    return this.dateFormatter.formatToInputDate(val);
  }

  
  openEditMitigation(item: any) {
    const r = item.raw ?? item;
    
    this.mitigationForm = {
      balancingAuthorityCd: r.Balancing_Authority_cd ?? r.balancing_authority_cd ?? '',
      mitigationNarrative: r.mitigation_narrative ?? r.narrative ?? '',
      effectiveDate: this.formatToInputDate(r.mitigation_effective_date1 || r.mitigation_effective_date),
      endDate: this.formatToInputDate(r.mitigation_end_date1 || r.mitigation_end_date),
      recordType: r.record_type_cd ?? 'New',
      referenceId: r.reference_id ?? r.referenceId ?? ''
    };

    
    this.editingMitigationId = r.mbr_mitigations_id ?? r.mbr_mitigations_id_fk ?? r.id ?? null;
    this.editingPid = r.pid ?? null;

    this.modalMode = 'EDIT_MITIGATION';
  }

  resetMitigationForm() {
    this.mitigationForm = {
      balancingAuthorityCd: '',
      mitigationNarrative: '',
      effectiveDate: '',
      endDate: '',
      recordType: 'New',
      referenceId: ''
    };
    this.mitigationFormErrors = {
      recordType: '',
      referenceId: '',
      balancingAuthorityCd: '',
      mitigationNarrative: '',
      effectiveDate: '',
      endDate: ''
    };
    this.editingMitigationId = null;
    this.editingPid = null;
  }

  openModal(mode: 'COPY_DATA' | 'ADD_MITIGATION' | 'EDIT_MITIGATION') { 
    if (mode === 'ADD_MITIGATION') {
      this.resetMitigationForm();
      this.editingMitigationId = null;
    }
    this.modalMode = mode; 
  }

  onMitigationRecordTypeChange(newValue: string) {
    this.mitigationForm.recordType = newValue;
    
    if (newValue !== 'Update') {
      this.mitigationForm.referenceId = '';
      this.mitigationFormErrors.referenceId = '';
    }
  }

  closeModal() { this.modalMode = null; }

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

  async onDeleteMitigation(item: any) {
    const r = item.raw ?? item;
    const pid = r.pid ?? r.PID ?? 0;
    
    if (!pid || pid === 0) {
      if (this.toast) this.toast.error('Invalid mitigation record. Cannot delete.');
      return;
    }

    const nameDisplay = r.mitigationNarrative || r.narrative || `Mitigation #${pid}`;
    const confirmed = await this.confirmService.show(`Delete mitigation: ${nameDisplay}?`, 'Confirm Delete', 'Delete', 'Cancel');
    if (!confirmed) return;

    let gid = 0;
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
      gid = cu?.gid ?? cu?.Gid ?? cu?.GID ?? 0;
    } catch (e) {
      gid = 0;
    }

    if (gid === 0) {
      if (this.toast) this.toast.error('Unable to retrieve user context. Cannot delete.');
      return;
    }

    this.isLoading = true;
    this.apiService.deleteMitigationsByID(pid, gid).subscribe({
      next: (res) => {
        if (this.toast) this.toast.success('Mitigation deleted successfully');
        setTimeout(() => this.loadMitigations(), 500);
      },
      error: (error) => {
        console.error('[onDeleteMitigation] Delete error:', error);
        if (this.toast) this.toast.error('Failed to delete mitigation');
        this.isLoading = false;
      }
    });
  }

}
