import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CompanyContextService } from '../../../../core/services/company-context.service';
import { EiaLookupService, EiaLookupItem } from '../../../../core/services/eia-lookup.service';
import { TopCardsRowComponent } from '../../../../shared/components/top-cards-row/top-cards-row.component';
import { FilingFlagsModalComponent } from '../../../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { BalancingAuthorityDropdownComponent } from '../../../../shared/components/balancing-authority-dropdown/balancing-authority-dropdown.component';
import { SanitizeInputDirective } from '../../../../shared/directives/sanitize-input.directive';
import { DatePickerOnlyDirective } from '../../../../shared/directives/date-picker-only.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { MBREntitiesToPPAsValidator } from '../../../../core/validators/mbr-entities-to-ppas.validator';

@Component({
  selector: 'app-entities-to-ppas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Entities to PPAs"
        pageSubtitle="Relationships between entities and PPAs"
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
            <div class="show-all-wrapper" style="display: flex; align-items: center; margin-right: 15px;">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="showAllRecords">
                <span class="checkmark"></span>
                <span class="label-text" style="font-size: 13px; font-weight: 600; color: #4A5568;">Show All Records</span>
              </label>
            </div>
            <button class="btn btn-blue-copy" (click)="confirmCopyData()">Copy Data (All Screens)</button>
            <button class="btn btn-salmon-import" (click)="confirmImportFERC()">Import/Update Data from FERC</button>
            <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Entities to PPAs</button>
            <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- Global Search Box -->
        <div class="search-container">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Global Search..." [(ngModel)]="globalSearch" (keyup)="currentPage = 1">
          </div>
        </div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="8"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th class="col-check"><label class="checkbox-container"><input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)"><span class="checkmark"></span><span class="label-text">All</span></label></th>
              <th>SL No</th>
              <th>FERC Id</th>
              <th>
                <div class="header-cell-filter">
                  EIA Code (or)<br>Asset Code
                  <button class="filter-btn" (click)="toggleFilter('eiaCode', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'eiaCode'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter EIA Code..." [(ngModel)]="filterEiaCode" autofocus>
                    <button class="clear-filter-btn" (click)="filterEiaCode = ''; activeFilter = null; currentPage = 1" *ngIf="filterEiaCode">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-cell-filter">
                  Entity
                  <button class="filter-btn" (click)="toggleFilter('entity', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'entity'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Entity..." [(ngModel)]="filterEntity" autofocus>
                    <button class="clear-filter-btn" (click)="filterEntity = ''; activeFilter = null; currentPage = 1" *ngIf="filterEntity">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-cell-filter">
                  Counterparty
                  <button class="filter-btn" (click)="toggleFilter('counterparty', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'counterparty'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Counterparty..." [(ngModel)]="filterCounterparty" autofocus>
                    <button class="clear-filter-btn" (click)="filterCounterparty = ''; activeFilter = null; currentPage = 1" *ngIf="filterCounterparty">Clear</button>
                  </div>
                </div>
              </th>
              <th>Start Date</th>
              <th>Scheduled End Date</th>
              <th>
                <div class="header-cell-filter">
                  Source BAA
                  <button class="filter-btn" (click)="toggleFilter('sourceBaa', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'sourceBaa'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Source BAA..." [(ngModel)]="filterSourceBaa" autofocus>
                    <button class="clear-filter-btn" (click)="filterSourceBaa = ''; activeFilter = null; currentPage = 1" *ngIf="filterSourceBaa">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-cell-filter">
                  PPA Agreement ID
                  <button class="filter-btn" (click)="toggleFilter('ppaAgreementId', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'ppaAgreementId'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter PPA ID..." [(ngModel)]="filterPpaAgreementId" autofocus>
                    <button class="clear-filter-btn" (click)="filterPpaAgreementId = ''; activeFilter = null; currentPage = 1" *ngIf="filterPpaAgreementId">Clear</button>
                  </div>
                </div>
              </th>
              <th>Amount</th>
              <th>
                <div class="header-cell-filter">
                  Record Type
                  <button class="filter-btn" (click)="toggleFilter('recordType', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'recordType'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Type..." [(ngModel)]="filterRecordType" autofocus>
                    <button class="clear-filter-btn" (click)="filterRecordType = ''; activeFilter = null; currentPage = 1" *ngIf="filterRecordType">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of displayData; let i = index" [class.is-deleted-record]="item.isDeleted" [class.is-deactivated-record]="item.recordType === 'Deactivate'">
              <td class="col-check"><label class="checkbox-container"><input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)"><span class="checkmark"></span></label></td>
              <td>{{ i + 1 }}</td>
              <td>{{ item.fercId }}</td>
              <td>{{ item.assetCode }}</td>
              <td>{{ item.entity }}</td>
              <td>{{ item.counterparty }}</td>
              <td>{{ item.startDate }}</td>
              <td>{{ item.scheduledEndDate }}</td>
              <td>{{ item.sourceBaa }}</td>
              <td>{{ item.ppaAgreementId }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.recordType }}</td>
              <td class="col-actions"><div class="action-cell"><button class="action-btn copy" (click)="onCopy(item)" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg></button><button class="action-btn edit" (click)="onEdit(item)" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" (click)="onDelete(item)" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button></div></td>
            </tr>
            <tr *ngIf="data.length === 0 && !isLoading">
              <td colspan="13" style="text-align: center; padding: 40px 16px; color: #718096; font-size: 14px;">No records found.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination-container" *ngIf="totalRecords > 0">
          <div class="pagination-info">
            <span>Page {{ currentPage }} of {{ totalPages }} | Total Records: {{ totalRecords }}</span>
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" (click)="previousPage()" [disabled]="currentPage === 1">← Previous</button>
            <div class="page-numbers">
              <button *ngFor="let page of getPageNumbers()" 
                      class="page-btn" 
                      [class.active]="page === currentPage"
                      (click)="goToPage(page)">{{ page }}</button>
            </div>
            <button class="pagination-btn" (click)="nextPage()" [disabled]="currentPage === totalPages">Next →</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="modalMode" (click)="closeModal()">
        <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD' || modalMode === 'EDIT'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">{{ modalMode === 'ADD' ? 'MBRDB >> Add PPA' : 'MBRDB >> Edit PPA' }}</span>
                <h2 class="main-title">{{ modalTitle }}</h2>
              </div>
            <button class="close-btn" (click)="closeModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

            <div class="modal-body">
              <ng-container *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">
                <div class="add-form">
                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('entityIdTypeCd')">
                      <label>Entity Type:<span class="req">*</span></label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.entityIdTypeCd">
                          <option value="">--Select--</option>
                          <option value="CID">Company Identifier (Format: C123456)</option>
                          <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                          <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                        </select>
                      </div>
                      <span class="error-message" *ngIf="isFieldErrorVisible('entityIdTypeCd')">{{ getFieldError('entityIdTypeCd') }}</span>
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('entityId')">
                      <label>Entity ID#:<span class="req">*</span></label>
                      <input type="text" class="form-input" [(ngModel)]="formData.entityId" maxlength="20" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('entityId')">{{ getFieldError('entityId') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Last Changed Date:</label>
                      <input type="date" class="form-input" [(ngModel)]="formData.lastChangedDate">
                    </div>

                    <div class="form-field">
                      <label>PPA Agreement ID#:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.ppaAgreementId" maxlength="30" placeholder="">
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('counterpartyIdTypeCd')">
                      <label>Counter Party Type:<span class="req">*</span></label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.counterpartyIdTypeCd">
                          <option value="">--Select--</option>
                          <option value="CID">Company Identifier (Format: C123456)</option>
                          <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                          <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                        </select>
                      </div>
                      <span class="error-message" *ngIf="isFieldErrorVisible('counterpartyIdTypeCd')">{{ getFieldError('counterpartyIdTypeCd') }}</span>
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('counterpartyId')">
                      <label>Counter Party ID#:<span class="req">*</span></label>
                      <input type="text" class="form-input" [(ngModel)]="formData.counterpartyId" maxlength="20" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('counterpartyId')">{{ getFieldError('counterpartyId') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('ppaTypeFk')">
                      <label>PPA Type:<span class="req">*</span></label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.ppaTypeFk">
                          <option value="">--Select--</option>
                          <option value="1">Purchase</option>
                          <option value="2">Sale</option>
                        </select>
                      </div>
                      <span class="error-message" *ngIf="isFieldErrorVisible('ppaTypeFk')">{{ getFieldError('ppaTypeFk') }}</span>
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('supplyTypeFk')">
                      <label>Supply Type:<span class="req">*</span></label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.supplyTypeFk">
                          <option value="">--Select--</option>
                          <option value="1">Generator Specific</option>
                          <option value="2">Slice of System</option>
                          <option value="3">Portfolio</option>
                          <option value="4">Other</option>
                        </select>
                      </div>
                      <span class="error-message" *ngIf="isFieldErrorVisible('supplyTypeFk')">{{ getFieldError('supplyTypeFk') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Gen Asset Type:</label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.genAssetType">
                          <option value="">--Select--</option>
                          <option value="2">Asset ID</option>
                          <option value="1">EIA</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>EIA Lookup List:</label>
                      <span class="form-notes">(Note: Enter few letters to search the EIA list. Ex: northeast etc..)</span>
                      <div class="eia-combo">
                        <input type="text" class="form-input" 
                          [(ngModel)]="eiaSearchText" 
                          (input)="onEiaSearchInput()"
                          (focus)="onEiaFocus()"
                          (blur)="onEiaBlur()"
                          (keydown)="onEiaKeydown($event)"
                          placeholder="Type to search EIA..." 
                          autocomplete="off"
                          #eiaInput>
                        <span class="combo-arrow" (mousedown)="$event.preventDefault(); clearEiaBlurTimer()" (click)="onEiaDropdownToggle()">&#9660;</span>
                      </div>
                      <div class="eia-dropdown" 
                        *ngIf="eiaDropdownOpen && filteredEiaList.length > 0"
                        [ngStyle]="eiaDropdownStyle">
                        <div class="eia-dropdown-item" 
                          *ngFor="let item of filteredEiaList" 
                          (mousedown)="onEiaItemSelect(item)">
                          <div class="eia-item-code">{{ item.plantCode }} $ {{ item.generatorId }} $ {{ item.thirdValue || '' }}</div>
                          <div class="eia-item-name">{{ item.text }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>EIA Plant Code:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.eiaPlantCode" [disabled]="isAssetIdSelected()" maxlength="5" placeholder="">
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('eiaGeneratorId')">
                      <label>EIA Generator ID:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.eiaGeneratorId" [disabled]="isAssetIdSelected()" maxlength="5" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('eiaGeneratorId')">{{ getFieldError('eiaGeneratorId') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('eiaUnitCode')">
                      <label>EIA Unit Code:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.eiaUnitCode" [disabled]="isAssetIdSelected()" maxlength="7" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('eiaUnitCode')">{{ getFieldError('eiaUnitCode') }}</span>
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('fercAssetGeneratorCode')">
                      <label>FERC Asset Generator Code:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.fercAssetGeneratorCode" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('fercAssetGeneratorCode')">{{ getFieldError('fercAssetGeneratorCode') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('ppaStartDate')">
                      <label>PPA Start Date:<span class="req">*</span></label>
                      <input type="date" class="form-input" [(ngModel)]="formData.ppaStartDate">
                      <span class="error-message" *ngIf="isFieldErrorVisible('ppaStartDate')">{{ getFieldError('ppaStartDate') }}</span>
                    </div>

                    <div class="form-field">
                      <label>Scheduled End Date:</label>
                      <input type="date" class="form-input" [(ngModel)]="formData.scheduledEndDate">
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Actual End Date:</label>
                      <input type="date" class="form-input" [(ngModel)]="formData.actualEndDate">
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('amount')">
                      <label>Amount:<span class="req">*</span></label>
                      <input type="text" class="form-input" [(ngModel)]="formData.amount" maxlength="7" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('amount')">{{ getFieldError('amount') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Amount Adjusted:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.amountAdjusted" maxlength="7" placeholder="">
                    </div>

                    <div class="form-field">
                      <label>Adjusted Rating Options:</label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.adjustedRatingOptions">
                          <option value="">--Select--</option>
                          <option value="1">Nameplate</option>
                          <option value="2">Seasonal</option>
                          <option value="3">5-yr Unit</option>
                          <option value="4">5-yr EIA</option>
                          <option value="5">Alternative</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Alt Methodology Used:</label>
                      <input type="text" class="form-input" [(ngModel)]="formData.altMethodologyUsed" maxlength="290" placeholder="">
                      <span class="error-message" *ngIf="isFieldErrorVisible('altMethodologyUsed')">{{ getFieldError('altMethodologyUsed') }}</span>
                    </div>

                    <div class="form-field">
                      <label>Source Balancing Authority:</label>
                      <app-balancing-authority-dropdown 
                        [(ngModel)]="formData.sourceBalancingAuthority"
                        [balancingAuthorities]="balancingAuthorities">
                      </app-balancing-authority-dropdown>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Source Balancing Authority Hub:</label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.sourceBalancingAuthorityHub">
                          <option value="">--Select--</option>
                          <option *ngFor="let hub of hubOptions" [value]="hub.value">{{ hub.text }}</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field" [class.error-field]="isFieldErrorVisible('sinkBalancingAuthority')">
                      <label>Sink Balancing Authority:</label>
                      <app-balancing-authority-dropdown 
                        [(ngModel)]="formData.sinkBalancingAuthority"
                        [balancingAuthorities]="balancingAuthorities">
                      </app-balancing-authority-dropdown>
                      <span class="error-message" *ngIf="isFieldErrorVisible('sinkBalancingAuthority')">{{ getFieldError('sinkBalancingAuthority') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Sink Balancing Authority Hub:</label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.sinkBalancingAuthorityHub">
                          <option value="">--Select--</option>
                          <option *ngFor="let hub of hubOptions" [value]="hub.value">{{ hub.text }}</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-field">
                      <label>Explanatory Notes:</label>
                      <textarea class="form-input" [(ngModel)]="formData.explanatoryNotes" rows="2" style="height:35px;resize:vertical;"></textarea>
                      <span class="error-message" *ngIf="isFieldErrorVisible('explanatoryNotes')">{{ getFieldError('explanatoryNotes') }}</span>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" [class.error-field]="isFieldErrorVisible('recordType')">
                      <label>Record Type:<span class="req">*</span></label>
                      <div class="select-wrapper">
                        <select class="form-input" [(ngModel)]="formData.recordType">
                          <option value="New">New</option>
                          <option value="Update">Update</option>
                          <option value="Deactivate">Deactivate</option>
                        </select>
                      </div>
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
              <!-- Add/Edit Buttons -->
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
  styleUrls: ['./entities-to-ppas.component.scss']
})
export class EntitiesToPpasComponent implements OnInit, OnDestroy {
  data: any[] = [];
  showAllRecords = false;
  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 1;

  
  currentPage = 1;
  pageSize = 50;

  
  globalSearch = '';
  filterRecordType = '';
  filterEntity = '';
  filterCounterparty = '';
  filterPpaAgreementId = '';
  filterEiaCode = '';
  filterSourceBaa = '';
  activeFilter: string | null = null;

  
  editingId: number | null = null;
  editingPid: number | null = null;
  cachedPid: number = 0;
  editingEntitiesPpaId: number | null = null;
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get filteredData() {
    let result = this.data;

    
    if (!this.showAllRecords) {
      result = result.filter(item => !item.isDeleted && item.recordType !== 'Deactivate');
    }

    
    if (this.globalSearch) {
      const searchLower = this.globalSearch.toLowerCase();
      result = result.filter(item =>
        String(item.entity || '').toLowerCase().includes(searchLower) ||
        String(item.counterparty || '').toLowerCase().includes(searchLower) ||
        String(item.ppaAgreementId || '').toLowerCase().includes(searchLower) ||
        String(item.recordType || '').toLowerCase().includes(searchLower) ||
        String(item.startDate || '').toLowerCase().includes(searchLower) ||
        String(item.scheduledEndDate || '').toLowerCase().includes(searchLower) ||
        String(item.sourceBaa || '').toLowerCase().includes(searchLower) ||
        String(item.amount || '').toLowerCase().includes(searchLower)
      );
    }

    
    if (this.filterRecordType) {
      result = result.filter(item =>
        String(item.recordType || '').toLowerCase().includes(this.filterRecordType.toLowerCase())
      );
    }
    if (this.filterEntity) {
      result = result.filter(item =>
        String(item.entity || '').toLowerCase().includes(this.filterEntity.toLowerCase())
      );
    }
    if (this.filterCounterparty) {
      result = result.filter(item =>
        String(item.counterparty || '').toLowerCase().includes(this.filterCounterparty.toLowerCase())
      );
    }
    if (this.filterPpaAgreementId) {
      result = result.filter(item =>
        String(item.ppaAgreementId || '').toLowerCase().includes(this.filterPpaAgreementId.toLowerCase())
      );
    }
    if (this.filterEiaCode) {
      result = result.filter(item =>
        String(item.eiaCode || '').toLowerCase().includes(this.filterEiaCode.toLowerCase())
      );
    }
    if (this.filterSourceBaa) {
      result = result.filter(item =>
        String(item.sourceBaa || '').toLowerCase().includes(this.filterSourceBaa.toLowerCase())
      );
    }

    return result;
  }

  get displayData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get totalRecords(): number {
    return this.filteredData.length;
  }

  toggleFilter(column: string, event: Event) {
    event.stopPropagation();
    if (this.activeFilter === column) {
      this.activeFilter = null;
    } else {
      this.activeFilter = column;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get modalTitle(): string {
    if (this.modalMode === 'COPY_DATA') return 'Copy Data to Selected Company';
    if (this.modalMode === 'ADD') return "Entities to PPA's Add";
    if (this.modalMode === 'EDIT') return "Entities to PPA's Edit";
    return "Entities to PPA's";
  }

  
  balancingAuthorities: any[] = [];

  
  hubOptions: any[] = [
    { value: 'ADHUB', text: 'ADHUB' },
    { value: 'AEPGEN', text: 'AEPGenHub' },
    { value: 'ARKANSAS', text: 'Arkansas Hub' },
    { value: 'CINERGY', text: 'Cinergy (into)' },
    { value: 'COB', text: 'COB' },
    { value: 'ENTERGY', text: 'Entergy (into)' },
    { value: 'FE', text: 'FE Hub' },
    { value: 'FOURCORNERS', text: 'Four Corners' },
    { value: 'ILLINOIS', text: 'Illinois Hub (MISO)' },
    { value: 'INDIANA', text: 'Indiana Hub (MISO)' },
    { value: 'LOUISIANA', text: 'Louisiana Hub' },
    { value: 'MEAD', text: 'Mead' },
    { value: 'MICHIGAN', text: 'Michigan Hub (MISO)' },
    { value: 'MIDC', text: 'Mid-Columbia (Mid-C)' },
    { value: 'MINNESOTA', text: 'Minnesota Hub (MISO)' },
    { value: 'NEPOOL', text: 'NEPOOL (Mass Hub)' },
    { value: 'NIHUB', text: 'NIHUB' },
    { value: 'NOB', text: 'NOB' },
    { value: 'NP15', text: 'NP15' },
    { value: 'NWMT', text: 'NWMT' },
    { value: 'PALOVERDE', text: 'Palo Verde' },
    { value: 'PJMEAST', text: 'PJM East Hub' },
    { value: 'PJMSOUTH', text: 'PJM South Hub' },
    { value: 'PJMWEST', text: 'PJM West Hub' },
    { value: 'SOCO', text: 'SOCO (into)' },
    { value: 'SP15', text: 'SP15' },
    { value: 'TEXAS', text: 'Texas Hub' },
    { value: 'TVA', text: 'TVA (into)' },
    { value: 'ZP26', text: 'ZP26' }
  ];

  
  eiaSearchText = '';
  filteredEiaList: EiaLookupItem[] = [];
  eiaDropdownOpen = false;
  eiaDropdownStyle: { [key: string]: string } = {};
  private eiaBlurTimer: any = null;
  private selectedPlantCode = '';
  @ViewChild('eiaInput') eiaInputRef!: ElementRef<HTMLInputElement>;

  formData: any = { 
    entityIdTypeCd: '',
    entityId: '',
    lastChangedDate: '',
    ppaAgreementId: '',
    counterpartyIdTypeCd: '',
    counterpartyId: '',
    ppaTypeFk: '',
    supplyTypeFk: '',
    genAssetType: '',
    eiaPlantCode: '',
    eiaGeneratorId: '',
    eiaUnitCode: '',
    fercAssetGeneratorCode: '',
    ppaStartDate: '',
    scheduledEndDate: '',
    actualEndDate: '',
    amount: '',
    amountAdjusted: '',
    adjustedRatingOptions: '',
    altMethodologyUsed: '',
    sourceBalancingAuthority: '',
    sourceBalancingAuthorityHub: '',
    sinkBalancingAuthority: '',
    sinkBalancingAuthorityHub: '',
    explanatoryNotes: '',
    recordType: 'New',
    referenceId: ''
  };

  formErrors: any = {
    recordType: '',
    referenceId: '',
    entityIdType: '',
    entityId: '',
    dateOfLastChange: '',
    ppaAgreementId: '',
    counterpartyIdType: '',
    counterpartyId: '',
    ppaType: '',
    supplyType: '',
    genAssetType: '',
    eiaPlantCode: '',
    eiaGeneratorId: '',
    eiaUnitCode: '',
    fercAssetGeneratorCode: '',
    ppaStartDate: '',
    scheduledEndDate: '',
    actualEndDate: '',
    amount: '',
    amountAdjusted: '',
    adjustedRatingOptions: '',
    altMethodologyUsed: '',
    sourceBalancingAuthority: '',
    sourceBalancingAuthorityHub: '',
    sinkBalancingAuthority: '',
    sinkBalancingAuthorityHub: '',
    explanatoryNotes: ''
  };

  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private eiaLookupService: EiaLookupService, private elRef: ElementRef, private toast: ToastService, private alertService: AlertService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.eiaDropdownOpen) {
      const comboEl = this.elRef.nativeElement.querySelector('.eia-combo');
      const dropEl = this.elRef.nativeElement.querySelector('.eia-dropdown');
      const clickedInCombo = comboEl && comboEl.contains(event.target as Node);
      const clickedInDrop = dropEl && dropEl.contains(event.target as Node);
      if (!clickedInCombo && !clickedInDrop) {
        this.eiaDropdownOpen = false;
      }
    }
  }

  
  private updateEiaDropdownPosition(): void {
    if (!this.eiaInputRef) return;
    const rect = this.eiaInputRef.nativeElement.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom - 10;
    const maxH = Math.min(spaceBelow, 400);
    this.eiaDropdownStyle = {
      position: 'fixed',
      top: rect.bottom + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      'max-height': maxH + 'px',
      'z-index': '10000'
    };
  }

  ngOnDestroy(): void { }

  ngOnInit(): void {
    
    this.eiaLookupService.loadAll().subscribe();
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

  loadDropdowns() {
    console.log('[loadDropdowns] Starting dropdown load for Entities to PPAs...');
    
    
    this.apiService.getDropDownList('lookbaa', 'ID', 'baa_desc').subscribe({
      next: (res) => { 
        this.balancingAuthorities = (res && Array.isArray(res)) ? res : []; 
        console.log('[loadDropdowns] BA list loaded:', this.balancingAuthorities.length);
      },
      error: (err) => { console.error('Error loading BA list:', err); }
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = 1; 
    
    this.apiService.getEtoPPAsListByCID(this.companyId, this.showAllRecords).subscribe({
      next: (response: any) => {
        console.log('[PPAs loadData] Raw API response:', response);
        console.log('[PPAs loadData] typeof:', typeof response, 'isArray:', Array.isArray(response));
        if (response && !Array.isArray(response)) {
          console.log('[PPAs loadData] Response keys:', Object.keys(response));
        }
        
        let records: any[] = [];
        if (Array.isArray(response)) {
          records = response;
        } else if (response && typeof response === 'object') {
          
          const possibleKeys = ['rows', 'data', 'result', 'Result', 'value', '$values', 'items', 'records', 'list'];
          for (const key of possibleKeys) {
            if (Array.isArray(response[key])) {
              records = response[key];
              console.log(`[PPAs loadData] Found array under key "${key}", length:`, records.length);
              break;
            }
          }
          
          if (records.length === 0) {
            for (const key of Object.keys(response)) {
              if (Array.isArray(response[key])) {
                records = response[key];
                console.log(`[PPAs loadData] Fallback: found array under key "${key}", length:`, records.length);
                break;
              }
            }
          }
        }
        
        console.log('[PPAs loadData] Parsed records count:', records.length);
        if (records.length > 0) {
          console.log('[PPAs loadData] First record keys:', Object.keys(records[0]));
          console.log('[PPAs loadData] First record:', records[0]);
        }
        
        this.data = records.map((r: any) => ({
          fercId: '',
          assetCode: r.asset_code ?? (r.eia_plant_code ? `${r.eia_plant_code}` : r.ferc_asset_Gen_code ?? ''),
          entity: r.entity ?? (r.entity_ID ? `${r.entity_ID_type_CD ?? ''} (${r.entity_ID})` : ''),
          counterparty: r.counterparty ?? (r.counterparty_ID ? `${r.counterparty_ID_type_CD ?? ''} (${r.counterparty_ID})` : ''),
          startDate: r.start_date ?? '',
          scheduledEndDate: r.scheduled_end_date ?? '',
          sourceBaa: r.source_balancing_authority ?? r.source_balancing_authority_cd ?? '',
          ppaAgreementId: r.ppa_agreement_id ?? '',
          amount: r.amount ?? '',
          recordType: r.record_type_cd ?? '',
          isDeleted: !!r.IsDeleteAtFERC,
          raw: r,
          selected: !!r.IncInFiling || false
        }));

        if (this.data.length > 0) {
          const pids = this.data.map(d => Number(d.raw?.pid || d.raw?.Pid || d.raw?.PID || 0)).filter(p => !isNaN(p));
          const maxPid = pids.length > 0 ? Math.max(...pids) : 0;
          this.cachedPid = maxPid + 1;
        } else {
          this.cachedPid = 1;
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading entities to PPAs:', err);
        this.errorMessage = 'Failed to load entities to PPAs. Please try again.';
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

  openModal(mode: string) { 
    if (mode === 'ADD') {
      this.resetForm();
      this.editingPid = null;
      this.editingEntitiesPpaId = null;
    }
    this.modalMode = mode; 
  }

  closeModal() { this.modalMode = null; this.resetForm(); }

  resetForm() { 
    this.formData = { 
      entityIdTypeCd: '',
      entityId: '',
      lastChangedDate: '',
      ppaAgreementId: '',
      counterpartyIdTypeCd: '',
      counterpartyId: '',
      ppaTypeFk: '',
      supplyTypeFk: '',
      genAssetType: '',
      eiaPlantCode: '',
      eiaGeneratorId: '',
      eiaUnitCode: '',
      fercAssetGeneratorCode: '',
      ppaStartDate: '',
      scheduledEndDate: '',
      actualEndDate: '',
      amount: '',
      amountAdjusted: '',
      adjustedRatingOptions: '',
      altMethodologyUsed: '',
      sourceBalancingAuthority: '',
      sourceBalancingAuthorityHub: '',
      sinkBalancingAuthority: '',
      sinkBalancingAuthorityHub: '',
      explanatoryNotes: '',
      recordType: 'New',
      referenceId: ''
    };
    this.formErrors = {
      recordType: '',
      referenceId: '',
      entityIdType: '',
      entityId: '',
      dateOfLastChange: '',
      ppaAgreementId: '',
      counterpartyIdType: '',
      counterpartyId: '',
      ppaType: '',
      supplyType: '',
      genAssetType: '',
      eiaPlantCode: '',
      ppaStartDate: '',
      scheduledEndDate: '',
      actualEndDate: '',
      amount: '',
      amountAdjusted: '',
      adjustedRatingOptions: ''
    };
    this.eiaSearchText = '';
    this.filteredEiaList = [];
    this.eiaDropdownOpen = false;
    this.selectedPlantCode = '';
    this.editingPid = null;
    this.editingEntitiesPpaId = null;
  }



  private getUidFromStorage(): number {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.uid || user.id || user.Uid || user.UID || 1;
      }
    } catch (e) { }
    return 1;
  }

  private getCurrentCid(): number {
    if (this.companyId && this.companyId !== 0) return this.companyId;
    
    
    const company = this.companyContextService.getCompany();
    if (company && (company.cid || company.company_id)) {
      return company.cid || company.company_id || 0;
    }

    
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.cid || user.Cid || user.companyId || 0;
      }
    } catch (e) { }
    
    return 0;
  }

  saveData() {
    
    const validation = MBREntitiesToPPAsValidator.validateRecord(this.formData);
    this.formErrors = validation.errors;

    if (!validation.valid) {
      
      for (const [field, error] of Object.entries(this.formErrors)) {
        if (error) {
          this.toast.error(`${field}: ${error}`);
          return;
        }
      }
    }
    
    const cid = this.getCurrentCid();
    if (!cid) {
      this.toast.error('Company context missing. Please select a company.');
      return;
    }

    this.isLoading = true;

    
    const targetPid = this.modalMode === 'EDIT' ? (this.editingPid || 0) : 0;
    const payload: any = {
      record_type_fk: (this.formData.recordType === 'New') ? 1 : 2,
      pid: targetPid,
      cid: cid,
      entities_ppa_id: this.editingEntitiesPpaId || null,
      reporting_entity_cid_cd: this.formData.entityId || "",
      mbr_submission_fk: targetPid,
      active_date: null,
      inactive_date: null,
      updated_record_id: null,
      eiA_fk: null,
      record_type_cd: this.formData.recordType || "New",
      reference_id: this.formData.recordType === 'Update' ? parseInt(this.formData.referenceId, 10) : null,
      entity_ID_type_CD: this.formData.entityIdTypeCd || "",
      entity_ID: this.formData.entityId || "",
      date_of_last_change: MBREntitiesToPPAsValidator.toIsoDateTime(this.formData.lastChangedDate),
      ppa_agreement_id: this.formData.ppaAgreementId || "",
      counterparty_ID_type_CD: this.formData.counterpartyIdTypeCd || "",
      counterparty_ID: this.formData.counterpartyId || "",
      ppa_type_fk: this.formData.ppaTypeFk ? Number(this.formData.ppaTypeFk) : null,
      supply_type_fk: this.formData.supplyTypeFk ? Number(this.formData.supplyTypeFk) : null,
      generation_asset_type_id: this.formData.genAssetType ? Number(this.formData.genAssetType) : null,
      generation_asset_type_fk: this.formData.genAssetType ? Number(this.formData.genAssetType) : null,
      eia_plant_code: this.formData.eiaPlantCode || "",
      eia_generator_id: this.formData.eiaGeneratorId || "",
      eia_unit_code: this.formData.eiaUnitCode || "",
      ferc_asset_Gen_code: this.formData.fercAssetGeneratorCode || "",
      start_date: MBREntitiesToPPAsValidator.toIsoDateTime(this.formData.ppaStartDate),
      scheduled_end_date: MBREntitiesToPPAsValidator.toIsoDateTime(this.formData.scheduledEndDate),
      actual_end_date: MBREntitiesToPPAsValidator.toIsoDateTime(this.formData.actualEndDate),
      amount: this.formData.amount ? this.formData.amount.toString() : "0",
      amount_adjusted: this.formData.amountAdjusted ? this.formData.amountAdjusted.toString() : "0",
      adj_rating_options_fk: this.formData.adjustedRatingOptions ? Number(this.formData.adjustedRatingOptions) : null,
      alt_methodology_used: this.formData.altMethodologyUsed || "",
      source_balancing_authority_cd: this.formData.sourceBalancingAuthority || "",
      source_balancing_authority_hub_cd: this.formData.sourceBalancingAuthorityHub || "",
      sink_balancing_authority_cd: this.formData.sinkBalancingAuthority || "",
      sink_balancing_authority_hub_cd: this.formData.sinkBalancingAuthorityHub || "",
      explanatory_notes: this.formData.explanatoryNotes || "",
      uid: this.getUidFromStorage().toString(), 
      isActive: true,
      IsActive: true
    };

    console.log('[saveData] Submitting payload:', payload);

    this.apiService.insUpdEtoPPAsUIWithResponse(payload).subscribe({
      next: (res: any) => {
        console.log('[PPAs Save] Response object:', res);
        console.log('[PPAs Save] Response status:', res.status);
        console.log('[PPAs Save] Response body:', res.body);
        
        if ([200, 201, 204].includes(res.status)) {
          this.toast.success(this.modalMode === 'ADD' ? 'Relationship added successfully.' : 'Relationship updated successfully.');
          this.closeModal();
          console.log('[PPAs Save] Loading fresh data...');
          this.loadData();
        } else {
          console.warn('[PPAs Save] Unexpected status:', res.status);
          this.toast.warning('Record saved but server returned status: ' + res.status);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('[PPAs Save] Error:', err);
        this.toast.error('Failed to save. Please try again.');
        this.isLoading = false;
      }
    });
  }

  onEdit(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any, dISO: any) => {
      if (dISO && typeof dISO === 'string') return dISO.split('T')[0];
      if (d && typeof d === 'string' && d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      return d ?? '';
    };

    this.formData = {
      entityIdTypeCd: r.entity_ID_type_CD ?? '',
      entityId: r.entity_ID ?? '',
      lastChangedDate: parseDateForInput(r.date_of_last_change, r.date_of_last_change1),
      ppaAgreementId: r.ppa_agreement_id ?? '',
      counterpartyIdTypeCd: r.counterparty_ID_type_CD ?? '',
      counterpartyId: r.counterparty_ID ?? '',
      ppaTypeFk: r.ppa_type_fk != null ? String(r.ppa_type_fk) : '',
      supplyTypeFk: r.supply_type_fk != null ? String(r.supply_type_fk) : '',
      genAssetType: r.generation_asset_type_fk != null ? String(r.generation_asset_type_fk) : '',
      eiaPlantCode: r.eia_plant_code ?? '',
      eiaGeneratorId: r.eia_generator_id ?? '',
      eiaUnitCode: r.eia_unit_code ?? '',
      fercAssetGeneratorCode: r.ferc_asset_Gen_code ?? '',
      ppaStartDate: parseDateForInput(r.start_date, r.start_date1),
      scheduledEndDate: parseDateForInput(r.scheduled_end_date, r.scheduled_end_date1),
      actualEndDate: parseDateForInput(r.actual_end_date, r.actual_end_date1),
      amount: r.amount != null ? String(r.amount) : '',
      amountAdjusted: r.amount_adjusted != null ? String(r.amount_adjusted) : '',
      adjustedRatingOptions: r.adj_rating_options_fk != null ? String(r.adj_rating_options_fk) : '',
      altMethodologyUsed: r.alt_methodology_used ?? '',
      sourceBalancingAuthority: r.source_balancing_authority_cd ?? '',
      sourceBalancingAuthorityHub: r.source_balancing_authority_hub_cd ?? '',
      sinkBalancingAuthority: r.sink_balancing_authority_cd ?? '',
      sinkBalancingAuthorityHub: r.sink_balancing_authority_hub_cd ?? '',
      explanatoryNotes: r.explanatory_notes ?? '',
      recordType: r.record_type_cd ?? 'New',
      referenceId: r.reference_id ? String(r.reference_id) : ''
    };
    
    if (this.formData.eiaPlantCode) {
      this.eiaSearchText = this.formData.eiaUnitCode
        ? `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $ ${this.formData.eiaUnitCode}`
        : `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $`;
      this.selectedPlantCode = this.formData.eiaPlantCode;
    } else {
      this.eiaSearchText = '';
      this.selectedPlantCode = '';
    }
    this.editingPid = r.pid ?? 0;
    this.editingEntitiesPpaId = r.entities_ppa_id ?? null;
    this.modalMode = 'EDIT';
  }

  onCopy(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any, dISO: any) => {
      if (dISO && typeof dISO === 'string') return dISO.split('T')[0];
      if (d && typeof d === 'string' && d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      return d ?? '';
    };

    this.formData = {
      entityIdTypeCd: r.entity_ID_type_CD ?? '',
      entityId: r.entity_ID ?? '',
      lastChangedDate: '',
      ppaAgreementId: r.ppa_agreement_id ?? '',
      counterpartyIdTypeCd: r.counterparty_ID_type_CD ?? '',
      counterpartyId: r.counterparty_ID ?? '',
      ppaTypeFk: r.ppa_type_fk != null ? String(r.ppa_type_fk) : '',
      supplyTypeFk: r.supply_type_fk != null ? String(r.supply_type_fk) : '',
      genAssetType: r.generation_asset_type_fk != null ? String(r.generation_asset_type_fk) : '',
      eiaPlantCode: r.eia_plant_code ?? '',
      eiaGeneratorId: r.eia_generator_id ?? '',
      eiaUnitCode: r.eia_unit_code ?? '',
      fercAssetGeneratorCode: r.ferc_asset_Gen_code ?? '',
      ppaStartDate: parseDateForInput(r.start_date, r.start_date1),
      scheduledEndDate: parseDateForInput(r.scheduled_end_date, r.scheduled_end_date1),
      actualEndDate: parseDateForInput(r.actual_end_date, r.actual_end_date1),
      amount: r.amount != null ? String(r.amount) : '',
      amountAdjusted: '',
      adjustedRatingOptions: r.adj_rating_options_fk != null ? String(r.adj_rating_options_fk) : '',
      altMethodologyUsed: r.alt_methodology_used ?? '',
      sourceBalancingAuthority: r.source_balancing_authority_cd ?? '',
      sourceBalancingAuthorityHub: r.source_balancing_authority_hub_cd ?? '',
      sinkBalancingAuthority: r.sink_balancing_authority_cd ?? '',
      sinkBalancingAuthorityHub: r.sink_balancing_authority_hub_cd ?? '',
      explanatoryNotes: r.explanatory_notes ?? '',
      recordType: 'New',
      referenceId: ''
    };
    
    if (this.formData.eiaPlantCode) {
      this.eiaSearchText = this.formData.eiaUnitCode
        ? `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $ ${this.formData.eiaUnitCode}`
        : `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $`;
      this.selectedPlantCode = this.formData.eiaPlantCode;
    } else {
      this.eiaSearchText = '';
      this.selectedPlantCode = '';
    }
    this.editingPid = null;
    this.editingEntitiesPpaId = null;
    this.modalMode = 'ADD';
  }

  async onDelete(item: any) {
    if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { 
      const r = item.raw ?? item; 
      this.apiService.deleteEtoPPAsByID(r.pid ?? 0, r.entities_ppa_id ?? 0).subscribe({
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
      table: 'entities_to_ppas', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'entities_to_ppas', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  get isAllSelected(): boolean { return this.data.length > 0 && this.data.every(x => x.selected); }

  
  isAssetIdSelected(): boolean {
    return this.formData.genAssetType === '2';
  }

  

  onEiaFocus(): void {
    if (this.eiaBlurTimer) { clearTimeout(this.eiaBlurTimer); this.eiaBlurTimer = null; }
    this.eiaLookupService.loadAll().subscribe(items => {
      if (this.selectedPlantCode) {
        this.filteredEiaList = this.eiaLookupService.searchByPlantCode(this.selectedPlantCode, 100);
      } else if (this.eiaSearchText) {
        this.filteredEiaList = this.eiaLookupService.search(this.eiaSearchText, 100);
        if (this.filteredEiaList.length === 0) this.filteredEiaList = items.slice(0, 100);
      } else {
        this.filteredEiaList = items.slice(0, 100);
      }
      this.eiaDropdownOpen = true;
      this.updateEiaDropdownPosition();
    });
  }

  onEiaBlur(): void {
    this.eiaBlurTimer = setTimeout(() => {
      this.eiaDropdownOpen = false;
      this.eiaBlurTimer = null;
    }, 200);
  }

  onEiaSearchInput(): void {
    this.selectedPlantCode = '';
    const term = this.eiaSearchText || '';
    
    if (term.length === 0) {
      this.formData.eiaPlantCode = '';
      this.formData.eiaGeneratorId = '';
      this.formData.eiaUnitCode = '';
    }
    
    if (term.length > 0) {
      this.filteredEiaList = this.eiaLookupService.search(term, 100);
    } else {
      this.eiaLookupService.loadAll().subscribe(items => {
        this.filteredEiaList = items.slice(0, 100);
      });
    }
    this.eiaDropdownOpen = true;
    this.updateEiaDropdownPosition();
  }

  clearEiaBlurTimer(): void {
    if (this.eiaBlurTimer) {
      clearTimeout(this.eiaBlurTimer);
      this.eiaBlurTimer = undefined;
    }
  }

  onEiaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.eiaDropdownOpen = false;
      this.filteredEiaList = [];
    }
  }

  onEiaDropdownToggle(): void {
    if (this.eiaDropdownOpen) {
      this.eiaDropdownOpen = false;
      return;
    }
    this.eiaLookupService.loadAll().subscribe(items => {
      this.filteredEiaList = this.eiaSearchText
        ? this.eiaLookupService.search(this.eiaSearchText, 100)
        : items.slice(0, 100);
      this.eiaDropdownOpen = true;
      this.updateEiaDropdownPosition();
    });
  }

  onEiaItemSelect(item: EiaLookupItem): void {
    const displayCode = item.thirdValue 
      ? `${item.plantCode} $ ${item.generatorId} $ ${item.thirdValue}`
      : `${item.plantCode} $ ${item.generatorId} $`;
    this.eiaSearchText = displayCode;
    this.formData.eiaPlantCode = item.plantCode;
    this.formData.eiaGeneratorId = item.generatorId;
    this.formData.eiaUnitCode = item.thirdValue || '';
    this.selectedPlantCode = item.plantCode;
    this.eiaDropdownOpen = false;
    this.filteredEiaList = [];
    console.log('[onEiaItemSelect] Selected — Plant Code:', item.plantCode, ', Generator ID:', item.generatorId, ', Unit Code:', item.thirdValue);
  }

  private formatDateForApi(dateStr: any): string | null {
    if (!dateStr) return null;
    const s = String(dateStr);
    let dateObj: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      dateObj = new Date(y, m - 1, d);
    } else {
      dateObj = new Date(s);
    }
    if (isNaN(dateObj.getTime())) return s;
    const y = dateObj.getFullYear();
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const d = dateObj.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
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

  
  isFieldErrorVisible(fieldName: string): boolean {
    return this.formErrors && this.formErrors[fieldName];
  }

  getFieldError(fieldName: string): string {
    return this.formErrors && this.formErrors[fieldName] ? this.formErrors[fieldName] : '';
  }

}
