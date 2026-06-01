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

@Component({
  selector: 'app-operation-reserves-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TopCardsRowComponent, FilingFlagsModalComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective],
  template: `
    <div class="page-container">
      <app-top-cards-row
        pageTitle="Operation Reserves"
        pageSubtitle="Operation reserves for the selected company"
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
             <button class="btn btn-blue-copy" (click)="openModal('COPY_DATA')">Copy Data (All Screens)</button>
            <button class="btn btn-salmon-import">Import/Update Data from FERC</button>
            <button class="btn btn-darkred-import">Import only Operation Reserves</button>
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
                  <span class="label">ID</span>
                  <button class="filter-toggle" (click)="toggleFilter('id', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'id'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter ID..." [(ngModel)]="filterId" autofocus>
                    <button class="clear-btn" (click)="filterId = ''; activeFilter = null" *ngIf="filterId">Clear</button>
                  </div>
                </div>
              </th>
              <th class="col-name">
                <div class="header-container">
                  <span class="label">Reserve Name</span>
                  <button class="filter-toggle" (click)="toggleFilter('name', $event)">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  <div class="filter-dropdown" *ngIf="activeFilter === 'name'" (click)="$event.stopPropagation()">
                    <input type="text" class="column-filter" placeholder="Filter Name..." [(ngModel)]="filterName" autofocus>
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
                    <input type="text" class="column-filter" placeholder="Filter Type..." [(ngModel)]="filterType" autofocus>
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
                    <input type="text" class="column-filter" placeholder="Filter Date..." [(ngModel)]="filterDate" autofocus>
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
        <div class="modal-content" [class.wide]="modalMode === 'ADD' || modalMode === 'COPY_DATA'" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >> Copy Data</span>
                <span class="sub-title" *ngIf="modalMode === 'ADD' || modalMode === 'EDIT'">MBRDB >> Operation Reserves</span>
                <h2 class="main-title">{{ modalMode === 'COPY_DATA' ? 'Copy Data to Selected Company' : (modalMode === 'ADD' ? 'Add Reserve' : 'Reserve Details') }}</h2>
            </div>
            <button class="close-btn" (click)="closeModal()"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>
          <div class="modal-body" *ngIf="modalMode === 'ADD'"><div class="add-form"><div class="form-field"><label>Name:*</label><input type="text" class="form-input" [(ngModel)]="formData.name" placeholder="Enter reserve name"></div><div class="form-field"><label>Type:*</label><select class="form-input" [(ngModel)]="formData.type"><option value="">--Select--</option><option>Type A</option><option>Type B</option></select></div><div class="form-field"><label>Date:*</label><input type="date" class="form-input" [(ngModel)]="formData.date"></div></div></div>
          
          <div class="modal-body" *ngIf="modalMode === 'COPY_DATA'">
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
                      <input type="checkbox" [(ngModel)]="opt.selected">
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
          </div>
          <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD'">
            <ng-container *ngIf="modalMode === 'ADD'"><button class="btn-modal btn-submit" (click)="saveData()">Save</button><button class="btn-modal btn-save" (click)="resetForm()">Reset</button>            <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button></ng-container>

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
  styleUrls: ['./operation-reserves.component.scss']
})
export class OperationReservesComponent implements OnInit {
  data: any[] = [];
  isLoading = false;
  errorMessage = '';
  modalMode: string | null = null;
  companyId = 1;
  
  
  searchTerm = '';
  filterId = '';
  filterName = '';
  filterType = '';
  filterDate = '';
  filterRecordType = '';
  activeFilter: string | null = null;
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

  get filteredData() {
    return this.data.filter(item => {
      const globalMatch = !this.searchTerm || Object.values(item).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const idMatch = !this.filterId || String(item.id).toLowerCase().includes(this.filterId.toLowerCase());
      const nameMatch = !this.filterName || String(item.name).toLowerCase().includes(this.filterName.toLowerCase());
      const typeMatch = !this.filterType || String(item.type).toLowerCase().includes(this.filterType.toLowerCase());
      const dateMatch = !this.filterDate || String(item.date).toLowerCase().includes(this.filterDate.toLowerCase());
      const recordMatch = !this.filterRecordType || String(item.recordType || '').toLowerCase().includes(this.filterRecordType.toLowerCase());

      return globalMatch && idMatch && nameMatch && typeMatch && dateMatch && recordMatch;
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

  formData = { name: '', type: '', date: '', recordType: 'New' };

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
      }
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.data = [ { id: '', name: 'Reserve A', type: 'Type A', date: '01/15/2024', selected: true } ];
    this.isLoading = false;
  }

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
  }

  openModal(mode: string) {
    this.modalMode = mode;
  }
  closeModal() { this.modalMode = null; this.resetForm(); }

  resetForm() { this.formData = { name: '', type: '', date: '', recordType: 'New' }; }
  saveData() {
    this.isLoading = true;
    const payload = {
      ...this.formData,
      cid: this.companyId,
      record_type_fk: null,
      record_type_cd: this.formData.recordType || 'New',
      isActive: true
    };

    this.apiService.insUpdORUIWithResponse(payload).subscribe({
      next: (res: any) => {
        if ([200, 201, 204].includes(res.status)) {
          this.toast.success('Data saved successfully!');
          this.closeModal();
          this.loadData();
        } else {
          this.toast.warning('Saved but unexpected status: ' + res.status);
        }
      },
      error: (err: any) => {
        console.error('Error saving:', err);
        this.toast.error('Failed to save data.');
        this.isLoading = false;
      }
    });
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

  onEdit(item: any) { this.formData = { ...item, recordType: item.record_type_cd || 'Update' }; this.modalMode = 'EDIT'; }
  async onDelete(item: any) { if (await this.confirmService.show('Delete this record?', 'Confirm Delete', 'Delete', 'Cancel')) { this.loadData(); } }
  toggleAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    this.data.forEach(x => x.selected = checked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'mbr_operating_reserves', tableId: 'pid', value: checked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(item: any) {
    const pid = item.raw?.pid ?? item.pid ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'mbr_operating_reserves', tableId: 'pid', value: item.selected ? '1' : '0', whereIds: String(pid)
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
