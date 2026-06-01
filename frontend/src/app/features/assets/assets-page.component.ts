import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../shared/services/confirm.service';
import { AddAssetComponent } from './add-asset.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { CompanyContextService } from '../../core/services/company-context.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import JSZip from 'jszip';

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [CommonModule, AddAssetComponent, FormsModule, SanitizeInputDirective, SkeletonLoaderComponent],
  template: `
    <div class="page-container">
      <div class="assets-page-layout">
        
        <!-- Top Section -->
        <div class="top-grid">
          <div class="card title-card">
            <h1 class="card-title">Assets List</h1>
          </div>

          <div class="card upload-card" 
               [class.dragging]="isDragging"
               (dragover)="onDragOver($event)" 
               (dragleave)="onDragLeave($event)" 
               (drop)="onDrop($event)">
            <div class="info-icon" title="Upload XML or CSV files for processing">i</div>
            <div class="drop-zone">
              <div class="drop-content">
                <div class="upload-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 12V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V12" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 8L12 5L15 8" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="drop-text">{{ droppedFileName || 'Drag & Drop' }}</span>
              </div>
              <button class="btn-browse" (click)="fileInput.click()">{{ droppedFileName ? 'Change File' : 'Browse Files' }}</button>
              <input type="file" #fileInput accept=".xlsx" style="display: none" (change)="onFileSelected($event)">
            </div>
          </div>
        </div>

        <!-- Main Assets Card -->
        <div class="card">
          <div class="assets-header">
            <div class="legend">
              <span>Legend:</span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#47548C" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E31A1A" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete
              </span>
            </div>

            <div class="header-actions">
              <div class="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Global Search..." [(ngModel)]="searchTerm">
              </div>
              <button class="btn btn-xml" (click)="downloadXML()">XML</button>
              <button class="btn btn-add" (click)="openAdd()">Add Asset</button>
            </div>
          </div>

          <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="6" [columns]="8"></app-skeleton-loader>

          <div class="table-container" *ngIf="!isLoading">
            <table class="assets-table">
              <thead>
                <tr>
                  <th class="checkbox-cell">
                    <label class="checkbox-container">
                      <input type="checkbox" [checked]="isAllSelected" (change)="toggleAll($event)">
                      <span class="checkmark"></span>
                      <span class="label-text">All</span>
                    </label>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Asset Id</span>
                      <button class="filter-toggle" (click)="toggleFilter('id', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'id'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter ID..." [(ngModel)]="filterId" autofocus>
                        <button class="clear-btn" (click)="filterId = ''; activeFilter = null" *ngIf="filterId">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Gen Code</span>
                      <button class="filter-toggle" (click)="toggleFilter('genCode', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'genCode'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Code..." [(ngModel)]="filterGenCode" autofocus>
                        <button class="clear-btn" (click)="filterGenCode = ''; activeFilter = null" *ngIf="filterGenCode">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Generator Name</span>
                      <button class="filter-toggle" (click)="toggleFilter('name', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'name'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Generator Name..." [(ngModel)]="filterGeneratorName" autofocus>
                        <button class="clear-btn" (click)="filterGeneratorName = ''; activeFilter = null" *ngIf="filterGeneratorName">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">State</span>
                      <button class="filter-toggle" (click)="toggleFilter('state', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'state'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter State..." [(ngModel)]="filterState" autofocus>
                        <button class="clear-btn" (click)="filterState = ''; activeFilter = null" *ngIf="filterState">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Country</span>
                      <button class="filter-toggle" (click)="toggleFilter('country', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'country'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Country..." [(ngModel)]="filterCountry" autofocus>
                        <button class="clear-btn" (click)="filterCountry = ''; activeFilter = null" *ngIf="filterCountry">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Capacity</span>
                      <button class="filter-toggle" (click)="toggleFilter('capacity', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'capacity'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Capacity..." [(ngModel)]="filterCapacity" autofocus>
                        <button class="clear-btn" (click)="filterCapacity = ''; activeFilter = null" *ngIf="filterCapacity">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Month</span>
                      <button class="filter-toggle" (click)="toggleFilter('month', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'month'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Month..." [(ngModel)]="filterMonth" autofocus>
                        <button class="clear-btn" (click)="filterMonth = ''; activeFilter = null" *ngIf="filterMonth">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Year</span>
                      <button class="filter-toggle" (click)="toggleFilter('year', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'year'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Year..." [(ngModel)]="filterYear" autofocus>
                        <button class="clear-btn" (click)="filterYear = ''; activeFilter = null" *ngIf="filterYear">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Individual</span>
                      <button class="filter-toggle" (click)="toggleFilter('individual', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'individual'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Individual..." [(ngModel)]="filterIndividual" autofocus>
                        <button class="clear-btn" (click)="filterIndividual = ''; activeFilter = null" *ngIf="filterIndividual">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>
                    <div class="header-container">
                      <span class="label">Active Date</span>
                      <button class="filter-toggle" (click)="toggleFilter('date', $event)">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                      <div class="filter-dropdown" *ngIf="activeFilter === 'date'" (click)="$event.stopPropagation()">
                        <input type="text" class="column-filter" placeholder="Filter Active Date..." [(ngModel)]="filterActiveDate" autofocus>
                        <button class="clear-btn" (click)="filterActiveDate = ''; activeFilter = null" *ngIf="filterActiveDate">Clear</button>
                      </div>
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let asset of filteredAssets">
                  <td class="checkbox-cell">
                    <label class="checkbox-container">
                      <input type="checkbox" [(ngModel)]="asset.selected" (change)="onCheckboxChange(asset)">
                      <span class="checkmark"></span>
                    </label>
                  </td>
                  <td>{{asset.id}}</td>
                  <td>{{asset.genCode}}</td>
                  <td>{{asset.name}}</td>
                  <td>{{asset.state}}</td>
                  <td>{{asset.country}}</td>
                  <td>{{asset.capacity}}</td>
                  <td>{{asset.opMonth}}</td>
                  <td>{{asset.opYear}}</td>
                  <td>{{asset.individual}}</td>
                  <td>{{asset.date}}</td>
                  <td class="action-cell">
                    <div class="row-actions">
                      <button class="edit-btn" (click)="onEditAsset(asset)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="delete-btn" (click)="onDeleteAsset(asset)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Add Asset Popup -->
    <app-add-asset [(open)]="isAddOpen" [editData]="selectedAsset" (saveEvent)="onSaveAsset($event)"></app-add-asset>
  `,
  styleUrls: ['./assets-page.component.scss']
})
export class AssetsPageComponent implements OnInit {
  isAddOpen = false;
  selectedAsset: any = null;
  isDragging = false;
  droppedFileName: string | null = null;

  // Filters
  searchTerm = '';
  filterId = '';
  filterGenCode = '';
  filterGeneratorName = '';
  filterState = '';
  filterCountry = '';
  filterCapacity = '';
  filterMonth = '';
  filterYear = '';
  filterIndividual = '';
  filterActiveDate = '';
  activeFilter: string | null = null;

  // Loading & data
  isLoading = false;
  errorMessage = '';
  companyId = 1;
  uid = 1;

  assets: any[] = [];

  get filteredAssets() {
    return this.assets.filter(asset => {
      const globalMatch = !this.searchTerm || Object.values(asset).some(v =>
        String(v).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      const idMatch = !this.filterId || String(asset.id).toLowerCase().includes(this.filterId.toLowerCase());
      const genCodeMatch = !this.filterGenCode || String(asset.genCode).toLowerCase().includes(this.filterGenCode.toLowerCase());
      const nameMatch = !this.filterGeneratorName || String(asset.name).toLowerCase().includes(this.filterGeneratorName.toLowerCase());
      const stateMatch = !this.filterState || String(asset.state).toLowerCase().includes(this.filterState.toLowerCase());
      const countryMatch = !this.filterCountry || String(asset.country).toLowerCase().includes(this.filterCountry.toLowerCase());
      const capacityMatch = !this.filterCapacity || String(asset.capacity).toLowerCase().includes(this.filterCapacity.toLowerCase());
      const monthMatch = !this.filterMonth || String(asset.opMonth).toLowerCase().includes(this.filterMonth.toLowerCase());
      const yearMatch = !this.filterYear || String(asset.opYear).toLowerCase().includes(this.filterYear.toLowerCase());
      const individualMatch = !this.filterIndividual || String(asset.individual).toLowerCase().includes(this.filterIndividual.toLowerCase());
      const dateMatch = !this.filterActiveDate || String(asset.date).toLowerCase().includes(this.filterActiveDate.toLowerCase());

      return globalMatch && idMatch && genCodeMatch && nameMatch && stateMatch && countryMatch && capacityMatch && monthMatch && yearMatch && individualMatch && dateMatch;
    });
  }

  openAdd() {
    this.selectedAsset = null;
    this.isAddOpen = true;
  }

  onEditAsset(asset: any) {
    this.selectedAsset = asset;
    this.isAddOpen = true;
  }

  onSaveAsset(assetData: any) {
    const payload = {
      uid: this.uid,
      cid: this.companyId,
      assetid: assetData.assetid || 0,
      gen_code: assetData.genCode,
      gen_name: assetData.genName,
      country: assetData.country,
      state: assetData.state,
      nameplate_capacity_mw: assetData.capacity?.toString(),
      operating_month: parseInt(assetData.opMonth),
      operating_year: parseInt(assetData.opYear),
      active_Date: new Date().toISOString()
    };

    console.log('Saving Asset Payload:', payload);

    this.apiService.insUpdAsset(payload).subscribe({
      next: (res) => {
        console.log('Asset saved successfully:', res);
        this.loadAssets();
      },
      error: (err) => {
        console.error('Error saving asset:', err);
        this.toast.error('Failed to save asset. Check console for details.');
      }
    });
  }

  async onDeleteAsset(asset: any) {
    if (await this.confirmService.show(`Are you sure you want to delete asset ${asset.name}?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      this.isLoading = true;
      const assetId = asset.id || asset.assetid;
      
      // gid = user's gid from login
      let gid = 0;
      try {
        const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
        gid = cu?.gid ?? cu?.Gid ?? cu?.GID ?? 0;
      } catch (e) { gid = 0; }
      
      this.apiService.deleteAssetByID(assetId, gid).subscribe({
        next: (res) => {
          console.log('Asset deleted successfully:', res);
          this.toast.success('Asset deleted successfully');
          this.loadAssets();
        },
        error: (err) => {
          console.error('Error deleting asset:', err);
          this.toast.error('Failed to delete asset. Check console for details.');
          this.isLoading = false;
        }
      });
    }
  }

  onAssetAdded(asset: any) {
    // Keep this for legacy if needed or remove
    this.loadAssets();
  }

  toggleFilter(column: string, event: Event) {
    event.stopPropagation();
    if (this.activeFilter === column) {
      this.activeFilter = null;
    } else {
      this.activeFilter = column;
    }
  }

  // Global click listener to close filters
  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService, private dateFormatter: DateFormatterService, private confirmService: ConfirmService) {
    window.addEventListener('click', () => {
      this.activeFilter = null;
    });
  }

  ngOnInit() {
    this.extractUid();
    this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
        this.loadAssets();
      }
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

  loadAssets() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAssetsListByCID(this.companyId).subscribe({
      next: (data) => {
        // unwrap dataset responses
        let records: any[] = [];
        if (Array.isArray(data)) {
          const t = data.find((x: any) => x && Array.isArray(x.rows) && x.rows.length > 0);
          records = t ? t.rows : data;
        } else if (data && Array.isArray(data.rows)) {
          records = data.rows;
        } else if (Array.isArray(data)) {
          records = data;
        }

        this.assets = records.map((r: any, idx: number) => this.normalizeAsset(r, idx + 1));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading assets:', err);
        this.errorMessage = 'Failed to load assets. Showing sample data.';
        this.isLoading = false;
        // fallback to minimal mock
        this.assets = [
          { id: '15513', genCode: 'Heritage', name: 'Heritage Solar Farm', state: 'AZ', country: 'United States', capacity: '50.0000', opMonth: '1', opYear: '2025', individual: '', date: '12/18/2025' }
        ];
      }
    });
  }

  private normalizeAsset(r: any, index: number) {
    // map common API fields to UI - using actual API field names from GetListByCID
    return {
      id: r.assetid ?? r.assetId ?? r.assetID ?? r.id ?? String(index),
      genCode: r.gen_code ?? r.genCode ?? r.ferc_asset_Gen_code ?? '',
      name: r.Gen_name ?? r.gen_name ?? r.name ?? r.generationName ?? '',
      state: r.State ?? r.state ?? r.state_code ?? r.state_cd ?? '',
      country: r.Country ?? r.country ?? '',
      capacity: r.nameplate_capacity_mw ?? r.capacity ?? r.nameplate_capacity ?? '',
      opMonth: r.operating_month ?? r.opMonth ?? r.month ?? '',
      opYear: r.operating_year ?? r.opYear ?? r.year ?? '',
      individual: r.Individual_fk ?? r.individual ?? '',
      date: this.dateFormatter.formatToDisplay(r.Active_Date ?? r.active_date ?? r.active_date1 ?? r.createdDate ?? ''),
      selected: !!r.IncInFiling || false,
      raw: r
    };
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.toast.show('Only .xlsx files are allowed', 'error');
      return;
    }

    this.droppedFileName = file.name;
    console.log('Uploading file:', file.name, 'Size:', file.size);
    
    const companyId = this.companyId.toString();
    this.apiService.importAssetsFromExcel(this.companyId, file, companyId).subscribe({
      next: (response: any) => {
        this.toast.show('Assets imported successfully', 'success');
        this.droppedFileName = '';
        this.loadAssets();
      },
      error: (err: any) => {
        console.error('Error uploading assets:', err);
        this.toast.show('Failed to import assets', 'error');
        this.droppedFileName = '';
      }
    });
  }

  get isAllSelected(): boolean {
    return this.filteredAssets.length > 0 && this.filteredAssets.every(asset => asset.selected);
  }

  toggleAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.filteredAssets.forEach(asset => asset.selected = isChecked);
    this.apiService.updateIncInFilingFlagAll(this.companyId, {
      table: 'tblAsset', tableId: 'assetid', value: isChecked ? '1' : '0'
    }).subscribe({ error: (err: any) => console.error('Error updating all filing flags:', err) });
  }

  onCheckboxChange(asset: any) {
    const assetId = asset.raw?.assetid ?? asset.assetid ?? asset.id ?? '';
    this.apiService.updateIncInFilingFlag(this.companyId, {
      table: 'tblAsset', tableId: 'assetid', value: asset.selected ? '1' : '0', whereIds: String(assetId)
    }).subscribe({ error: (err: any) => console.error('Error updating filing flag:', err) });
  }

  downloadXML() {
    // Get comma-separated asset IDs for all locally checked assets
    const selectedAssetIds = this.filteredAssets
      .filter(a => a.selected)
      .map(a => a.id)
      .join(',');

    if (!selectedAssetIds) {
      this.toast.warning('Please select at least one asset to export as XML.');
      return;
    }

    this.isLoading = true;
    this.apiService.getAssetDataForXML(this.companyId, selectedAssetIds).subscribe({
      next: (xmlStr: string) => {
        // Compress XML into ZIP file
        this.compressAndDownloadXML(xmlStr);
      },
      error: (err) => {
        console.error('Download XML error:', err);
        this.toast.error('Failed to download XML. Check console for details.');
        this.isLoading = false;
      }
    });
  }

  private async compressAndDownloadXML(xmlStr: string) {
    try {
      const zip = new JSZip();
      
      // Add XML file to the ZIP
      const fileName = `assets_export_${this.companyId}.xml`;
      zip.file(fileName, xmlStr);
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the ZIP file
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_export_${this.companyId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.isLoading = false;
      this.toast.success('XML compressed and downloaded successfully.');
    } catch (err) {
      console.error('Error compressing XML:', err);
      this.toast.error('Failed to compress XML. Check console for details.');
      this.isLoading = false;
    }
  }
}
