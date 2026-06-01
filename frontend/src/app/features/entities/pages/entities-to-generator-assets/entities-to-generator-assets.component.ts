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
import { MBREntitiesToGenAssetsValidator } from '../../../../core/validators/mbr-entities-to-gen-assets.validator';

@Component({
  selector: 'app-entities-to-generator-assets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, BalancingAuthorityDropdownComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Entities to Generator Assets"
        pageSubtitle="Relationships between entities and generator assets"
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
            <button class="btn btn-darkred-import" (click)="confirmImportOnly()">Import only Entities to Generator Assets</button>
            <button class="btn btn-navy-add" (click)="openModal('ADD')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="8"></app-skeleton-loader>
        <div class="table-scroll-wrapper" *ngIf="!isLoading">
        <table class="entities-table">
          <thead>
            <tr>
              <th class="col-check">
                <label class="checkbox-container">
                  <input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)">
                  <span class="checkmark"></span>
                  <span class="label-text">All</span>
                </label>
              </th>
              <th>SL No</th>
              <th>
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
              <th>Asset Type</th>
              <th>
                <div class="header-container">
                  <span class="label">EIA Code</span>
                  <button class="filter-toggle" (click)="toggleFilter('eia', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'eia'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter EIA Code..." [(ngModel)]="filterEiaCode" autofocus>
                    <button class="clear-btn" (click)="filterEiaCode = ''; activeFilter = null" *ngIf="filterEiaCode">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-container">
                  <span class="label">Entity Type</span>
                  <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Type..." [(ngModel)]="filterEntityType" autofocus>
                    <button class="clear-btn" (click)="filterEntityType = ''; activeFilter = null" *ngIf="filterEntityType">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-container">
                  <span class="label">Entity ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('eid', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'eid'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Entity ID..." [(ngModel)]="filterEntityId" autofocus>
                    <button class="clear-btn" (click)="filterEntityId = ''; activeFilter = null" *ngIf="filterEntityId">Clear</button>
                  </div>
                </div>
              </th>
              <th>Relationship Type</th>
              <th>
                <div class="header-container">
                  <span class="label">Relation Start Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('start', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'start'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStartDate" autofocus>
                    <button class="clear-btn" (click)="filterStartDate = ''; activeFilter = null" *ngIf="filterStartDate">Clear</button>
                  </div>
                </div>
              </th>
              <th>
                <div class="header-container">
                  <span class="label">Relation End Date</span>
                  <button class="filter-toggle" (click)="toggleFilter('end', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'end'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterEndDate" autofocus>
                    <button class="clear-btn" (click)="filterEndDate = ''; activeFilter = null" *ngIf="filterEndDate">Clear</button>
                  </div>
                </div>
              </th>
              <th>Physical Location BAA</th>
              <th>Telemetered Location BAA</th>
              <th>Amount</th>
              <th>
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
            <tr *ngFor="let item of filteredData; let i = index" [class.is-deleted-record]="item.isDeleted">
              <td class="col-check">
                <label class="checkbox-container">
                  <input type="checkbox" [(ngModel)]="item.selected" (change)="onCheckboxChange(item)">
                  <span class="checkmark"></span>
                </label>
              </td>
              <td>{{ i + 1 }}</td>
              <td>{{ item.fercId }}</td>
              <td>{{ item.assetType }}</td>
              <td>{{ item.eiaCode }}</td>
              <td>{{ item.entityType }}</td>
              <td>{{ item.entityId }}</td>
              <td>{{ item.relationshipType }}</td>
              <td>{{ item.relationStartDate }}</td>
              <td>{{ item.relationEndDate }}</td>
              <td>{{ item.physicalLocationBaa }}</td>
              <td>{{ item.telemeteredLocationBaa }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.recordType }}</td>
              <td class="col-actions">
                <div class="action-cell">
                  <button class="action-btn copy" (click)="onCopy(item)" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 9h20"/></svg>
                  </button>
                  <button class="action-btn edit" (click)="onEdit(item)" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" (click)="onDelete(item)" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
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
                <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">{{ modalMode === 'ADD' ? 'MBRDB >> Add Generator Asset' : 'MBRDB >> Edit Generator Asset' }}</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : 
                     modalMode === 'ADD' ? 'Generator Asset Add' : 
                     modalMode === 'EDIT' ? 'Generator Asset Edit' : 'Generator Assets' }}
                </h2>
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
                  <div class="form-field">
                    <label>Gen Asset Type:<span class="req">*</span></label>
                    <div class="select-wrapper">
                      <select class="form-input" [ngClass]="{ 'error': formErrors.genAssetType }" [(ngModel)]="formData.reportableEntityType" name="reportableEntityType" (input)="formErrors.genAssetType = ''">
                        <option value="">--Select--</option>
                        <option value="1">EIA</option>
                        <option value="2">Asset ID</option>
                      </select>
                    </div>
                    <small class="error-text" *ngIf="formErrors.genAssetType">{{ formErrors.genAssetType }}</small>
                  </div>

                  <div class="form-field">
                    <label>Relationship Type:<span class="req">*</span></label>
                    <div class="select-wrapper">
                      <select class="form-input" [ngClass]="{ 'error': formErrors.relationshipType }" [(ngModel)]="formData.relationshipType" (input)="formErrors.relationshipType = ''">
                        <option value="">--Select--</option>
                        <option value="1">Ownership</option>
                        <option value="2">Control</option>
                        <option value="3">Both own and control</option>
                      </select>
                    </div>
                    <small class="error-text" *ngIf="formErrors.relationshipType">{{ formErrors.relationshipType }}</small>
                  </div>
                </div>

                <div class="form-row">
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

                  <div class="form-field">
                    <label>Reportable Entity Type:<span class="req">*</span></label>
                    <div class="select-wrapper">
                      <select class="form-input" [ngClass]="{ 'error': formErrors.entityIdType }" [(ngModel)]="formData.reportableEntityTypeSecond" (input)="formErrors.entityIdType = ''">
                        <option selected="selected" value="CID">Company Identifier (Format: C123456)</option>
                        <option value="LEI">Legal Entity Identifier (Limit to 20 characters)</option>
                        <option value="GID">FERC Generated ID (Format: GID1234567)</option>
                      </select>
                    </div>
                    <small class="error-text" *ngIf="formErrors.entityIdType">{{ formErrors.entityIdType }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>EIA Plant Code:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.eiaPlantCode }" [(ngModel)]="formData.eiaPlantCode" name="eiaPlantCode" [disabled]="isAssetIdSelected()" placeholder="" (input)="formErrors.eiaPlantCode = ''">
                    <small class="error-text" *ngIf="formErrors.eiaPlantCode">{{ formErrors.eiaPlantCode }}</small>
                  </div>

                  <div class="form-field">
                    <label>Reportable Entity ID:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.entityId }" [(ngModel)]="formData.reportableEntityId" placeholder="" (input)="formErrors.entityId = ''">
                    <small class="error-text" *ngIf="formErrors.entityId">{{ formErrors.entityId }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>EIA Generator ID:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.eiaGeneratorId }" [(ngModel)]="formData.eiaGeneratorId" name="eiaGeneratorId" [disabled]="isAssetIdSelected()" placeholder="" (input)="formErrors.eiaGeneratorId = ''">
                    <small class="error-text" *ngIf="formErrors.eiaGeneratorId">{{ formErrors.eiaGeneratorId }}</small>
                  </div>

                  <div class="form-field">
                    <label>Relationship Start Date:<span class="req">*</span></label>
                    <input type="date" class="form-input" [ngClass]="{ 'error': formErrors.relationshipStartDate }" [(ngModel)]="formData.relationshipStartDate" (input)="formErrors.relationshipStartDate = ''">
                    <small class="error-text" *ngIf="formErrors.relationshipStartDate">{{ formErrors.relationshipStartDate }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>EIA Unit Code:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.eiaUnitCode }" [(ngModel)]="formData.eiaUnitCode" name="eiaUnitCode" [disabled]="isAssetIdSelected()" placeholder="" (input)="formErrors.eiaUnitCode = ''">
                    <small class="error-text" *ngIf="formErrors.eiaUnitCode">{{ formErrors.eiaUnitCode }}</small>
                  </div>

                  <div class="form-field">
                    <label>Relationship End Date:</label>
                    <input type="date" class="form-input" [ngClass]="{ 'error': formErrors.relationshipEndDate }" [(ngModel)]="formData.relationshipEndDate" (input)="formErrors.relationshipEndDate = ''">
                    <small class="error-text" *ngIf="formErrors.relationshipEndDate">{{ formErrors.relationshipEndDate }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>FERC Asset Generator Code:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.fercAssetGenCode }" [(ngModel)]="formData.fercAssetGeneratorCode" name="fercAssetGeneratorCode" [disabled]="!isAssetIdSelected()" placeholder="" (input)="formErrors.fercAssetGenCode = ''">
                    <small class="error-text" *ngIf="formErrors.fercAssetGenCode">{{ formErrors.fercAssetGenCode }}</small>
                  </div>

                  <div class="form-field">
                    <label>Physical Location Balancing Authority:<span class="req">*</span></label>
                    <app-balancing-authority-dropdown 
                      [(ngModel)]="formData.physicalLocationBaa"
                      [balancingAuthorities]="balancingAuthorities">
                    </app-balancing-authority-dropdown>
                    <small class="error-text" *ngIf="formErrors.physicalLocationBaa">{{ formErrors.physicalLocationBaa }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Telemetered Location Balancing Authority:<span class="req">*</span></label>
                    <app-balancing-authority-dropdown 
                      [(ngModel)]="formData.telemeteredLocationBaa"
                      [balancingAuthorities]="balancingAuthorities">
                    </app-balancing-authority-dropdown>
                    <small class="error-text" *ngIf="formErrors.telemeteredLocationBaa">{{ formErrors.telemeteredLocationBaa }}</small>
                  </div>

                  <div class="form-field">
                    <label>Cap Rating Adjusted:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.capRatingAdjusted }" [(ngModel)]="formData.capRatingAdjusted" placeholder="" (input)="formErrors.capRatingAdjusted = ''">
                    <small class="error-text" *ngIf="formErrors.capRatingAdjusted">{{ formErrors.capRatingAdjusted }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Adjusted Rating Options:<span class="req">*</span></label>
                    <div class="select-wrapper">
                      <select class="form-input" [ngClass]="{ 'error': formErrors.adjustedRatingOptions }" [(ngModel)]="formData.adjustedRatingOptions" (input)="formErrors.adjustedRatingOptions = ''">
                        <option value="">--Select--</option>
                        <option value="1">Nameplate</option>
                        <option value="2">Seasonal</option>
                        <option value="3">5-yr Unit</option>
                        <option value="4">5-yr EIA</option>
                        <option value="5">Alternative</option>
                      </select>
                    </div>
                    <small class="error-text" *ngIf="formErrors.adjustedRatingOptions">{{ formErrors.adjustedRatingOptions }}</small>
                  </div>

                  <div class="form-field">
                    <label>Record Type:</label>
                    <div class="select-wrapper">
                      <select class="form-input" [ngClass]="{ 'error': formErrors.recordType }" [(ngModel)]="formData.recordType" (input)="formErrors.recordType = ''">
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
                    <label>Alt Methodology Used:</label>
                    <input type="text" class="form-input" [(ngModel)]="formData.altMethodologyUsed" placeholder="">
                  </div>

                  <div class="form-field">
                    <label>Amount:<span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.amount }" [(ngModel)]="formData.amount" placeholder="" (input)="formErrors.amount = ''">
                    <small class="error-text" *ngIf="formErrors.amount">{{ formErrors.amount }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Explanatory Notes:</label>
                    <input type="text" class="form-input" [(ngModel)]="formData.explanatoryNotes" placeholder="">
                  </div>
                </div>

                <!-- Conditional Reference ID field (only for Update records) -->
                <div class="form-row" *ngIf="formData.recordType === 'Update'">
                  <div class="form-field">
                    <label>Reference ID: <span class="req">*</span></label>
                    <input type="text" class="form-input" [ngClass]="{ 'error': formErrors.referenceId }" [(ngModel)]="formData.referenceId" placeholder="Enter reference ID" readonly>
                    <small class="error-text" *ngIf="formErrors.referenceId">{{ formErrors.referenceId }}</small>
                  </div>
                </div>
              </div>
            </ng-container>

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
  styleUrls: ['./entities-to-generator-assets.component.scss']
})
export class EntitiesToGeneratorAssetsComponent implements OnInit, OnDestroy {
  data: any[] = [];

  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 0;

  
  searchTerm = '';
  filterId = '';
  filterEntityType = '';
  filterEiaCode = '';
  filterEntityId = '';
  filterStartDate = '';
  filterEndDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;

  get filteredData() {
    return this.data.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const idMatch = !this.filterId || String(item.fercId).toLowerCase().includes(this.filterId.toLowerCase());
      const typeMatch = !this.filterEntityType || String(item.entityType).toLowerCase().includes(this.filterEntityType.toLowerCase());
      const eiaMatch = !this.filterEiaCode || String(item.eiaCode).toLowerCase().includes(this.filterEiaCode.toLowerCase());
      const entityIdMatch = !this.filterEntityId || String(item.entityId).toLowerCase().includes(this.filterEntityId.toLowerCase());
      const startMatch = !this.filterStartDate || String(item.relationStartDate).toLowerCase().includes(this.filterStartDate.toLowerCase());
      const endMatch = !this.filterEndDate || String(item.relationEndDate).toLowerCase().includes(this.filterEndDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType).toLowerCase().includes(this.filterRecordType.toLowerCase());

      return globalMatch && idMatch && typeMatch && eiaMatch && entityIdMatch && startMatch && endMatch && recordMatch;
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

  formData: any = {};
  
  formErrors: any = {
    genAssetType: '',
    eiaPlantCode: '',
    eiaGeneratorId: '',
    eiaUnitCode: '',
    fercAssetGenCode: '',
    entityIdType: '',
    entityId: '',
    relationshipType: '',
    relationshipStartDate: '',
    relationshipEndDate: '',
    physicalLocationBaa: '',
    telemeteredLocationBaa: '',
    capRatingAdjusted: '',
    adjustedRatingOptions: '',
    amount: '',
    recordType: '',
    referenceId: ''
  };
  
  
  editingId: number | null = null;
  editingPid: number | null = null;
  cachedPid: number = 0;
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
  editingEntitiesGenassetsId: number | null = null;

  
  
  balancingAuthorities: any[] = [];
  entityTypes: any[] = [];
  assetCodes: any[] = [];

  
  eiaSearchText = '';
  filteredEiaList: EiaLookupItem[] = [];
  eiaDropdownOpen = false;
  eiaDropdownStyle: { [key: string]: string } = {};
  private eiaBlurTimer: any = null;
  private selectedPlantCode = '';
  @ViewChild('eiaInput') eiaInputRef!: ElementRef<HTMLInputElement>;

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

  
  private updateDropdownPosition(): void {
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
    console.log('[loadDropdowns] Starting dropdown load...');
    this.apiService.getDropDownList('lookbaa', 'ID', 'baa_desc').subscribe({
      next: (res) => { 
        this.balancingAuthorities = (res && Array.isArray(res)) ? res : []; 
      },
      error: (err) => { console.error('Error loading BA list:', err); }
    });
    this.apiService.getDropDownList('lookentityidtype', 'entity_ID_type_cd', 'entity_ID_type_nm').subscribe({
      next: (res) => { 
        this.entityTypes = (res && Array.isArray(res)) ? res : []; 
      },
      error: (err) => { console.error('Error loading entity types:', err); }
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

  loadData() {
    this.companyId = this.getCurrentCid();
    if (this.companyId === 0) {
      console.warn('[loadData] Company ID is 0, skipping load.');
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getEtoGenListByCID(this.companyId).subscribe({
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

        this.data = records.map((item: any) => ({
          ...item,
          selected: !!item.IncInFiling || false,
          fercId: '',
          assetType: item.gen_asset_type || item.assetType,
          eiaCode: item.asset_code || item.eiaCode,
          entityType: item.entity_ID_type_CD || item.entityType,
          entityId: item.entity_ID || item.entityId,
          relationshipType: item.relationship_type || item.relationshipType,
          relationStartDate: item.relationship_start_date || item.relationStartDate,
          relationEndDate: item.relationship_end_date || item.relationEndDate,
          physicalLocationBaa: item.physical_location_Balancing_Authority_cd || item.physicalLocationBaa,
          telemeteredLocationBaa: item.telemetered_location_Balancing_Authority_cd || item.telemeteredLocationBaa,
          amount: item.amount,
          recordType: item.record_type_cd || item.recordType,
          isDeleted: !!item.IsDeleteAtFERC
        }));

        if (this.data.length > 0) {
          const pids = this.data.map(d => Number(d.pid || d.Pid || 0)).filter(p => !isNaN(p));
          const maxPid = pids.length > 0 ? Math.max(...pids) : 0;
          this.cachedPid = maxPid + 1;
        } else {
          this.cachedPid = 1;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching EtoGen list:', err);
        this.errorMessage = 'Failed to load entities to generator assets data.';
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
    console.log('[openModal] Opening modal with mode:', mode);
    this.modalMode = mode; 
    if (mode === 'ADD') {
      this.resetForm();
    }
  }
  closeModal() { this.modalMode = null; this.resetForm(); }
  resetForm() { 
    this.formData = {
      reportableEntityType: '',
      eiaPlantCode: '',
      eiaGeneratorId: '',
      eiaUnitCode: '',
      eiaThirdValue: '',
      eiA_fk: null,
      fercAssetGeneratorCode: '',
      reportableEntityTypeSecond: '',
      reportableEntityId: '',
      relationshipType: '',
      relationshipStartDate: '',
      relationshipEndDate: '',
      physicalLocationBaa: '',
      telemeteredLocationBaa: '',
      capRatingAdjusted: '',
      adjustedRatingOptions: '',
      altMethodologyUsed: '',
      amount: '',
      explanatoryNotes: '',
      recordType: 'New',
      referenceId: ''
    };
    this.formErrors = {
      genAssetType: '',
      eiaPlantCode: '',
      eiaGeneratorId: '',
      eiaUnitCode: '',
      fercAssetGenCode: '',
      entityIdType: '',
      entityId: '',
      relationshipType: '',
      relationshipStartDate: '',
      relationshipEndDate: '',
      physicalLocationBaa: '',
      telemeteredLocationBaa: '',
      capRatingAdjusted: '',
      adjustedRatingOptions: '',
      amount: '',
      recordType: '',
      referenceId: ''
    };
    this.eiaSearchText = '';
    this.filteredEiaList = [];
    this.eiaDropdownOpen = false;
    this.selectedPlantCode = '';
    this.editingPid = 0;
    this.editingEntitiesGenassetsId = null;
  }

  fillDummyData() {
    this.eiaLookupService.loadAll().subscribe(items => {
      
      const randomEia = items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;
      
      const randomId = 'C' + Math.floor(Math.random() * 9000000 + 1000000);
      
      const randomAmt = Math.floor(Math.random() * 500) + 1;
      const randomCap = Math.floor(Math.random() * 1000) + 10;
      
      this.formData = {
        reportableEntityType: '1', 
        eiaPlantCode: randomEia ? randomEia.plantCode : '57822',
        eiaGeneratorId: randomEia ? randomEia.generatorId : 'YNKE',
        eiaUnitCode: randomEia ? (randomEia.thirdValue || '') : '',
        fercAssetGeneratorCode: '',
        eiA_fk: null,
        reportableEntityTypeSecond: 'CID',
        reportableEntityId: randomId,
        relationshipType: String(Math.floor(Math.random() * 3) + 1), 
        relationshipStartDate: new Date().toISOString().split('T')[0],
        relationshipEndDate: '',
        physicalLocationBaa: 'PJM',
        telemeteredLocationBaa: 'PJM',
        capRatingAdjusted: randomCap.toString(),
        adjustedRatingOptions: '1',
        altMethodologyUsed: '',
        amount: randomAmt.toString(),
        explanatoryNotes: 'Random test data generated on ' + new Date().toLocaleString(),
        recordType: 'New'
      };

      if (randomEia) {
        this.eiaSearchText = randomEia.thirdValue 
          ? `${randomEia.plantCode} $ ${randomEia.generatorId} $ ${randomEia.thirdValue}`
          : `${randomEia.plantCode} $ ${randomEia.generatorId} $`;
        this.selectedPlantCode = randomEia.plantCode;
      }

      this.toast.info('Form filled with random test data.');
    });
  }
  saveData() {
    
    const validation = MBREntitiesToGenAssetsValidator.validateRecord(this.formData);
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

    const cid = this.getCurrentCid();
    const uid = this.getUidFromStorage();
    const isEditMode = this.modalMode === 'EDIT';
    
    
    const targetPid = isEditMode ? (this.editingPid || this.cachedPid || 1) : 0;
    const payload: any = {
      record_type_fk: isEditMode ? 2 : 1, 
      pid: targetPid,
      cid: cid,
      uid: String(uid),
      entities_genassets_id: isEditMode ? this.editingEntitiesGenassetsId : null,
      reporting_entity_cid_cd: this.formData.reportableEntityId || "",
      mbr_submission_fk: (isEditMode && this.formData.mbr_submission_fk) ? this.formData.mbr_submission_fk : targetPid,
      active_date: null,
      inactive_date: null,
      updated_record_id: null,
      eiA_fk: this.formData.eiA_fk || null,
      record_type_cd: isEditMode ? (this.formData.recordType || 'Update') : 'New',
      reference_id: this.formData.recordType === 'Update' ? parseInt(this.formData.referenceId, 10) : null,
      generation_asset_type_id: this.formData.reportableEntityType ? Number(this.formData.reportableEntityType) : null,
      generation_asset_type_fk: this.formData.reportableEntityType ? Number(this.formData.reportableEntityType) : null,
      eia_plant_code: this.formData.eiaPlantCode || "",
      eia_generator_id: this.formData.eiaGeneratorId || "",
      eia_unit_code: this.formData.eiaUnitCode || "",
      ferc_asset_Gen_code: this.formData.fercAssetGeneratorCode || "",
      entity_ID_type_CD: this.formData.reportableEntityTypeSecond || "",
      entity_ID: this.formData.reportableEntityId || "",
      relationship_type: this.formData.relationshipType,
      relationship_type_fk: this.formData.relationshipType ? Number(this.formData.relationshipType) : null,
      relationship_start_date: MBREntitiesToGenAssetsValidator.toIsoDateTime(this.formData.relationshipStartDate),
      relationship_end_date: MBREntitiesToGenAssetsValidator.toIsoDateTime(this.formData.relationshipEndDate),
      balancing_Authority_cd: this.formData.physicalLocationBaa,
      balancing_authority: this.formData.physicalLocationBaa,
      source_balancing_authority_cd: this.formData.physicalLocationBaa,
      physical_location_Balancing_Authority_cd: this.formData.physicalLocationBaa || "",
      physical_location_balancing_authority_cd: this.formData.physicalLocationBaa,
      telemetered_location_Balancing_Authority_cd: this.formData.telemeteredLocationBaa || "",
      telemetered_location_balancing_authority_cd: this.formData.telemeteredLocationBaa,
      cap_rating_adjusted: this.formData.capRatingAdjusted ? this.formData.capRatingAdjusted.toString() : "0",
      adj_rating_options_fk: this.formData.adjustedRatingOptions ? Number(this.formData.adjustedRatingOptions) : null,
      adj_rating_options_cd: this.formData.adjustedRatingOptions ? this.formData.adjustedRatingOptions.toString() : "",
      alt_methodology_used: this.formData.altMethodologyUsed || "",
      amount: this.formData.amount ? this.formData.amount.toString() : "0",
      explanatory_notes: this.formData.explanatoryNotes || "",
      isActive: true,
      IsActive: true
    };

    console.log('[saveData] Submitting to API endpoint:', isEditMode ? 'Update' : 'Add');
    console.log('[saveData] Payload:', JSON.stringify(payload, null, 2));

    this.apiService.insUpdEtoGenUIWithResponse(payload).subscribe({
      next: (res: any) => {
        console.log('[saveData] API Response:', res);
        console.log('[saveData] Data saved successfully');
        this.toast.success('Data saved successfully');
        this.closeModal();
        this.loadData();
      },
      error: (err: any) => {
        console.error('[saveData] API Error:', err);
        this.toast.error('Failed to save data. Please check required fields.');
      },
      complete: () => { this.isLoading = false; }
    });
  }

  onEdit(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any) => {
      if (!d) return '';
      const s = String(d);
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      return s;
    };

    this.formData = {
      reportableEntityType: r.generation_asset_type_id != null ? String(r.generation_asset_type_id) : '',

      eiaPlantCode: r.eia_plant_code ?? '',
      eiaGeneratorId: r.eia_generator_id ?? '',
      eiaUnitCode: r.eia_unit_code ?? '',
      fercAssetGeneratorCode: r.ferc_asset_Gen_code ?? '',
      reportableEntityTypeSecond: r.entity_ID_type_CD ?? '',
      reportableEntityId: r.entity_ID ?? '',
      relationshipType: r.relationship_type_fk != null ? String(r.relationship_type_fk) : '',
      relationshipStartDate: parseDateForInput(r.relationship_start_date),
      relationshipEndDate: parseDateForInput(r.relationship_end_date),
      physicalLocationBaa: r.physical_location_Balancing_Authority_cd ?? '',
      telemeteredLocationBaa: r.telemetered_location_Balancing_Authority_cd ?? '',
      capRatingAdjusted: r.cap_rating_adjusted != null ? String(r.cap_rating_adjusted) : '',
      adjustedRatingOptions: r.adj_rating_options_fk != null ? String(r.adj_rating_options_fk) : '',
      altMethodologyUsed: r.alt_methodology_used ?? '',
      amount: r.amount != null ? String(r.amount) : '',
      explanatoryNotes: r.explanatory_notes ?? '',
      eiA_fk: r.eiA_fk || r.EIA_fk || null,
      mbr_submission_fk: r.mbr_submission_fk || null,
      recordType: r.record_type_cd ?? 'Update',
      referenceId: r.reference_id ? String(r.reference_id) : ''
    };

    this.editingPid = r.pid || 0;
    this.editingEntitiesGenassetsId = r.entities_genassets_id || null;

    if (this.formData.eiaPlantCode) {
      this.eiaSearchText = this.formData.eiaUnitCode 
        ? `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $ ${this.formData.eiaUnitCode}`
        : `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $`;
      this.selectedPlantCode = this.formData.eiaPlantCode;
    }

    this.modalMode = 'EDIT';
  }

  onCopy(item: any) {
    const r = item.raw ?? item;

    const parseDateForInput = (d: any) => {
      if (!d) return '';
      const s = String(d);
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      return s;
    };

    this.formData = {
      reportableEntityType: r.generation_asset_type_id != null ? String(r.generation_asset_type_id) : '',
      eiaPlantCode: r.eia_plant_code ?? '',
      eiaGeneratorId: r.eia_generator_id ?? '',
      eiaUnitCode: r.eia_unit_code ?? '',
      fercAssetGeneratorCode: r.ferc_asset_Gen_code ?? '',
      reportableEntityTypeSecond: r.entity_ID_type_CD ?? '',
      reportableEntityId: r.entity_ID ?? '',
      relationshipType: r.relationship_type_fk != null ? String(r.relationship_type_fk) : '',
      relationshipStartDate: parseDateForInput(r.relationship_start_date),
      relationshipEndDate: parseDateForInput(r.relationship_end_date),
      physicalLocationBaa: r.physical_location_Balancing_Authority_cd ?? '',
      telemeteredLocationBaa: r.telemetered_location_Balancing_Authority_cd ?? '',
      capRatingAdjusted: r.cap_rating_adjusted != null ? String(r.cap_rating_adjusted) : '',
      adjustedRatingOptions: r.adj_rating_options_fk != null ? String(r.adj_rating_options_fk) : '',
      altMethodologyUsed: r.alt_methodology_used ?? '',
      amount: r.amount != null ? String(r.amount) : '',
      explanatoryNotes: r.explanatory_notes ?? '',
      eiA_fk: r.eiA_fk || r.EIA_fk || null,
      mbr_submission_fk: null,
      recordType: 'New'
    };

    this.editingPid = 0;
    this.editingEntitiesGenassetsId = null;

    if (this.formData.eiaPlantCode) {
      this.eiaSearchText = this.formData.eiaUnitCode 
        ? `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $ ${this.formData.eiaUnitCode}`
        : `${this.formData.eiaPlantCode} $ ${this.formData.eiaGeneratorId} $`;
      this.selectedPlantCode = this.formData.eiaPlantCode;
    }

    this.modalMode = 'ADD';
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
  async onDelete(item: any) { if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { this.loadData(); } }
  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.data.forEach(x => x.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'entities_to_genassets', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'entities_to_genassets', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
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

  trackByValue(index: number, item: any): any {
    return item.value || index;
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
      this.updateDropdownPosition();
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
      this.formData.eiaThirdValue = '';
    }
    
    if (term.length > 0) {
      this.filteredEiaList = this.eiaLookupService.search(term, 100);
    } else {
      this.eiaLookupService.loadAll().subscribe(items => {
        this.filteredEiaList = items.slice(0, 100);
      });
    }
    this.eiaDropdownOpen = true;
    this.updateDropdownPosition();
  }

  
  isAssetIdSelected(): boolean {
    return this.formData.reportableEntityType === '2';
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
      this.updateDropdownPosition();
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
    this.formData.eiaThirdValue = item.thirdValue || '';
    this.selectedPlantCode = item.plantCode;
    this.eiaDropdownOpen = false;
    this.filteredEiaList = [];
    console.log('[onEiaItemSelect] Selected — Plant Code:', item.plantCode, ', Generator ID:', item.generatorId, ', Unit Code:', item.thirdValue);
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
