import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';
import { FilingFlagsModalComponent } from '../../shared/components/filing-flags-modal/filing-flags-modal.component';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-entities-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilingFlagsModalComponent, SanitizeInputDirective, SkeletonLoaderComponent, DatePickerOnlyDirective, FormatDatePipe],
  template: `
    <div class="page-container">
      <!-- Top Cards Section -->
      <div class="top-cards-row">
        <!-- Card 1: Header Info -->
        <div class="info-card">
          <h1 class="page-title">Authorization List</h1>
          <p class="page-subtitle">Manage authorization list for the selected company</p>
        </div>

        <!-- Card 2: Drag & Drop -->
        <div class="dad-card">
          <div class="dad-content" 
               [class.drag-active]="isDragActive"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
               
            <input type="file" #fileInput hidden multiple (change)="onFileSelected($event)">
            
            <div class="folder-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 12H26L22 8H8C5.8 8 4 9.8 4 12V36C4 38.2 5.8 40 8 40H40C42.2 40 44 38.2 44 36V16C44 13.8 42.2 12 40 12Z" fill="#FFC107"/>
                <path d="M40 12H26L22 8H8C5.8 8 4 9.8 4 12V16H44V12H40Z" fill="#FFB300"/>
                <path d="M24 22V34M24 22L20 26M24 22L28 26" stroke="#E65100" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="dad-text">Drag & Drop</div>
            <button class="browse-btn" (click)="fileInput.click()">Browse Files</button>
          </div>
          <div class="info-icon">i</div>
        </div>

        <!-- Card 3: FERC Actions -->
        <div class="ferc-card">
          <div class="ferc-buttons">
            <button class="btn btn-orange-ferc" (click)="filingModalMode = 'TEST'">Test >> FERC</button>
            <button class="btn btn-green-ferc" (click)="filingModalMode = 'SUBMISSION'">File >> FERC</button>
          </div>
          <div class="export-icons-row">
            <div class="icon-btn" (click)="downloadXML()" style="cursor: pointer;">
               <svg width="32" height="40" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M4 0C1.79086 0 0 1.79086 0 4V46C0 48.2091 1.79086 50 4 50H36C38.2091 50 40 48.2091 40 46V14L26 0H4Z" fill="#FFB800"/>
                 <path d="M26 0V14H40" fill="#FFA000"/>
               </svg>
            </div>
            <div class="icon-btn">
               <svg width="32" height="40" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M4 0C1.79086 0 0 1.79086 0 4V46C0 48.2091 1.79086 50 4 50H36C38.2091 50 40 48.2091 40 46V14L26 0H4Z" fill="#E31A1A"/>
                 <path d="M26 0V14H40" fill="#C00"/>
               </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="main-content-card">
        <!-- Error State -->
        <div class="alert alert-error" *ngIf="errorMessage" style="margin: 20px; padding: 15px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
          <button style="margin-left: 10px; padding: 5px 10px; background: #c00; color: white; border: none; border-radius: 3px; cursor: pointer;" (click)="loadAuthorizations()">Retry</button>
        </div>

        <!-- Actions & description area -->
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
             <button class="btn btn-blue-copy" (click)="openModal('COPY_DATA')">Copy Data (All Screens)</button>
             <button class="btn btn-salmon-import">Import/Update Data from FERC</button>
             <button class="btn btn-darkred-import">Import only Authorization</button>
             <button class="btn btn-navy-add" (click)="openModal('ADD_AUTH')">+ Add</button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- Table -->
        <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="7"></app-skeleton-loader>
        <table class="entities-table" *ngIf="!isLoading">
            <thead>
              <tr>
                <th class="col-check">
                  <label class="checkbox-container header-label">
                    <input type="checkbox" [checked]="isAllSelectedTable" (change)="toggleAllTable($event)">
                    <span class="checkmark"></span>
                    <span class="label-text">All</span>
                  </label>
                </th>
                <th class="col-sl">SL</th>
                <th class="col-auth-id">
                  <div class="header-cell">
                    Authorization ID
                    <!-- Filter SVG/Button logic... simplified for view -->
                  </div>
                </th>
                <th class="col-type">
                  <div class="header-cell">Type</div>
                </th>
                <th class="col-status">
                   <div class="header-cell">Status</div>
                </th>
                <th class="col-date">
                   <div class="header-cell">Date</div>
                </th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredData; let i = index">
                <td class="col-check">
                  <label class="checkbox-container">
                    <input type="checkbox" [(ngModel)]="item.selected">
                    <span class="checkmark"></span>
                  </label>
                </td>
                <td class="col-sl">{{ i + 1 }}</td>
                <td class="col-auth-id">{{ item.authId }}</td>
                <td class="col-type">{{ item.type }}</td>
                <td class="col-status">{{ item.status }}</td>
                <td class="col-date">{{ item.date }}</td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button class="action-btn edit" (click)="onEdit(item)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn delete">
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
          <div class="modal-content" [class.wide]="modalMode === 'COPY_DATA' || modalMode === 'ADD_AUTH'" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-titles">
                <span class="sub-title" *ngIf="modalMode === 'ADD_AUTH'">MBRDB >> Add Auth</span>
                <span class="sub-title" *ngIf="modalMode === 'EDIT_AUTH'">MBRDB >> Edit Auth</span>
                <span class="sub-title" *ngIf="modalMode === 'COPY_DATA'">MBRDB >>Copy Data To Selected Company</span>
                <h2 class="main-title">
                  {{ modalMode === 'COPY_DATA' ? 'Copy Data To Selected Company' : 
                     (modalMode === 'ADD_AUTH' ? 'Authorization Add' : (modalMode === 'EDIT_AUTH' ? 'Authorization Edit' : 'Authorization')) }}
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
                     <input type="text" class="form-control">
                   </div>
                   <div class="form-group">
                     <label>Select Company To Copy: <span class="req">*</span></label>
                     <select class="form-control">
                       <option>--Select Company--</option>
                     </select>
                   </div>
                 </div>

                 <div class="copy-matrix">
                   <div class="matrix-header">
                     <div class="col-main">
                        <span class="matrix-label">Select/Unselect ALL:</span>
                        <label class="custom-checkbox white">
                          <input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)">
                          <span class="checkmark"></span>
                        </label>
                     </div>
                     <div class="col-opt">Copy All Records</div>
                     <div class="col-opt">Copy Only Selected Records</div>
                   </div>
                   
                   <div class="matrix-row" *ngFor="let opt of copyOptions; let i = index">
                     <div class="col-main">
                       <span class="row-label">{{ opt.label }}</span>
                       <label class="custom-checkbox">
                          <input type="checkbox" [(ngModel)]="opt.selected" (change)="checkIfAllSelected()">
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

              <!-- Add/Edit Auth Form -->
              <ng-container *ngIf="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">
                <div class="add-auth-form">
                  <div class="form-field">
                    <label>Auth Docker:*</label>
                    <input type="text" class="auth-offset-input" [class.error]="authFormErrors.authDocker" [(ngModel)]="authForm.authDocker" (input)="authFormErrors.authDocker = false">
                    <span class="error-indicator" *ngIf="authFormErrors.authDocker">This field is required</span>
                  </div>
                  <div class="form-field">
                    <label>Auth Effective Date:*</label>
                    <input type="date" class="auth-offset-input" [class.error]="authFormErrors.authEffectiveDate" [(ngModel)]="authForm.authEffectiveDate" (input)="authFormErrors.authEffectiveDate = false">
                    <span class="error-indicator" *ngIf="authFormErrors.authEffectiveDate">This field is required</span>
                  </div>
                  <div class="form-field">
                    <label>Cancellation Docker:*</label>
                    <input type="text" class="auth-offset-input" [class.error]="authFormErrors.cancellationDocker" [(ngModel)]="authForm.cancellationDocker" (input)="authFormErrors.cancellationDocker = false">
                    <span class="error-indicator" *ngIf="authFormErrors.cancellationDocker">This field is required</span>
                  </div>
                  <div class="form-field">
                    <label>Cancellation Effective Date:*</label>
                    <input type="date" class="auth-offset-input" [class.error]="authFormErrors.cancellationEffectiveDate" [(ngModel)]="authForm.cancellationEffectiveDate" (input)="authFormErrors.cancellationEffectiveDate = false">
                    <span class="error-indicator" *ngIf="authFormErrors.cancellationEffectiveDate">This field is required</span>
                  </div>
                  <div class="form-field full-width">
                    <label>Record Type:*</label>
                    <div class="select-wrapper">
                      <select class="auth-offset-input" [class.error]="authFormErrors.recordType" [(ngModel)]="authForm.recordType" (input)="authFormErrors.recordType = false">
                         <option value="">--Select--</option>
                         <option>New</option>
                         <option>Existing</option>
                      </select>
                    </div>
                    <span class="error-indicator" *ngIf="authFormErrors.recordType">This field is required</span>
                  </div>
                </div>
              </ng-container>
            </div>

            <div class="modal-footer" [class.center-buttons]="modalMode === 'ADD_AUTH'">
              <!-- Copy Data Buttons -->
              <ng-container *ngIf="modalMode === 'COPY_DATA'">
                <button class="btn-modal btn-submit">Copy Selected Screens</button>
                <button class="btn-modal btn-save">Save</button>
                <button class="btn-modal btn-reset">Reset</button>
              </ng-container>

              <!-- Add/Edit Auth Buttons -->
              <ng-container *ngIf="modalMode === 'ADD_AUTH' || modalMode === 'EDIT_AUTH'">
                <button class="btn-modal btn-submit compact" (click)="saveAuthorization()">{{ modalMode === 'EDIT_AUTH' ? 'Update' : 'Add' }}</button>
                <button class="btn-modal btn-reset compact" (click)="resetForm()">Reset</button>
                <button class="btn-modal btn-cancel compact" (click)="closeModal()">Cancel</button>
              </ng-container>
            </div>
          </div>
        </div>
      <app-filing-flags-modal [mode]="filingModalMode" (closed)="filingModalMode = null"></app-filing-flags-modal>
    </div>
  `,
  styleUrls: ['./entities-page.component.scss']
})
export class EntitiesPageComponent implements OnInit {
  modalMode: 'COPY_DATA' | 'ADD_AUTH' | 'EDIT_AUTH' | null = null;
  activeFilter: string | null = null;
  filters = {
    authId: '',
    type: '',
    status: '',
    date: ''
  };
  
  
  isLoading = false;
  errorMessage = '';
  companyId = 1; 

  
  authForm = {
    authDocker: '',
    authEffectiveDate: '',
    cancellationDocker: '',
    cancellationEffectiveDate: '',
    recordType: 'New'
  };

  authFormErrors = {
    authDocker: false,
    authEffectiveDate: false,
    cancellationDocker: false,
    cancellationEffectiveDate: false,
    recordType: false
  };

  editingMBRAuthId: number | null = null

  filingModalMode: 'TEST' | 'SUBMISSION' | null = null;

  copyOptions = [
    { label: 'Copy MBR Category Status:*', selected: true, mode: 'ALL' },
    { label: 'Copy MBR Operating Reserves:*', selected: true, mode: 'ALL' },
    { label: 'Copy MBR Self Limitation:*', selected: true, mode: 'ALL' },
    { label: 'Copy Entities to Entities:*', selected: true, mode: 'ALL' },
    { label: 'Copy Entities to Gen Assets:*', selected: true, mode: 'ALL' },
    { label: 'Copy Entities to PPA\'s:*', selected: true, mode: 'ALL' },
    { label: 'Copy Entities to Vertical Assets:*', selected: true, mode: 'ALL' },
    { label: 'Copy Indicative PSS:*', selected: true, mode: 'ALL' },
    { label: 'Copy Indicative MSS:*', selected: true, mode: 'ALL' }
  ];

  get isAllSelected(): boolean {
    return this.copyOptions.every(opt => opt.selected);
  }

  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.copyOptions.forEach(opt => opt.selected = isChecked);
  }

  checkIfAllSelected() {
    
  }

  openModal(mode: 'COPY_DATA' | 'ADD_AUTH' | 'EDIT_AUTH') {
    this.modalMode = mode;
    
    if (mode === 'ADD_AUTH') {
      this.authFormErrors = {
        authDocker: false,
        authEffectiveDate: false,
        cancellationDocker: false,
        cancellationEffectiveDate: false,
        recordType: false
      };
    }
  }

  authorizations: any[] = [];

  get filteredData() {
    return this.authorizations.filter(item => {
      const authMatch = !this.filters.authId || item.authId?.toLowerCase().includes(this.filters.authId.toLowerCase());
      const typeMatch = !this.filters.type || item.type?.toLowerCase().includes(this.filters.type.toLowerCase());
      const statusMatch = !this.filters.status || item.status?.toLowerCase().includes(this.filters.status.toLowerCase());
      const dateMatch = !this.filters.date || item.date?.toLowerCase().includes(this.filters.date.toLowerCase());
      return authMatch && typeMatch && statusMatch && dateMatch;
    });
  }

  
  isDragActive = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    console.log('Files selected:', files);
    
    this.toast.info(`${files.length} file(s) selected: ${Array.from(files).map(f => f.name).join(', ')}`);
  }

  toggleFilter(column: string, event: Event) {
    event.stopPropagation();
    this.activeFilter = this.activeFilter === column ? null : column;
  }

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        this.loadAuthorizations();
      }
    });
  }

  loadAuthorizations() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getMBRAuthListByCID(this.companyId).subscribe({
      next: (data) => {
        console.log('MBRAuth data loaded:', data);
        const records = this.extractRecords(data);
        this.authorizations = records.map(r => this.normalizeEntity(r));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading MBR authorizations:', error);
        this.errorMessage = 'Failed to load authorization list. Please try again.';
        this.isLoading = false;
        this.authorizations = [];
      }
    });
  }

  downloadXML() {
    if (!this.companyId) {
      this.toast.show('No company selected', 'error');
      return;
    }
    this.apiService.getEntityDataForXML(this.companyId).subscribe({
      next: (xmlData: string) => {
        const blob = new Blob([xmlData], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entity_data_${this.companyId}.xml`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast.show('XML file downloaded successfully', 'success');
      },
      error: (error: any) => {
        console.error('Error downloading XML:', error);
        this.toast.show('Failed to download XML file', 'error');
      }
    });
  }

  private extractRecords(apiData: any): any[] {
    if (!apiData) { return []; }

    
    if (Array.isArray(apiData)) {
      const tableWithRows = apiData.find(t => t && Array.isArray(t.rows) && t.rows.length > 0);
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

  private normalizeEntity(record: any): any {
    return {
      authId: record.authorization_docket_number ?? record.mbr_authorization_id ?? record.authId ?? record.mbrauthid ?? 'N/A',
      type: record.type ?? record.Type ?? record.entityType ?? 'Market-Based Rate',
      status: record.isActive ? 'Active' : 'Inactive',
      date: this.dateFormatter.formatToDisplay(record.authorization_effective_date ?? record.active_date ?? record.effectiveDate ?? new Date()),
      mbrauthid: record.mbrauthid ?? record.MBRAuthId ?? 0,
      pid: record.pid ?? record.Pid ?? record.PID ?? 0,
      gid: record.gid ?? record.Gid ?? record.GID ?? 0,
      selected: !!record.IncInFiling || false,
      raw: record 
    };
  }

  
  get isAllSelectedTable(): boolean {
    return this.authorizations && this.authorizations.length > 0 && this.authorizations.every(a => a.selected);
  }

  toggleAllTable(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.authorizations) { return; }
    this.authorizations.forEach(a => a.selected = isChecked);
  }

  private toIsoDateTime(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    } catch (e) { return null; }
  }

  saveAuthorization() {
    
    const errors: string[] = [];

    
    this.authFormErrors = {
      authDocker: false,
      authEffectiveDate: false,
      cancellationDocker: false,
      cancellationEffectiveDate: false,
      recordType: false
    };

    if (!this.authForm.authDocker || this.authForm.authDocker.trim() === '') {
      errors.push('Auth Docker');
      this.authFormErrors.authDocker = true;
    }
    if (!this.authForm.authEffectiveDate || this.authForm.authEffectiveDate.trim() === '') {
      errors.push('Auth Effective Date');
      this.authFormErrors.authEffectiveDate = true;
    }
    if (!this.authForm.cancellationDocker || this.authForm.cancellationDocker.trim() === '') {
      errors.push('Cancellation Docker');
      this.authFormErrors.cancellationDocker = true;
    }
    if (!this.authForm.cancellationEffectiveDate || this.authForm.cancellationEffectiveDate.trim() === '') {
      errors.push('Cancellation Effective Date');
      this.authFormErrors.cancellationEffectiveDate = true;
    }
    if (!this.authForm.recordType || this.authForm.recordType.trim() === '') {
      errors.push('Record Type');
      this.authFormErrors.recordType = true;
    }

    
    if (errors.length > 0) {
      const missingFields = errors.join(', ');
      this.toast.error(`Please fill in all required fields: ${missingFields}`);
      return;
    }

    this.isLoading = true;

    let uid: number | null = null;
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
      uid = cu?.uid ?? cu?.Uid ?? cu?.UID ?? cu?.id ?? cu?.userID ?? null;
    } catch (e) { uid = null; }

    const authData: any = {
      record_type_fk: null,
      record_type_cd: this.authForm.recordType === 'New' ? 'New' : 'Update',
      mbrauthid: (this.modalMode === 'EDIT_AUTH' && this.editingMBRAuthId) ? this.editingMBRAuthId : 0,
      mbr_authorization_id: null,
      cid: this.companyId,
      authorization_docket_number: this.authForm.authDocker || null,
      authorization_effective_date: this.toIsoDateTime(this.authForm.authEffectiveDate) || null,
      cancellation_docket_number: this.authForm.cancellationDocker || null,
      cancellation_effective_date: this.toIsoDateTime(this.authForm.cancellationEffectiveDate) || null,
      active_date: null,
      inactive_date: null,
      mbr_submission_fk: null,
      reference_id: null,
      reporting_entity_cid_cd: null,
      uid: uid,
      updated_record_id: null,
      isActive: true
    };

    this.apiService.insUpdMBRAuthDataUIWithResponse(authData).subscribe({
      next: (result) => {
        console.log('Authorization saved:', result);
        if ([200, 201, 204].includes(result.status)) {
          this.toast.success('Authorization saved successfully!');
          this.closeModal();
          this.loadAuthorizations();
          this.resetForm();
        } else {
          this.toast.warning('Saved but received unexpected status: ' + result.status);
        }
      },
      error: (error) => {
        console.error('Error saving authorization:', error);
        this.toast.error('Failed to save authorization. Please try again.');
        this.isLoading = false;
      }
    });
  }

  async deleteAuthorization(pid: number, gid: number) {
    if (!await this.confirmService.show('Are you sure you want to delete this authorization?', 'Confirm Delete', 'Delete', 'Cancel')) {
      return;
    }

    this.isLoading = true;
    this.apiService.deleteMBRAuthByID(pid, gid).subscribe({
      next: () => {
        this.toast.success('Authorization deleted successfully!');
        this.loadAuthorizations();
      },
      error: (error) => {
        console.error('Error deleting authorization:', error);
        this.toast.error('Failed to delete authorization. Please try again.');
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.authForm = {
      authDocker: '',
      authEffectiveDate: '',
      cancellationDocker: '',
      cancellationEffectiveDate: '',
      recordType: 'New'
    };
    this.authFormErrors = {
      authDocker: false,
      authEffectiveDate: false,
      cancellationDocker: false,
      cancellationEffectiveDate: false,
      recordType: false
    };
    this.editingMBRAuthId = null;
  }

  closeModal() { this.modalMode = null; this.resetForm(); }

  onEdit(item: any) {
    const r = item.raw ?? item;
    const toDateInput = (d: any) => this.dateFormatter.formatToInputDate(d);

    this.authForm.authDocker = r.authorization_docket_number ?? r.authorization_docket ?? item.authId ?? '';
    this.authForm.authEffectiveDate = toDateInput(r.authorization_effective_date1 ?? r.authorization_effective_date);
    this.authForm.cancellationDocker = r.cancellation_docket_number ?? '';
    this.authForm.cancellationEffectiveDate = toDateInput(r.cancellation_effective_date1 ?? r.cancellation_effective_date);
    this.authForm.recordType = (r.record_type_cd && r.record_type_cd.toLowerCase() === 'new') ? 'New' : 'Update';
    this.editingMBRAuthId = r.mbrauthid ?? r.MBRAuthId ?? item.mbrauthid ?? 0;

    this.modalMode = 'EDIT_AUTH';
  }
}
