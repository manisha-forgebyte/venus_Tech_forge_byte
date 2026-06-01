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
import { MBREntitiesToVerticalAssetsValidator } from '../../../../core/validators/mbr-entities-to-vertical-assets.validator';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-entities-to-vertical-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective, FormatDatePipe],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Entities to Vertical Assets"
        pageSubtitle="Relationships between entities and vertical assets"
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
              <span class="legend-item edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</span>
              <span class="legend-item delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 0 0 1-2 2H7a2 0 0 1-2-2V6m3 0V4a2 0 0 1 2-2h4a2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> Delete</span>
            </div>
          </div>
          <div class="action-buttons-group">
             <div class="search-box">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
             </div>
             <button class="btn btn-blue-copy" (click)="confirmCopyData()">Copy Data (All Screens)</button>
             <button class="btn btn-salmon-import" (click)="confirmImportFERC()">Import/Update Data from FERC</button>
             <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Entities to Vertical Assets</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="7"></app-skeleton-loader>
        <div class="table-container" *ngIf="!isLoading">
          <table class="entities-table">
            <thead>
              <tr>
                <th class="col-check"><label class="checkbox-container"><input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)"><span class="checkmark"></span><span class="label-text">All</span></label></th>
                <th class="col-sl">SL</th>
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
                <th class="col-entity-type">
                  <div class="header-container">
                    <span class="label">Entity Type</span>
                    <button class="filter-toggle" (click)="toggleFilter('entity', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'entity'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEntityType" autofocus>
                      <button class="clear-btn" (click)="filterEntityType = ''; activeFilter = null" *ngIf="filterEntityType">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-entity-id">Entity ID</th>
                <th class="col-asset">
                  <div class="header-container">
                    <span class="label">Vertical Code</span>
                    <button class="filter-toggle" (click)="toggleFilter('code', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'code'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterVerticalCode" autofocus>
                      <button class="clear-btn" (click)="filterVerticalCode = ''; activeFilter = null" *ngIf="filterVerticalCode">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-ba">Balancing Authority</th>
                <th class="col-date">
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
                <th class="col-date">
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
                <th class="col-notes">Notes</th>
                <th class="col-record-type">
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
                <td class="col-check"><label class="checkbox-container"><input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)"><span class="checkmark"></span></label></td>
                <td class="col-sl">{{ i + 1 }}</td>
                <td class="col-id">{{ item.recordId || '' }}</td>
                <td class="col-entity-type">{{ item.entityIdType || '' }}</td>
                <td class="col-entity-id">{{ item.entityId || '' }}</td>
                <td class="col-asset">{{ item.verticalAssetDescription || '' }}</td>
                <td class="col-ba">{{ item.balancingAuthority || '' }}</td>
                <td class="col-date">{{ item.relationshipStartDate | formatDate }}</td>
                <td class="col-date">{{ item.relationshipEndDate | formatDate }}</td>
                <td class="col-notes">{{ item.explanatoryNotes || '' }}</td>
                <td class="col-record-type">{{ item.recordTypeCd || '' }}</td>
                <td class="col-actions"><div class="action-cell"><button class="action-btn copy" (click)="onCopy(item)" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg></button><button class="action-btn edit" (click)="onEdit(item)" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" (click)="onDelete(item)" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
        <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD' || modalMode === 'EDIT'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">{{ modalMode === 'ADD' ? 'MBRDB >> Add Vertical Asset' : 'MBRDB >> Edit Vertical Asset' }}</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' :
                     modalMode === 'ADD' ? 'Vertical Asset Add' :
                     modalMode === 'EDIT' ? 'Vertical Asset Edit' : 'Vertical Assets' }}
                </h2>
              </div>
            <button class="close-btn" (click)="closeModal()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
            <div class="modal-body">
              <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                <div class="add-form">
              <div class="form-row">
                <div class="form-field" [class.error-field]="isFieldErrorVisible('entityIdType')">
                  <label>Entity Type:*</label>
                  <select class="form-input" [(ngModel)]="formData.entityIdType">
                    <option value="">--Select--</option>
                      <option value="CID">Company Identifier (Format: C123456)</option>
                      <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                      <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                  </select>
                  <span class="error-message" *ngIf="isFieldErrorVisible('entityIdType')">{{ getFieldError('entityIdType') }}</span>
                </div>
                <div class="form-field" [class.error-field]="isFieldErrorVisible('entityId')">
                  <label>Entity ID#:*</label>
                  <input type="text" class="form-input" [(ngModel)]="formData.entityId" placeholder="Enter entity ID" maxlength="100">
                  <span class="error-message" *ngIf="isFieldErrorVisible('entityId')">{{ getFieldError('entityId') }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field" [class.error-field]="isFieldErrorVisible('verticalAssetType')">
                  <label>Vertical Asset Type:*</label>
                  <select class="form-input" [(ngModel)]="formData.verticalAssetType">
                    <option value="">-- Select --</option>
                    <option value="1">1-Transmission</option>
                    <option value="2">2-Intrastate Pipeline</option>
                    <option value="3">3-Gas Storage</option>
                    <option value="4">4-Gas Distribution</option>
                    <option value="5">5-Other</option>
                  </select>
                  <span class="error-message" *ngIf="isFieldErrorVisible('verticalAssetType')">{{ getFieldError('verticalAssetType') }}</span>
                </div>
                <div class="form-field" [class.error-field]="isFieldErrorVisible('balancingAuthority')">
                  <label>Balancing Authority:*</label>
                  <app-balancing-authority-dropdown
                    [(ngModel)]="formData.balancingAuthority"
                    [balancingAuthorities]="balancingAuthorities">
                  </app-balancing-authority-dropdown>
                  <span class="error-message" *ngIf="isFieldErrorVisible('balancingAuthority')">{{ getFieldError('balancingAuthority') }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field" [class.error-field]="isFieldErrorVisible('relationshipStartDate')">
                  <label>Relationship Start Date:*</label>
                  <input type="date" class="form-input" [(ngModel)]="formData.relationshipStartDate">
                  <span class="error-message" *ngIf="isFieldErrorVisible('relationshipStartDate')">{{ getFieldError('relationshipStartDate') }}</span>
                </div>
                <div class="form-field" [class.error-field]="isFieldErrorVisible('relationshipEndDate')">
                  <label>Relationship End Date:</label>
                  <input type="date" class="form-input" [(ngModel)]="formData.relationshipEndDate">
                  <span class="error-message" *ngIf="isFieldErrorVisible('relationshipEndDate')">{{ getFieldError('relationshipEndDate') }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field" [class.error-field]="isFieldErrorVisible('explanatoryNotes')">
                  <label>Explanatory Notes:</label>
                  <textarea class="form-input" [(ngModel)]="formData.explanatoryNotes" placeholder="Enter explanatory notes" rows="2"></textarea>
                  <span class="error-message" *ngIf="isFieldErrorVisible('explanatoryNotes')">{{ getFieldError('explanatoryNotes') }}</span>
                </div>
                <div class="form-field" [class.error-field]="isFieldErrorVisible('recordType')">
                  <label>Record Type:*</label>
                  <select class="form-input" [(ngModel)]="formData.recordTypeCd">
                    <option value="New">New</option>
                    <option value="Update">Update</option>
                    <option value="Deactivate">Deactivate</option>
                  </select>
                  <span class="error-message" *ngIf="isFieldErrorVisible('recordType')">{{ getFieldError('recordType') }}</span>
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
            <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
              <button class="btn-modal btn-submit" (click)="saveData()">{{ modalMode === 'ADD' ? 'Add' : 'Update' }}</button>

              <button class="btn-modal btn-save" (click)="resetForm()">Reset</button>
              <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
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
  styleUrls: ['./entities-to-vertical-assets.component.scss']
})
export class EntitiesToVerticalAssetsComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 1;

  
  editingId: number | null = null;
  editingPid: number | null = null;
  cachedPid: number = 0;
  editingEntitiesVaId: number | null = null;
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
      const fercMatch = !this.filterFercId || String(item.fercId || item.ferc || '').toLowerCase().includes(this.filterFercId.toLowerCase());
      const entityMatch = !this.filterEntityType || String(item.entityType || item.entity || '').toLowerCase().includes(this.filterEntityType.toLowerCase());
      const codeMatch = !this.filterVerticalCode || String(item.verticalCode || item.code || '').toLowerCase().includes(this.filterVerticalCode.toLowerCase());
      const startMatch = !this.filterStartDate || String(item.relationshipStartDate || item.startDate || '').toLowerCase().includes(this.filterStartDate.toLowerCase());
      const endMatch = !this.filterEndDate || String(item.relationshipEndDate || item.endDate || '').toLowerCase().includes(this.filterEndDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType || item.record || '').toLowerCase().includes(this.filterRecordType.toLowerCase());
      
      return globalMatch && fercMatch && entityMatch && codeMatch && startMatch && endMatch && recordMatch;
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
  filterEntityType = '';
  filterVerticalCode = '';
  filterStartDate = '';
  filterEndDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;

  balancingAuthorities: any[] = [];

  formData = {
    entityIdType: '',
    entityId: '',
    verticalAssetType: '',
    balancingAuthority: '',
    relationshipStartDate: '',
    relationshipEndDate: '',
    explanatoryNotes: '',
    recordTypeCd: 'New'
  };

  formErrors: any = {
    recordType: '',
    referenceId: '',
    entityIdType: '',
    entityId: '',
    verticalAssetType: '',
    balancingAuthority: '',
    relationshipStartDate: '',
    relationshipEndDate: '',
    explanatoryNotes: ''
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
        this.loadCompanies();
        this.loadDropdowns();
      }
    });
  }

  loadData() {
    this.companyId = this.getCurrentCid();
    if (this.companyId === 0) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getEtoVAListByCID(this.companyId).subscribe({
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

        const assetIdToName: { [key: number]: string } = {
          1: 'Transmission Asset',
          2: 'Intrastate Pipeline',
          3: 'Gas Storage',
          4: 'Gas Distribution',
          5: 'Other Input'
        };

        this.data = records.map((r: any) => ({
          pid: r.pid ?? r.id ?? '',
          recordId: '',
          entityIdType: r.entity_ID_type_CD ?? r.entityIdType ?? '',
          entityId: r.entity_ID ?? r.entityId ?? '',
          verticalAssetDescription: r.vertical_asset_description ?? r.verticalAssetDescription ?? (r.vertical_asset_type_fk ? assetIdToName[r.vertical_asset_type_fk] : ''),
          balancingAuthority: r.balancing_Authority_cd ?? r.balancing_authority ?? r.balancingAuthority ?? '',
          relationshipStartDate: r.relationship_start_date ?? r.relationshipStartDate ?? '',
          relationshipEndDate: r.relationship_end_date ?? r.relationshipEndDate ?? '',
          explanatoryNotes: r.explanatory_notes ?? r.explanatoryNotes ?? '',
          activeDate: r.active_date ?? r.activeDate ?? '',
          inactiveDate: r.inactive_date ?? r.inactiveDate ?? '',
          recordTypeCd: r.record_type_cd ?? r.recordTypeCd ?? 'New',
          raw: r,
          selected: !!r.IncInFiling || false
        }));

        if (this.data.length > 0) {
          
          const pids = this.data.map(d => Number(d.pid)).filter(p => !isNaN(p));
          const maxPid = pids.length > 0 ? Math.max(...pids) : 0;
          this.cachedPid = maxPid + 1;
        } else {
          this.cachedPid = 1;
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading entities to vertical assets:', err);
        this.errorMessage = 'Failed to load entities to vertical assets. Please try again.';
        this.isLoading = false;
      }
    });
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

  getCurrentCid(): number {
    let cid = 0;
    this.companyContextService.currentCompany$.subscribe(c => {
      if (c) cid = c.cid || c.company_id || 0;
    });
    if (cid === 0) {
      try {
        const stored = localStorage.getItem('companyContext');
        if (stored) {
          const c = JSON.parse(stored);
          cid = c.cid || c.company_id || 0;
        }
      } catch (e) {}
    }
    return cid;
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
    if (mode === 'ADD') {
      this.resetForm();
    }
    this.modalMode = mode;
  }
  closeModal() { this.modalMode = null; this.resetForm(); }

  resetForm() { 
    this.formData = { 
      entityIdType: '',
      entityId: '',
      verticalAssetType: '',
      balancingAuthority: '',
      relationshipStartDate: '',
      relationshipEndDate: '',
      explanatoryNotes: '',
      recordTypeCd: 'New'
    }; 
    this.editingPid = 0;
    this.editingEntitiesVaId = null;
  }



  fillDummyData() {
    const assets = ['Transmission Asset', 'Intrastate Pipeline', 'Gas Storage', 'Gas Distribution', 'Other Input'];
    const randomAsset = assets[Math.floor(Math.random() * assets.length)];
    const randomId = 'C' + Math.floor(Math.random() * 9000000 + 1000000);
    const baas = this.balancingAuthorities.length > 0 ? this.balancingAuthorities : [{value: 'PJM'}];
    const randomBaa = baas[Math.floor(Math.random() * baas.length)].value;

    this.formData = {
      entityIdType: 'CID',
      entityId: randomId,
      verticalAssetType: randomAsset,
      balancingAuthority: randomBaa,
      relationshipStartDate: new Date().toISOString().split('T')[0],
      relationshipEndDate: '',
      explanatoryNotes: 'Random test data generated on ' + new Date().toLocaleString(),
      recordTypeCd: 'New'
    };
    this.editingPid = 0;
    this.editingEntitiesVaId = null;
    this.toast.info('Form filled with random test data.');

  }

  saveData() {
    
    const validation = MBREntitiesToVerticalAssetsValidator.validateRecord(this.formData);
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
    const cid = this.getCurrentCid();
    if (!cid) {
      this.toast.error('Company context missing.');
      this.isLoading = false;
      return;
    }

    const targetPid = isEditMode ? (this.editingPid || 0) : 0;
    
    
    const assetTypeMap: { [key: string]: number } = {
      'Transmission Asset': 1,
      'Intrastate Pipeline': 2,
      'Gas Storage': 3,
      'Gas Distribution': 4,
      'Other Input': 5
    };
    const assetTypeFk = assetTypeMap[this.formData.verticalAssetType] || 1;

    const payload: any = {
      record_type_fk: null,
      pid: targetPid,
      cid: cid,
      vertical_assets_id: null,
      entities_to_vertical_assets_id: isEditMode ? this.editingEntitiesVaId : null,
      reporting_entity_cid_cd: this.formData.entityId || null,
      mbr_submission_fk: 0,
      active_date: this.formData.relationshipStartDate || null,
      inactive_date: this.formData.relationshipStartDate || null,
      updated_record_id: null,
      record_type_cd: isEditMode ? (this.formData.recordTypeCd || 'Update') : 'New',
      reference_id: null,
      entity_ID_type_CD: this.formData.entityIdType || null,
      entity_ID: this.formData.entityId || null,
      vertical_asset_type_fk: assetTypeFk,
      balancing_Authority_cd: this.formData.balancingAuthority || null,
      relationship_start_date: this.formData.relationshipStartDate || null,
      relationship_end_date: this.formData.relationshipEndDate || null,
      explanatory_notes: this.formData.explanatoryNotes || null,
      uid: Number(uid) || parseInt(String(uid), 10) || 1,
      isActive: true
    };

    this.apiService.insUpdEtoVAUIWithResponse(payload).subscribe({
      next: (res: any) => {
        console.log('Saved entities to vertical assets:', res);
        if ([200, 201, 204].includes(res.status)) {
          this.toast.success(this.modalMode === 'ADD' ? 'Relationship added.' : 'Relationship updated.');
          this.closeModal();
          this.loadData();
        } else {
          this.toast.warning('Record saved but server returned status: ' + res.status);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error saving entities to vertical assets:', err);
        this.toast.error('Failed to save. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onCopy(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any, d1: any) => {
      if (d1 && typeof d1 === 'string') return d1.split('T')[0];
      if (d && typeof d === 'string' && d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[Part0].padStart(2, '0')}-${parts[Part1].padStart(2, '0')}`;
        }
      }
      if (d && typeof d === 'string' && d.includes('-')) return d.split('T')[0];
      return d ?? '';
    };

    const Part0 = 0; const Part1 = 1; 

    this.formData = {
      entityIdType: r.entity_ID_type_CD ?? r.entityIdType ?? item.entityIdType ?? '',
      entityId: r.entity_ID ?? r.entityId ?? item.entityId ?? '',
      verticalAssetType: r.vertical_asset_description ?? r.verticalAssetType ?? item.verticalAssetDescription ?? '',
      balancingAuthority: r.balancing_Authority_cd ?? r.balancing_authority ?? item.balancingAuthority ?? '',
      relationshipStartDate: parseDateForInput(r.relationship_start_date, r.relationship_start_date1),
      relationshipEndDate: parseDateForInput(r.relationship_end_date, r.relationship_end_date1),
      explanatoryNotes: r.explanatory_notes ?? r.explanatoryNotes ?? '',
      recordTypeCd: 'New'
    };
    this.editingPid = 0;
    this.editingEntitiesVaId = null;
    this.modalMode = 'ADD';

  }

  onEdit(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any, d1: any) => {
      if (d1 && typeof d1 === 'string') return d1.split('T')[0];
      if (d && typeof d === 'string' && d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      if (d && typeof d === 'string' && d.includes('-')) return d.split('T')[0];
      return d ?? '';
    };

    this.formData = {
      entityIdType: r.entity_ID_type_CD ?? r.entityIdType ?? item.entityIdType ?? '',
      entityId: r.entity_ID ?? r.entityId ?? item.entityId ?? '',
      verticalAssetType: r.vertical_asset_description ?? r.verticalAssetType ?? item.verticalAssetDescription ?? '',
      balancingAuthority: r.balancing_Authority_cd ?? r.balancing_authority ?? item.balancingAuthority ?? '',
      relationshipStartDate: parseDateForInput(r.relationship_start_date, r.relationship_start_date1),
      relationshipEndDate: parseDateForInput(r.relationship_end_date, r.relationship_end_date1),
      explanatoryNotes: r.explanatory_notes ?? r.explanatoryNotes ?? '',
      recordTypeCd: r.record_type_cd ?? r.recordTypeCd ?? 'New'
    };
    this.editingPid = r.pid ?? 0;
    this.editingEntitiesVaId = r.entities_to_vertical_assets_id ?? r.recordId ?? null;
    this.modalMode = 'EDIT';

  }

  private formatDateForApi(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  async onDelete(item: any) { 
    if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { 
      const r = item.raw ?? item;
      const pid = r.pid ?? 0;
      const gid = r.entities_to_vertical_assets_id ?? r.recordId ?? 0;
      this.apiService.deleteEtoVAByID(pid, gid).subscribe({
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
  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.data.forEach(x => x.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'entities_to_vertical_assets', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'entities_to_vertical_assets', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
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
