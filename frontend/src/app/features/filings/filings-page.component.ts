import { Component, OnInit } from '@angular/core';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { FilingFlagsModalComponent } from '../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-filings-page',
  standalone: true,
  imports: [CommonModule, FormatDatePipe, SkeletonLoaderComponent, FormsModule],
  template: `
    <div class="page-container">
      <!-- Top Cards Section (Matching Entities/Assets Layout) -->
      <div class="top-cards-row">
        <div class="info-card">
          <h1 class="page-title">Filings History</h1>
          <p class="page-subtitle">The table below lists all filings submitted to FERC for the selected company</p>
        </div>

        <!-- Spacer for action cards if any in future -->
        <div class="spacer-card" style="visibility: hidden;"></div>
        
      </div>

      <!-- Main Content Card -->
      <div class="main-content-card">
        <!-- Warning Area -->
        <div class="warning-banner" *ngIf="!isLoading && filings.length === 0">
           Currently you have no filings for the selected company
        </div>

        <!-- Search Box -->
        <div class="action-buttons-group" *ngIf="!isLoading && filings.length > 0">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
          </div>
        </div>

        <!-- Table View -->
        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="7"></app-skeleton-loader>
        <div class="table-wrapper" *ngIf="!isLoading && filings.length > 0">
          <table class="entities-table">
            <thead>
              <tr>
                <th class="col-sl">SL</th>
                <th class="col-type">
                  <div class="header-container">
                    <span class="label">Filing Type</span>
                    <button class="filter-toggle" (click)="toggleFilter('type', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'type'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterFilingType" autofocus>
                      <button class="clear-btn" (click)="filterFilingType = ''; activeFilter = null" *ngIf="filterFilingType">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-date">
                  <div class="header-container">
                    <span class="label">Filing Date</span>
                    <button class="filter-toggle" (click)="toggleFilter('date', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'date'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterFilingDate" autofocus>
                      <button class="clear-btn" (click)="filterFilingDate = ''; activeFilter = null" *ngIf="filterFilingDate">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-subid">
                  <div class="header-container">
                    <span class="label">FERC Submission ID#</span>
                    <button class="filter-toggle" (click)="toggleFilter('subid', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'subid'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterSubmissionId" autofocus>
                      <button class="clear-btn" (click)="filterSubmissionId = ''; activeFilter = null" *ngIf="filterSubmissionId">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-status">
                  <div class="header-container">
                    <span class="label">FERC Filing Status</span>
                    <button class="filter-toggle" (click)="toggleFilter('status', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'status'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterStatus" autofocus>
                      <button class="clear-btn" (click)="filterStatus = ''; activeFilter = null" *ngIf="filterStatus">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-substatus">
                  <div class="header-container">
                    <span class="label">FERC Submission Status</span>
                    <button class="filter-toggle" (click)="toggleFilter('substatus', $event)">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="filter-dropdown" *ngIf="activeFilter === 'substatus'" (click)="$event.stopPropagation()">
                      <input type="text" class="column-filter" placeholder="Filter..." [(ngModel)]="filterSubmissionStatus" autofocus>
                      <button class="clear-btn" (click)="filterSubmissionStatus = ''; activeFilter = null" *ngIf="filterSubmissionStatus">Clear</button>
                    </div>
                  </div>
                </th>
                <th class="col-actions">MBR Validation</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let filing of filteredData; let i = index">
                <td class="col-sl">{{ i + 1 }}</td>
                <td class="col-type">{{ filing.filingtype || 'TestOnly' }}</td>
                <td class="col-date">{{ filing.filingdate | formatDate }}</td>
                <td class="col-subid">{{ filing.fercsubid || 'N/A' }}</td>
                <td class="col-status">
                  <span class="status-badge" [attr.data-status]="(filing.fercstatus || 'succeeded').toLowerCase()">
                    {{ filing.fercstatus || 'Succeeded' }}
                  </span>
                </td>
                <td class="col-substatus">{{ filing.fercsubstatus || '--' }}</td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button class="action-btn fetch" title="Fetch Entity Data" (click)="fetchEntityData(filing)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                      </svg>
                    </button>
                    <button class="action-btn view" title="View Results" (click)="viewFiling(filing)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filings-page.component.scss']
})
export class FilingsPageComponent implements OnInit {
  filings: any[] = [];
  isLoading = true;

  
  searchTerm = '';
  filterFilingType = '';
  filterFilingDate = '';
  filterSubmissionId = '';
  filterStatus = '';
  filterSubmissionStatus = '';
  activeFilter: string | null = null;

  constructor(
    private apiService: ApiService,
    private companyContextService: CompanyContextService,
    private toastService: ToastService
  ) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.companyContextService.currentCompany$.subscribe(company => {
      this.loadFilings(company);
    });
  }

  get filteredData() {
    return this.filings.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const typeMatch = !this.filterFilingType || String(item.filingtype || '').toLowerCase().includes(this.filterFilingType.toLowerCase());
      const dateMatch = !this.filterFilingDate || String(item.filingdate || '').toLowerCase().includes(this.filterFilingDate.toLowerCase());
      const subIdMatch = !this.filterSubmissionId || String(item.fercsubid || '').toLowerCase().includes(this.filterSubmissionId.toLowerCase());
      const statusMatch = !this.filterStatus || String(item.fercstatus || '').toLowerCase().includes(this.filterStatus.toLowerCase());
      const subStatusMatch = !this.filterSubmissionStatus || String(item.fercsubstatus || '').toLowerCase().includes(this.filterSubmissionStatus.toLowerCase());
      
      return globalMatch && typeMatch && dateMatch && subIdMatch && statusMatch && subStatusMatch;
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

  loadFilings(company: any) {
    const cid = company?.cid ?? company?.company_id ?? company?.CID;

    if (!cid) {
      this.isLoading = false;
      this.filings = [];
      return;
    }

    this.isLoading = true;
    this.apiService.getFilingListByCID(cid).subscribe({
      next: (data) => {
        console.log('[FilingsPage] raw API response:', data);
        this.filings = this.extractRecords(data);
        console.log('[FilingsPage] extracted filings:', this.filings);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading filings:', err);
        this.isLoading = false;
        this.filings = [];
      }
    });
  }

  private extractRecords(apiData: any): any[] {
    if (!apiData) return [];
    if (Array.isArray(apiData)) {
      
      const tableWithRows = apiData.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
      if (tableWithRows) return tableWithRows.rows;
      
      if (apiData.length > 0 && apiData[0].fid !== undefined) return apiData;
      return apiData;
    }
    if (apiData.rows && Array.isArray(apiData.rows)) return apiData.rows;
    if (apiData.data && Array.isArray(apiData.data)) return apiData.data;
    return [];
  }

  viewFiling(filing: any) {
    const uid = filing.uid;
    const cid = filing.cid;
    const fercsubid = filing.fercsubid;
    
    if (!uid || !cid || !fercsubid) {
      this.toastService.show('Missing required data for FERC validation', 'error');
      return;
    }
    
    const company_id = cid.toString();
    
    this.apiService.pullDataBySub(uid, cid, company_id, fercsubid).subscribe({
      next: (response: any) => {
        const fercUrl = environment.fercMBRValidation.replaceAll('{0}', fercsubid);
        window.open(fercUrl, '_blank');
        this.toastService.show('Opening FERC validation results...', 'success');
      },
      error: (err: any) => {
        console.error('Error pulling FERC data:', err);
        this.toastService.show('Failed to fetch FERC validation data', 'error');
      }
    });
  }

  fetchEntityData(filing: any) {
    const uid = filing.uid;
    const cid = filing.cid;
    const entity = filing.fid; 
    
    if (!uid || !cid || !entity) {
      this.toastService.show('Missing required data for entity fetch', 'error');
      return;
    }
    
    const company_id = cid.toString();
    
    this.apiService.pullDataByEntity(uid, cid, company_id, entity).subscribe({
      next: (response: any) => {
        console.log('Entity data fetched:', response);
        this.toastService.show('Entity data fetched successfully', 'success');
      },
      error: (err: any) => {
        console.error('Error fetching entity data:', err);
        this.toastService.show('Failed to fetch entity data', 'error');
      }
    });
  }
}
