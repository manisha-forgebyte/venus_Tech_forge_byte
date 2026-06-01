import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CompanyContextService } from '../../../../core/services/company-context.service';
import { TopCardsRowComponent } from '../../../../shared/components/top-cards-row/top-cards-row.component';
import { FilingFlagsModalComponent } from '../../../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { BalancingAuthorityDropdownComponent } from '../../../../shared/components/balancing-authority-dropdown/balancing-authority-dropdown.component';
import { SanitizeInputDirective } from '../../../../shared/directives/sanitize-input.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { MBRIndicativePssValidator } from '../../../../core/validators/mbr-indicative-pss.validator';

@Component({
  selector: 'app-indicative-pss-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Indicative PSS"
        pageSubtitle="Indicative PSS list"
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
              <span class="legend-item copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg> Copy</span>
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
            <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Indicative PSS</button>
            <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="6"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th class="col-check"><label class="checkbox-container"><input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)"><span class="checkmark"></span><span class="label-text">All</span></label></th>
              <th class="col-sl">SL No</th>
              <th class="col-id">
                <div class="header-container">
                  <span class="label">FERC ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('ferc', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'ferc'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterFercId" autofocus>
                    <button class="clear-btn" (click)="filterFercId = ''; activeFilter = null" *ngIf="filterFercId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-study-type">
                <div class="header-container">
                  <span class="label">Study Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStudyType" autofocus>
                    <button class="clear-btn" (click)="filterStudyType = ''; activeFilter = null" *ngIf="filterStudyType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-study-year">
                <div class="header-container">
                  <span class="label">Study End Year</span>
                  <button class="filter-toggle" (click)="toggleFilter('year', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'year'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEndYear" autofocus>
                    <button class="clear-btn" (click)="filterEndYear = ''; activeFilter = null" *ngIf="filterEndYear">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-ba">
                <div class="header-container">
                  <span class="label">Study Area BA</span>
                  <button class="filter-toggle" (click)="toggleFilter('ba', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'ba'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterBA" autofocus>
                    <button class="clear-btn" (click)="filterBA = ''; activeFilter = null" *ngIf="filterBA">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-scenario">
                <div class="header-container">
                  <span class="label">Scenario Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('scenario', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'scenario'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterScenario" autofocus>
                    <button class="clear-btn" (click)="filterScenario = ''; activeFilter = null" *ngIf="filterScenario">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-params">
                <div class="header-container">
                  <span class="label">Study Parameters</span>
                  <button class="filter-toggle" (click)="toggleFilter('params', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'params'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterParams" autofocus>
                    <button class="clear-btn" (click)="filterParams = ''; activeFilter = null" *ngIf="filterParams">Clear</button>
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
              <td class="col-id">{{ item.indicativePssId || '' }}</td>
              <td class="col-study-type">{{ item.studyTypeCd || '' }}</td>
              <td class="col-study-year">{{ item.studyEndYear || '' }}</td>
              <td class="col-ba">{{ item.studyAreaBalancingAuthority || '' }}</td>
              <td class="col-scenario">{{ item.scenarioTypeDesc || '' }}</td>
              <td class="col-params"><button type="button" (click)="$event.stopPropagation(); openStudyParameters(item)" class="params-link" title="View Study Parameters">( {{ item.studyParametersCount || 0 }} )&nbsp;<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m7-7H5"/></svg></button></td>
              <td class="col-actions"><div class="action-cell"><button class="action-btn copy" (click)="onCopy(item)" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg></button><button class="action-btn edit" (click)="onEdit(item)" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" (click)="onDelete(item)" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
        <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'VIEW' || modalMode === 'EDIT_PARAM'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
              <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
              <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">MBRDB >> {{ modalMode === 'ADD' ? 'Add' : 'Edit' }} Indicative PSS</span>
              <h2 class="main-title">
                {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : 
                   modalMode === 'ADD' ? 'Indicative PSS Add' : 'Indicative PSS Edit' }}
              </h2>
            </div>
            <button class="close-btn" (click)="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="add-form">
              <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                <div class="form-row">
                  <div class="form-field" [class.error-field]="isFieldErrorVisible('studyType')">
                    <label>Study Type:*</label>
                    <select class="form-input" [(ngModel)]="formData.studyTypeCd">
                      <option value="">-- Select --</option>
                      <option value="New">New</option>
                      <option value="Update">Update</option>
                      <option value="Deactivate">Deactivate</option>
                    </select>
                    <span class="error-message" *ngIf="isFieldErrorVisible('studyType')">{{ getFieldError('studyType') }}</span>
                  </div>
                  <div class="form-field" [class.error-field]="isFieldErrorVisible('studyAmendedReference')">
                    <label>Previous Study Reference ID:</label>
                    <select class="form-input" [(ngModel)]="formData.previousStudyRefId">
                      <option value="">-- Select --</option>
                    </select>
                    <span class="error-message" *ngIf="isFieldErrorVisible('studyAmendedReference')">{{ getFieldError('studyAmendedReference') }}</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field" [class.error-field]="isFieldErrorVisible('studyEndYear')">
                    <label>Study End Year#:*</label>
                    <input type="text" class="form-input" [(ngModel)]="formData.studyEndYear" placeholder="e.g. 2019" maxlength="100">
                    <span class="error-message" *ngIf="isFieldErrorVisible('studyEndYear')">{{ getFieldError('studyEndYear') }}</span>
                  </div>
                  <div class="form-field" [class.error-field]="isFieldErrorVisible('studyAreaBalancingAuthority')">
                    <label>Study Area Balancing Authority:*</label>
                    <app-balancing-authority-dropdown
                      [(ngModel)]="formData.studyAreaBalancingAuthorityCd"
                      [balancingAuthorities]="balancingAuthorities">
                    </app-balancing-authority-dropdown>
                    <span class="error-message" *ngIf="isFieldErrorVisible('studyAreaBalancingAuthority')">{{ getFieldError('studyAreaBalancingAuthority') }}</span>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-field" [class.error-field]="isFieldErrorVisible('scenarioType')">
                    <label>Scenario Type:*</label>
                    <select class="form-input" [(ngModel)]="formData.scenarioType">
                      <option value="">-- Select --</option>
                      <option value="1">Base Case</option>
                      <option value="2">Sensitivity Analysis</option>
                    </select>
                    <span class="error-message" *ngIf="isFieldErrorVisible('scenarioType')">{{ getFieldError('scenarioType') }}</span>
                  </div>
                  <div class="form-field">
                    <label>Study Parameter Data:*</label>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">After saving this information, please enter the Study Parameter Data from main screen by clicking the icon <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m7-7H5"/></svg></p>
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
              <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                <button class="btn-modal btn-submit" (click)="saveData()">{{ modalMode === 'ADD' ? 'Add' : 'Update' }}</button>

                <button class="btn-modal btn-save" (click)="resetForm()">Reset</button>
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

      <div class="modal-overlay" *ngIf="studyParametersModalMode" (click)="closeStudyParametersModal()">
        <div class="modal-content study-params-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
                <span class="sub-title">MBRDB >> Study Parameters</span>
                <h2 class="main-title">Indicative PSS Study Parameters</h2>
              </div>
            <button class="close-btn" (click)="closeStudyParametersModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <app-skeleton-loader *ngIf="isParamsLoading" type="table" [rows]="4" [columns]="4"></app-skeleton-loader>
            <div class="params-table-wrapper" *ngIf="!isParamsLoading">
              <table class="study-params-table">
                <thead>
                  <tr>
                    <th class="col-no">No.</th>
                    <th class="col-param">Study Parameter</th>
                    <th class="col-value">Study Parameter Value</th>
                    <th class="col-reference">Study Parameter Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let param of studyParametersData; let i = index" [class.alt-row]="i % 2 === 1">
                    <td class="col-no">{{ param.paramNo }}</td>
                    <td class="col-param">{{ param.paramName }}</td>
                    <td class="col-value">
                      <input type="number" [(ngModel)]="param.paramValue" maxlength="9" class="param-input">
                    </td>
                    <td class="col-reference">
                      <input type="number" [(ngModel)]="param.paramReference" class="param-input">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer center-buttons">
            <button class="btn-modal btn-submit" (click)="saveStudyParameters()">Save</button>
            <button class="btn-modal btn-save" (click)="resetStudyParameters()">Reset</button>
            <button class="btn-modal btn-reset" (click)="closeStudyParametersModal()">Close</button>
          </div>
        </div>
      </div>

      <app-filing-flags-modal [mode]="filingModalMode" (closed)="filingModalMode = null"></app-filing-flags-modal>
    </div>
  `,
  styleUrls: ['./indicative-pss.component.scss']
})
export class IndicativePssComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 1;

  
  editingPid: number | null = null;
  editingIndicativePssId: number | null = null;
  balancingAuthorities: any[] = [];
  cachedPid: number = 1;

  
  isParamsLoading = false;
  studyParametersModalMode: string | null = null;
  studyParametersData: any[] = [];
  studyParametersDataBackup: any[] = [];
  currentStudyParamsPid: number = 0;
  currentStudyParamsIndicativePssId: number | null = null;
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
      const fercMatch = !this.filterFercId || String(item.indicativePssId || '').toLowerCase().includes(this.filterFercId.toLowerCase());
      const typeMatch = !this.filterStudyType || String(item.studyTypeCd || '').toLowerCase().includes(this.filterStudyType.toLowerCase());
      const yearMatch = !this.filterEndYear || String(item.studyEndYear || '').toLowerCase().includes(this.filterEndYear.toLowerCase());
      const baMatch = !this.filterBA || String(item.studyAreaBalancingAuthority || '').toLowerCase().includes(this.filterBA.toLowerCase());
      const scenarioMatch = !this.filterScenario || String(item.scenarioTypeDesc || '').toLowerCase().includes(this.filterScenario.toLowerCase());
      const paramMatch = !this.filterParams || String(item.studyParametersCount || '').toLowerCase().includes(this.filterParams.toLowerCase());
      
      return globalMatch && fercMatch && typeMatch && yearMatch && baMatch && scenarioMatch && paramMatch;
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
  filterFercId = '';
  filterStudyType = '';
  filterEndYear = '';
  filterBA = '';
  filterScenario = '';
  filterParams = '';
  activeFilter: string | null = null;

  formData: any = { 
    studyTypeCd: '',
    previousStudyRefId: '',
    studyEndYear: '',
    studyAreaBalancingAuthorityCd: '',
    scenarioType: '',
    studyParameter: '',
    studyParameterValue: '',
    studyParameterReference: '',
    recordType: 'New'
  };

  formErrors: any = {
    studyType: '',
    studyAmendedReference: '',
    studyEndYear: '',
    studyAreaBalancingAuthority: '',
    scenarioType: '',
    studyParameter: '',
    studyParameterValue: '',
    studyParameterReference: ''
  };

  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit(): void {
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

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getIPSSListByCID(this.companyId).subscribe({
      next: (response: any) => {
        
        let records: any[] = [];
        if (Array.isArray(response)) {
          records = response;
        } else if (response && typeof response === 'object') {
          const possibleKeys = ['rows', 'data', 'result', 'Result', 'value', '$values', 'items', 'records', 'list'];
          for (const key of possibleKeys) {
            if (Array.isArray(response[key])) {
              records = response[key];
              break;
            }
          }
          if (records.length === 0) {
            for (const key of Object.keys(response)) {
              if (Array.isArray(response[key])) {
                records = response[key];
                break;
              }
            }
          }
        }
        
        this.data = records.map((r: any) => ({
          pid: r.pid ?? r.id ?? '',
          indicativePssId: '',
          studyTypeCd: r.study_type_cd ?? r.Study_type_cd ?? '',
          studyEndYear: r.study_end_year ?? r.Study_end_year ?? '',
          studyAreaBalancingAuthority: r.Study_area_balancing_authority ?? r.study_area_balancing_authority ?? '',
          scenarioTypeDesc: r.scenario_type_desc ?? r.Scenario_type_desc ?? '',
          studyParametersCount: r.Total ?? r.total ?? r.study_parameters_count ?? 0,
          recordTypeCd: r.study_type_cd ?? r.record_type_cd ?? 'New',
          raw: r,
          selected: !!r.IncInFiling || false
        }));

        if (this.data.length > 0) {
          const maxPid = Math.max(...this.data.map(i => Number(i.pid) || 0));
          this.cachedPid = maxPid + 1;
        } else {
          this.cachedPid = 1;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading indicative PSS:', err);
        this.errorMessage = 'Failed to load indicative PSS. Please try again.';
        this.isLoading = false;
      }
    });
  }

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
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

  loadDropdowns() {
    console.log('[loadDropdowns] Starting dropdown load...');
    
    this.apiService.getDropDownList('lookbaa', 'ID', 'baa_desc').subscribe({
      next: (res) => { 
        this.balancingAuthorities = (res && Array.isArray(res)) ? res : []; 
        console.log('[loadDropdowns] BA list loaded:', this.balancingAuthorities.length);
      },
      error: (err) => { console.error('Error loading BA list:', err); }
    });
  }

  openModal(mode: string) { 
    if (mode === 'ADD') {
      this.resetForm();
      this.editingPid = null;
      this.editingIndicativePssId = null;
    }
    this.modalMode = mode; 
  }

  closeModal() { this.modalMode = null; this.resetForm(); }

  resetForm() { 
    this.formData = { 
      studyTypeCd: '',
      previousStudyRefId: '',
      studyEndYear: '',
      studyAreaBalancingAuthorityCd: '',
      scenarioType: '',
      recordType: 'New'
    }; 
    this.editingPid = null;
    this.editingIndicativePssId = null;
  }

  getUidFromStorage(): number {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.uid || user.id || 1;
      }
    } catch (e) { }
    return 1;
  }



  saveData() {
    
    const validation = MBRIndicativePssValidator.validateRecord(this.formData);
    this.formErrors = validation.errors;

    if (!validation.valid) {
      
      for (const [field, error] of Object.entries(this.formErrors)) {
        if (error) {
          this.toast.error(`${field}: ${error}`);
          return;
        }
      }
    }

    this.isLoading = true;
    const uid = this.getUidFromStorage();
    const isEditMode = this.modalMode === 'EDIT';
    const targetPid = isEditMode ? (this.editingPid || 0) : 0;

    const payload: any = {
      record_type_fk: isEditMode ? 2 : 1,
      pid: targetPid,
      cid: this.companyId,
      indicative_pss_id: isEditMode ? this.editingIndicativePssId : null,
      indicative_pss_study_id: null,
      reporting_entity_cid_cd: null,
      mbr_submission_fk: targetPid,
      study_type_cd: this.formData.studyTypeCd || "New",
      study_amended_reference_fk: null,
      pss_study_reference_fk: null,
      study_end_year: String(this.formData.studyEndYear),
      study_area_balancing_authority_cd: this.formData.studyAreaBalancingAuthorityCd,
      scenario_type: Number(this.formData.scenarioType) || 0,
      study_parameter: null,
      study_parameter_value: null,
      study_parameter_reference: null,
      record_type_cd: this.formData.studyTypeCd || "New",
      uid: Number(uid),
      isActive: true,
      IsActive: true,
      active_date: null,
      inactive_date: null,
      pss_StudyParameters: [
        {
          "study_parameter_Id": 1,
          "parameters": [
            {
              "study_parameter_value": null,
              "study_parameter_reference": null
            }
          ]
        }
      ]
    };

    console.log('[IPSSsaveData] Submitting payload:', JSON.stringify(payload, null, 2));

    this.apiService.insUpdIPSSUIWithResponse(payload).subscribe({
      next: (res: any) => {
        console.log('Saved indicative PSS - Response Status:', res.status, 'Body:', res.body);
        if ([200, 201, 204].includes(res.status)) {
          this.toast.success(this.modalMode === 'ADD' ? 'PSS added.' : 'PSS updated.');
          this.closeModal();
          setTimeout(() => this.loadData(), 500);
        } else {
          this.toast.warning('Record saved but server returned status: ' + res.status);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error saving indicative PSS:', err);
        this.toast.error('Failed to save. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onCopy(item: any) {
    const r = item.raw ?? item;
    this.formData = {
      studyTypeCd: r.study_type_cd ?? '',
      previousStudyRefId: '',
      studyEndYear: r.study_end_year ?? '',
      studyAreaBalancingAuthorityCd: r.study_area_balancing_authority_cd ?? '',
      scenarioType: r.scenario_type ?? '',
      recordType: 'New'
    };
    this.editingPid = null;
    this.editingIndicativePssId = null;
    this.modalMode = 'ADD';
  }

  onEdit(item: any) {
    const r = item.raw ?? item;
    this.formData = {
      studyTypeCd: r.study_type_cd ?? '',
      previousStudyRefId: '',
      studyEndYear: r.study_end_year ?? '',
      studyAreaBalancingAuthorityCd: r.study_area_balancing_authority_cd ?? '',
      scenarioType: r.scenario_type ?? '',
      recordType: r.record_type_cd ?? 'New'
    };
    this.editingPid = r.pid ?? 0;
    this.editingIndicativePssId = r.indicative_pss_id ?? null;
    this.modalMode = 'EDIT';
  }

  async onDelete(item: any) { 
    if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { 
      const r = item.raw ?? item; 
      this.apiService.deleteIPSSByID(r.pid ?? 0, r.indicative_pss_id ?? 0).subscribe({
        next: () => { 
          this.toast.success('Record deleted.');
          this.loadData(); 
        }, 
        error: (e: any) => { 
          console.error(e); 
          this.toast.error('Delete failed'); 
        }
      }); 
    } 
  }

  openStudyParameters(item: any) {
    const r = item.raw ?? item;
    this.currentStudyParamsPid = r.pid ?? 0;
    this.currentStudyParamsIndicativePssId = r.indicative_pss_id ?? null;
    this.studyParametersData = [];
    this.studyParametersDataBackup = [];
    this.modalMode = null;
    this.studyParametersModalMode = 'VIEW';
    this.loadStudyParameters();
  }

  loadStudyParameters() {
    this.isParamsLoading = true;
    this.apiService.getIPSSParamsListByCIDAndId(this.companyId, this.currentStudyParamsPid).subscribe({
      next: (res: any) => {
        this.studyParametersData = (Array.isArray(res) ? res : []).map((r: any, index: number) => ({
          paramNo: r.study_parameter ?? index + 1,
          paramName: r.study_param ?? '',
          paramValue: r.study_parameter_value ?? '',
          paramReference: r.study_parameter_reference ?? '',
          pid: r.pid ?? this.currentStudyParamsPid,
          cid: r.cid ?? this.companyId
        }));
        this.studyParametersDataBackup = JSON.parse(JSON.stringify(this.studyParametersData));
        this.isParamsLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading study parameters:', err);
        this.errorMessage = 'Failed to load study parameters.';
        this.isParamsLoading = false;
      }
    });
  }

  async saveStudyParameters() {
    if (!await this.confirmService.show('Save changes to study parameters?', 'Save Changes', 'Save', 'Cancel')) return;
    
    this.isLoading = true;
    const payload = this.studyParametersData.map(p => ({
      pid: p.pid,
      cid: p.cid,
      study_parameter: p.paramNo,
      study_param: p.paramName,
      study_parameter_value: p.paramValue,
      study_parameter_reference: p.paramReference
    }));

    this.apiService.bulkImportIPSSStudy(payload).subscribe({
      next: (res: any) => {
        console.log('Study parameters saved:', res);
        this.toast.success('Study parameters saved successfully.');
        this.closeStudyParametersModal();
        this.loadData();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error saving study parameters:', err);
        this.toast.error('Failed to save study parameters.');
        this.isLoading = false;
      }
    });
  }

  async resetStudyParameters() {
    if (await this.confirmService.show('Reset all changes?', 'Reset Form', 'Reset', 'Cancel')) {
      this.studyParametersData = JSON.parse(JSON.stringify(this.studyParametersDataBackup));
    }
  }

  closeStudyParametersModal() {
    this.studyParametersModalMode = null;
    this.studyParametersData = [];
    this.studyParametersDataBackup = [];
  }

  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.data.forEach(x => x.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'indicative_pss', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'indicative_pss', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  get isAllSelected(): boolean { return this.data.length > 0 && this.data.every(x => x.selected); }

  confirmCopyData() {
    this.openModal('COPY_DATA');
  }

  confirmImportFERC() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
  }

  confirmImportOnly() {
    this.confirmService.show('Are you sure you want to import/update data from FERC?', 'Import FERC Data', 'Import', 'Cancel');
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

  
  isFieldErrorVisible(fieldName: string): boolean {
    return this.formErrors && this.formErrors[fieldName];
  }

  getFieldError(fieldName: string): string {
    return this.formErrors && this.formErrors[fieldName] ? this.formErrors[fieldName] : '';
  }

}
