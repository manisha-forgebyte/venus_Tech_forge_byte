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
import { MBREntitiestoEntitiesValidator } from '../../../../core/validators/mbr-entities-to-entities.validator';

@Component({
  selector: 'app-entities-to-entities-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Entities to Entities"
        pageSubtitle="Manage relationships between entities for the selected company"
        (testFerc)="filingModalMode = 'TEST'"
        (submitFerc)="filingModalMode = 'SUBMISSION'"
        (fileSelected)="handleFiles($event)"
        (importComplete)="loadEtoE()">
      </app-top-cards-row>

      <div class="main-content-card">
        <!-- Error State -->
        <div class="alert alert-error" *ngIf="errorMessage" style="margin: 20px; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
          <button style="margin-left: 10px; padding: 5px 10px; background: #c00; color: white; border: none; border-radius: 3px; cursor: pointer;" (click)="loadEtoE()">Retry</button>
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
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Entities to Entities</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
           </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="8"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th class="col-check"><label class="checkbox-container"><input type="checkbox" [checked]="isAllSelectedTable" (change)="toggleAllTable($event)"><span class="checkmark"></span><span class="label-text">All</span></label></th>
              <th class="col-sl">SL No</th>
              <th class="col-ferc">
                <div class="header-container">
                  <span class="label">FERC Id</span>
                  <button class="filter-toggle" (click)="toggleFilter('ferc', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'ferc'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter FERC Id..." [(ngModel)]="filterId" autofocus>
                    <button class="clear-btn" (click)="filterId = ''; activeFilter = null" *ngIf="filterId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-type">
                <div class="header-container">
                  <span class="label">Entity Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Type..." [(ngModel)]="filterType" autofocus>
                    <button class="clear-btn" (click)="filterType = ''; activeFilter = null" *ngIf="filterType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-report">
                <div class="header-container">
                  <span class="label">Reportable Entity ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('reportable', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'reportable'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterReportableId" autofocus>
                    <button class="clear-btn" (click)="filterReportableId = ''; activeFilter = null" *ngIf="filterReportableId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-docket">
                <div class="header-container">
                  <span class="label">Blanket Auth Docket#</span>
                  <button class="filter-toggle" (click)="toggleFilter('docket', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'docket'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterDocket" autofocus>
                    <button class="clear-btn" (click)="filterDocket = ''; activeFilter = null" *ngIf="filterDocket">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-utype">
                <div class="header-container">
                  <span class="label">Utility ID Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('utype', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'utype'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterUtilityType" autofocus>
                    <button class="clear-btn" (click)="filterUtilityType = ''; activeFilter = null" *ngIf="filterUtilityType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-uid">
                <div class="header-container">
                  <span class="label">Utility ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('uid', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'uid'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterUtilityId" autofocus>
                    <button class="clear-btn" (click)="filterUtilityId = ''; activeFilter = null" *ngIf="filterUtilityId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-start">
                <div class="header-container">
                  <span class="label">Start Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('start', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'start'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStartDate" autofocus>
                    <button class="clear-btn" (click)="filterStartDate = ''; activeFilter = null" *ngIf="filterStartDate">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-end">
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
            <tr *ngFor="let r of filteredData; let i = index">
              <td><label class="checkbox-container"><input type="checkbox" [(ngModel)]="r.selected" (change)="onCheckboxChange(r)"><span class="checkmark"></span></label></td>
              <td class="col-sl">{{ i + 1 }}</td>
              <td class="col-ferc">{{ r.ferc }}</td>
              <td class="col-type">{{ r.type }}</td>
              <td class="col-report">{{ r.reportableId }}</td>
              <td class="col-docket">{{ r.docket }}</td>
              <td class="col-utype">{{ r.utype }}</td>
              <td class="col-uid">{{ r.uid }}</td>
              <td class="col-start">{{ r.start }}</td>
              <td class="col-end">{{ r.end }}</td>
              <td class="col-record">{{ r.record }}</td>
              <td class="col-actions">
                <div class="action-cell">
                  <button class="action-btn copy" (click)="onCopy(r)" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg>
                  </button>
                  <button class="action-btn edit" (click)="onEdit(r)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" (click)="onDelete(r)" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Dialog -->
      <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
        <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD' || modalMode === 'EDIT'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-group">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">{{ modalMode === 'ADD' ? 'MBRDB >> Add Relationship' : 'MBRDB >> Edit Relationship' }}</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : 
                     modalMode === 'ADD' ? 'Entities to Entities Add' : 
                     modalMode === 'EDIT' ? 'Entities to Entities Edit' : 'Entities to Entities' }}
                </h2>
              </div>
            <button class="close-btn" (click)="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Add/Edit Mode Form -->
            <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
              <form class="e2e-form">
                <div class="form-row">
                  <div class="form-field">
                    <label>Reportable Entity Type: <span class="req">*</span></label>
                    <select class="form-input" [ngClass]="{ 'error': formErrors.reportableEntityType }" [(ngModel)]="formData.reportableEntityType" name="reportableEntityType" (input)="formErrors.reportableEntityType = ''" (change)="onReportableEntityTypeChange()">
                      <option value="">--Select--</option>
                      <option value="CID">Company Identifier (Format: C123456)</option>
                      <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                      <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                    </select>
                    <small class="error-text" *ngIf="formErrors.reportableEntityType">{{ formErrors.reportableEntityType }}</small>
                  </div>
                  <div class="form-field">
                    <label>Reportable Entity ID: <span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.reportableEntityId }" [(ngModel)]="formData.reportableEntityId" name="reportableEntityId" [placeholder]="getReportableEntityIdPlaceholder()" [maxlength]="getReportableEntityIdMaxLength()" (input)="formErrors.reportableEntityId = ''">
                    <small class="error-text" *ngIf="formErrors.reportableEntityId">{{ formErrors.reportableEntityId }}</small>
                    <small class="format-hint" *ngIf="formData.reportableEntityType">{{ getReportableEntityIdFormatHint() }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Utility Id:</label>
                    <input type="text" class="form-input" [(ngModel)]="formData.utilityId" name="utilityId" placeholder="Enter utility ID">
                  </div>
                  <div class="form-field">
                    <label>Utility Id Type:</label>
                    <select class="form-input" [(ngModel)]="formData.utilityIdType" name="utilityIdType">
                      <option value="">--Select--</option>
                      <option value="CID">Company Identifier (Format: C123456)</option>
                      <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                      <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Relationship Start Date: <span class="req">*</span></label>
                    <input type="date" class="form-input" [ngClass]="{ 'error': formErrors.relationshipStartDate }" [(ngModel)]="formData.relationshipStartDate" name="relationshipStartDate" (input)="formErrors.relationshipStartDate = ''">
                    <small class="error-text" *ngIf="formErrors.relationshipStartDate">{{ formErrors.relationshipStartDate }}</small>
                  </div>
                  <div class="form-field">
                    <label>Relationship End Date:</label>
                    <input type="date" class="form-input" [ngClass]="{ 'error': formErrors.relationshipEndDate }" [(ngModel)]="formData.relationshipEndDate" name="relationshipEndDate" (input)="formErrors.relationshipEndDate = ''">
                    <small class="error-text" *ngIf="formErrors.relationshipEndDate">{{ formErrors.relationshipEndDate }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Blanket Auth Docket#:</label>
                    <input type="text" class="form-input" [(ngModel)]="formData.docket" name="docket" placeholder="Enter docket number">
                  </div>
                  <div class="form-field">
                    <label>Record Type: <span class="req">*</span></label>
                    <select class="form-input" [ngClass]="{ 'error': formErrors.recordType }" [(ngModel)]="formData.recordType" name="recordType" (input)="formErrors.recordType = ''">
                      <option value="">--Select--</option>
                      <option value="New">New</option>
                      <option value="Update">Update</option>
                      <option value="Deactivate">Deactivate</option>
                    </select>
                    <small class="error-text" *ngIf="formErrors.recordType">{{ formErrors.recordType }}</small>
                  </div>
                </div>

                <!-- Conditional Reference ID field (only for Update records) -->
                <div class="form-row" *ngIf="formData.recordType === 'Update'">
                  <div class="form-field">
                    <label>Reference ID: <span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.referenceId }" [(ngModel)]="formData.referenceId" name="referenceId" placeholder="Enter reference ID" readonly>
                    <small class="error-text" *ngIf="formErrors.referenceId">{{ formErrors.referenceId }}</small>
                  </div>
                </div>
              </form>
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
  styleUrls: ['./entities-to-entities.component.scss']
})
export class EntitiesToEntitiesComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  companyId = 1;
  uid: number = 0;
  modalMode: string | null = null;

  
  searchTerm = '';
  filterId = '';
  filterType = '';
  filterReportableId = '';
  filterDocket = '';
  filterUtilityType = '';
  filterUtilityId = '';
  filterStartDate = '';
  filterEndDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;
  formData: any = {
    reportableEntityType: '',
    reportableEntityId: '',
    docket: '',
    utilityIdType: '',
    utilityId: '',
    relationshipStartDate: '',
    relationshipEndDate: '',
    recordType: '',
    referenceId: ''
  };
  formErrors: any = {
    recordType: '',
    referenceId: '',
    reportableEntityType: '',
    reportableEntityId: '',
    relationshipStartDate: '',
    relationshipEndDate: ''
  };
  editingPid: number | null = null;
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
      const idMatch = !this.filterId || String(item.ferc).toLowerCase().includes(this.filterId.toLowerCase());
      const typeMatch = !this.filterType || String(item.type).toLowerCase().includes(this.filterType.toLowerCase());
      const reportableMatch = !this.filterReportableId || String(item.reportableId).toLowerCase().includes(this.filterReportableId.toLowerCase());
      const docketMatch = !this.filterDocket || String(item.docket).toLowerCase().includes(this.filterDocket.toLowerCase());
      const utypeMatch = !this.filterUtilityType || String(item.utype).toLowerCase().includes(this.filterUtilityType.toLowerCase());
      const uidMatch = !this.filterUtilityId || String(item.uid).toLowerCase().includes(this.filterUtilityId.toLowerCase());
      const startMatch = !this.filterStartDate || String(item.start).toLowerCase().includes(this.filterStartDate.toLowerCase());
      const endMatch = !this.filterEndDate || String(item.end).toLowerCase().includes(this.filterEndDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.record).toLowerCase().includes(this.filterRecordType.toLowerCase());

      return globalMatch && idMatch && typeMatch && reportableMatch && docketMatch && utypeMatch && uidMatch && startMatch && endMatch && recordMatch;
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

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private alertService: AlertService, private confirmService: ConfirmService) {
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
        this.loadEtoE();
        this.loadCompanies();
      }
    });
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

  loadEtoE() {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getEtoEListByCID(this.companyId).subscribe({
      next: (data) => {
        const records = this.extractRecords(data);
        this.data = records.map(r => this.normalizeRecord(r));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Entities-to-Entities:', error);
        this.errorMessage = 'Failed to load Entities to Entities data. Please try again.';
        this.data = [];
        this.isLoading = false;
      }
    });
  }

  private extractRecords(apiData: any): any[] {
    if (!apiData) { return []; }
    if (Array.isArray(apiData)) {
      const tableWithRows = apiData.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
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

  private toDateInput(d: any): string {
    if (!d) return '';
    const s = String(d);
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) {
        const [m, day, y] = parts;
        return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${day.padStart(2,'0')}`;
      }
    }
    return s;
  }

  private formatDateDisplay(dateStr: any): string {
    if (!dateStr) return '';
    const s = String(dateStr);
    
    if (s.includes('T')) {
      const dateOnly = s.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      return `${month}/${day}/${year}`;
    }
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      return s;
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [year, month, day] = s.split('-');
      return `${month}/${day}/${year}`;
    }
    return s;
  }

  private normalizeRecord(record: any): any {
    return {
      ferc: '',
      type: record.reportable_entity_ID_type_CD ?? record.entity_type ?? record.Type ?? record.type ?? '',
      reportableId: record.reportable_entity_ID ?? record.reportable_entity_id ?? record.reporting_entity_id ?? record.reportableId ?? record.reportable_entity ?? '',
      docket: record.Blanket_Auth_Docket_Number ?? record.blanket_authorization_docket ?? record.blanket_auth_docket ?? record.blanketAuthDocket ?? record.docket ?? '',
      utype: record.Utility_ID_Type_CD ?? record.utility_id_type ?? record.utility_id_type_cd ?? record.utype ?? '',
      utility: record.utility_name ?? record.utility_nm ?? record.utility ?? '',
      uid: record.Utility_ID ?? record.utility_id ?? record.utility_cd ?? record.utilityId ?? record.uid ?? '',
      start: this.formatDateDisplay(record.relationship_start_date ?? record.relationshipStartDate ?? record.start_date),
      end: this.formatDateDisplay(record.relationship_end_date ?? record.relationshipEndDate ?? record.end_date),
      active: this.formatDateDisplay(record.active_date ?? record.active_date1 ?? record.active ?? ''),
      inactive: this.formatDateDisplay(record.inactive_date ?? record.inactive_date1 ?? record.inactive ?? ''),
      record: record.record_type_cd ?? record.record_type ?? '',
      pid: record.pid ?? record.Pid ?? 0,
      gid: record.gid ?? record.Gid ?? 0,
      selected: !!record.selected || !!record.IncInFiling || false,
      raw: record
    };
  }

  onEdit(r: any) {
    this.modalMode = 'EDIT';
    this.editingPid = r.pid;
    this.formData = {
      reportableEntityType: r.raw?.reportable_entity_ID_type_CD || '',
      reportableEntityId: r.raw?.reportable_entity_ID || '',
      docket: r.raw?.Blanket_Auth_Docket_Number || '',
      utilityIdType: r.raw?.Utility_ID_Type_CD || '',
      utilityId: r.raw?.Utility_ID || '',
      relationshipStartDate: this.toDateInput(r.raw?.relationship_start_date1 || r.raw?.relationship_start_date),
      relationshipEndDate: this.toDateInput(r.raw?.relationship_end_date1 || r.raw?.relationship_end_date),
      recordType: r.raw?.record_type_cd || '',
      referenceId: r.raw?.reference_id ? String(r.raw.reference_id) : ''
    };
  }

  onCopy(r: any) {
    this.modalMode = 'ADD';
    this.editingPid = null;
    this.formData = {
      reportableEntityType: r.raw?.reportable_entity_ID_type_CD || '',
      reportableEntityId: r.raw?.reportable_entity_ID || '',
      docket: r.raw?.Blanket_Auth_Docket_Number || '',
      utilityIdType: r.raw?.Utility_ID_Type_CD || '',
      utilityId: r.raw?.Utility_ID || '',
      relationshipStartDate: this.toDateInput(r.raw?.relationship_start_date1 || r.raw?.relationship_start_date),
      relationshipEndDate: this.toDateInput(r.raw?.relationship_end_date1 || r.raw?.relationship_end_date),
      recordType: 'New',
      referenceId: ''
    };
  }

  async onDelete(r: any) {
    if (!await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) return;
    const pid = r.pid || 0;
    const gid = r.gid || 0;
    this.apiService.deleteEtoEByID(pid, gid).subscribe({
      next: () => {
        this.toast.success('Deleted successfully');
        this.loadEtoE();
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        this.toast.error('Failed to delete record');
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

  openModal(mode: string) {
    this.modalMode = mode;
    if (mode === 'ADD') {
      this.resetForm();
      this.editingPid = null;
    }
  }

  onReportableEntityTypeChange() {
    
    this.formData.reportableEntityId = '';
    this.formErrors.reportableEntityId = '';
  }

  getReportableEntityIdPlaceholder(): string {
    const type = this.formData.reportableEntityType;
    if (type === 'CID') return 'e.g., C123456';
    if (type === 'LEI') return 'e.g., ABC1234567890123';
    if (type === 'GID') return 'e.g., GID1234567';
    return 'Enter entity ID';
  }

  getReportableEntityIdMaxLength(): number {
    const type = this.formData.reportableEntityType;
    if (type === 'LEI') return 20;
    return 50; 
  }

  getReportableEntityIdFormatHint(): string {
    const type = this.formData.reportableEntityType;
    if (type === 'CID') return 'Format: C followed by 6 digits (e.g., C123456)';
    if (type === 'LEI') return 'Limit to 20 characters';
    if (type === 'GID') return 'Format: GID followed by 7 digits (e.g., GID1234567)';
    return '';
  }

  closeModal() {
    this.modalMode = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      reportableEntityType: '',
      reportableEntityId: '',
      docket: '',
      utilityIdType: '',
      utilityId: '',
      relationshipStartDate: '',
      relationshipEndDate: '',
      recordType: '',
      referenceId: ''
    };
    this.formErrors = {
      recordType: '',
      referenceId: '',
      reportableEntityType: '',
      reportableEntityId: '',
      relationshipStartDate: '',
      relationshipEndDate: ''
    };
    this.editingPid = null;
  }

  saveData() {
    
    const validation = MBREntitiestoEntitiesValidator.validateRecord(this.formData);
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

    const isEditMode = this.modalMode === 'EDIT' && this.editingPid;

    const payload: any = {
      record_type_fk: null,
      pid: isEditMode ? this.editingPid : 0,  
      cid: parseInt(this.companyId.toString()),
      entities_entities_id: null,
      reporting_entity_cid_cd: '',
      mbr_submission_fk: null,
      active_date: null,
      inactive_date: null,
      updated_record_id: null,
      record_type_cd: this.formData.recordType,
      reference_id: this.formData.recordType === 'Update' ? parseInt(this.formData.referenceId, 10) : null,
      reportable_entity_ID_type_CD: this.formData.reportableEntityType,
      reportable_entity_ID: this.formData.reportableEntityId,
      blanket_Auth_Docket_Number: this.formData.docket || '',
      utility_ID_Type_CD: this.formData.utilityIdType || '',
      utility_ID: this.formData.utilityId || '',
      relationship_start_date: MBREntitiestoEntitiesValidator.toIsoDateTime(this.formData.relationshipStartDate),
      relationship_end_date: MBREntitiestoEntitiesValidator.toIsoDateTime(this.formData.relationshipEndDate),
      uid: this.uid,  
      isActive: true
    };

    console.log('[saveEtoE] Payload:', JSON.stringify(payload, null, 2));

    this.apiService.insUpdEtoEUIWithResponse(payload).subscribe({
      next: (resp: any) => {
        console.log('[saveEtoE] Response:', resp);
        this.toast.success(`Record ${this.modalMode === 'ADD' ? 'added' : 'updated'} successfully!`);
        this.closeModal();
        this.loadEtoE();
      },
      error: (error: any) => {
        console.error('[saveEtoE] Error:', error);
        this.toast.error('Failed to save record');
        this.isLoading = false;
      }
    });
  }


  
  get isAllSelectedTable(): boolean {
    return this.data && this.data.length > 0 && this.data.every(a => a.selected);
  }

  toggleAllTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.data) { return; }
    this.data.forEach(a => a.selected = isChecked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'entities_to_entities', tableId: 'pid', value: isChecked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'entities_to_entities', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
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
