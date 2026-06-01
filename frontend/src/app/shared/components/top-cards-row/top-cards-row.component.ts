import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { ToastService } from '../../services/toast.service';
import { DateFormatterService } from '../../../core/services/date-formatter.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-top-cards-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-cards-row">
      <!-- Card 1: Header Info -->
      <div class="info-card">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>

      <!-- Card 2: Drag & Drop -->
      <div class="dad-card">
        <div class="dad-content"
             [class.drag-active]="isDragActive"
             [class.uploading]="isUploading"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)">

          <input type="file" #fileInput hidden accept=".xlsx,.xls" (change)="onFileSelected($event)">

          <ng-container *ngIf="!isUploading && !uploadedFileName">
            <div class="folder-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 12H26L22 8H8C5.8 8 4 9.8 4 12V36C4 38.2 5.8 40 8 40H40C42.2 40 44 38.2 44 36V16C44 13.8 42.2 12 40 12Z" fill="#FFC107"/>
                <path d="M40 12H26L22 8H8C5.8 8 4 9.8 4 12V16H44V12H40Z" fill="#FFB300"/>
                <path d="M24 22V34M24 22L20 26M24 22L28 26" stroke="#E65100" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="dad-text">Drag & Drop</div>
            <button class="browse-btn" (click)="fileInput.click()">Browse Files</button>
          </ng-container>

          <ng-container *ngIf="isUploading">
            <div class="upload-spinner"></div>
            <div class="dad-text">Uploading...</div>
            <div class="upload-filename">{{ uploadedFileName }}</div>
          </ng-container>

          <ng-container *ngIf="!isUploading && uploadedFileName">
            <div class="upload-success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38A169" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="dad-text" style="color: #38A169;">Import Complete!</div>
            <div class="upload-filename">{{ uploadedFileName }}</div>
            <button class="browse-btn" style="margin-top: 4px;" (click)="resetUpload(); fileInput.click()">Upload Another</button>
          </ng-container>
        </div>
        <div class="info-icon">i</div>
      </div>

      <!-- Card 3: FERC Actions -->
      <div class="ferc-card">
        <div class="ferc-buttons">
          <button class="btn btn-orange-ferc" (click)="testFerc.emit()">Test >> FERC</button>
          <button class="btn btn-green-ferc" (click)="submitFerc.emit()">File >> FERC</button>
        </div>
        <div class="export-icons-row">
          <div class="icon-btn" (click)="downloadXML()">
            <svg width="32" height="40" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0C1.79086 0 0 1.79086 0 4V46C0 48.2091 1.79086 50 4 50H36C38.2091 50 40 48.2091 40 46V14L26 0H4Z" fill="#FFB800"/>
              <path d="M26 0L40 14H30C27.7909 14 26 12.2091 26 10V0Z" fill="#FFD54F"/>
            </svg>
          </div>
          <div class="icon-btn" (click)="downloadPDF()">
            <svg width="32" height="40" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0C1.79086 0 0 1.79086 0 4V46C0 48.2091 1.79086 50 4 50H36C38.2091 50 40 48.2091 40 46V14L26 0H4Z" fill="#E31A1A"/>
              <path d="M26 0L40 14H30C27.7909 14 26 12.2091 26 10V0Z" fill="#FF5252"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./top-cards-row.component.scss']
})
export class TopCardsRowComponent {
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';

  @Output() testFerc = new EventEmitter<void>();
  @Output() submitFerc = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<FileList>();
  @Output() exportXml = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() importComplete = new EventEmitter<any>();

  isDragActive = false;
  isUploading = false;
  uploadedFileName = '';
  private companyCid = 0;
  private companyStringId = '';

  constructor(private apiService: ApiService, private companyContext: CompanyContextService, private toast: ToastService, private dateFormatter: DateFormatterService) {
    this.companyContext.currentCompany$.subscribe(company => {
      if (company) {
        this.companyCid = company.cid || 0;
        this.companyStringId = company.company_id || '';
      }
    });
  }

  resetUpload() {
    this.uploadedFileName = '';
  }

  private uploadFile(file: File) {
    if (!this.companyCid) {
      this.toast.show('No company selected. Please select a company first.', 'error');
      return;
    }

    const validExtensions = ['.xlsx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      this.toast.show('Invalid file type. Please upload an Excel file (.xlsx)', 'error');
      return;
    }

    this.isUploading = true;
    this.uploadedFileName = file.name;

    this.apiService.importEntitiesFromExcel(this.companyCid, file, this.companyStringId).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        this.toast.show('File imported successfully! Data has been updated.', 'success');
        this.importComplete.emit(response);
      },
      error: (err: any) => {
        console.error('Error importing file:', err);
        this.isUploading = false;
        this.uploadedFileName = '';
        
        let errorMsg = 'Failed to import file. Please check the file format and try again.';
        if (err && err.error && typeof err.error === 'object') {
            errorMsg += '\nDetails: ' + JSON.stringify(err.error);
        } else if (err && err.message) {
            errorMsg += '\nDetails: ' + err.message;
        }
        
        this.toast.show(errorMsg, 'error');
      }
    });
  }

  downloadXML() {
    if (!this.companyCid) {
      this.toast.show('No company selected', 'error');
      return;
    }
    this.apiService.getEntityDataForXML(this.companyCid).subscribe({
      next: (xmlData: string) => {
        const blob = new Blob([xmlData], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entity_data_${this.companyCid}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        this.toast.show('XML file downloaded successfully', 'success');
      },
      error: (error: any) => {
        console.error('Error downloading XML:', error);
        this.toast.show('Failed to download XML file', 'error');
      }
    });
  }

  downloadPDF() {
    if (!this.companyCid) {
      this.toast.show('No company selected', 'error');
      return;
    }
    this.apiService.getEntityDataForPDFByCID(this.companyCid).subscribe({
      next: (apiData: any) => {
        try {
          const doc = new jsPDF('landscape', 'mm', 'a4');
          const pageWidth = doc.internal.pageSize.getWidth();

          const screensOrder: [string, string][] = [
            ['Table1', 'Authorization'],
            ['Table2', 'Category Status'],
            ['Table3', 'Mitigations'],
            ['Table4', 'Self Limitations'],
            ['Table5', 'Operating Reserves'],
            ['Table6', 'Entities to Entities'],
            ['Table7', 'Entities to Generator Assets'],
            ['Table8', 'Entities to PPAs'],
            ['Table9', 'Entities to Vertical Assets'],
            ['Table10', 'Operation Reserves'],
            ['Table11', 'Indicative Pivotal Supplier Screen (PSS)'],
            ['Table12', 'Indicative PSS - Additional'],
            ['Table13', 'Indicative Market Share Screen (MSS)'],
          ];

          const companyInfo = apiData.Table?.[0];
          const companyName = companyInfo?.CompanyName || '';
          const companyCID = companyInfo?.CID || this.companyCid;
          const companyEmail = companyInfo?.eRegEmail || '';
          const generatedDate = this.dateFormatter.formatToDisplay(new Date());

          const addPageHeader = (entityName: string) => {
            doc.setFontSize(16);
            doc.setTextColor(43, 54, 116);
            doc.text('MBR Entity Data Report', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.text(`Company: ${companyName}  |  Company ID: ${companyCID}  |  Email: ${companyEmail}`, pageWidth / 2, 22, { align: 'center' });
            doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 27, { align: 'center' });

            doc.setFontSize(13);
            doc.setTextColor(43, 54, 116);
            doc.text(entityName, 10, 36);
          };

          let hasContent = false;
          let isFirstPage = true;

          for (const [tableKey, entityName] of screensOrder) {
            const rows = apiData[tableKey];
            if (!Array.isArray(rows) || rows.length === 0) continue;

            if (!isFirstPage) {
              doc.addPage();
            }
            isFirstPage = false;

            addPageHeader(entityName);

            const columns = Object.keys(rows[0]);
            const verticalBody: any[][] = [];

            rows.forEach((record: any, idx: number) => {
              verticalBody.push([{ content: `Record Number: ${idx + 1}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [43, 54, 116], textColor: 255, fontSize: 8 } }]);

              columns.forEach(col => {
                const val = record[col] != null && record[col] !== '' ? String(record[col]) : '';
                verticalBody.push([col, val]);
              });
            });

            autoTable(doc, {
              body: verticalBody,
              startY: 40,
              styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', lineWidth: 0.3, lineColor: [0, 0, 0] },
              columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 100 },
                1: { cellWidth: 'auto' },
              },
              margin: { left: 10, right: 10, top: 40 },
              tableWidth: 'auto',
              theme: 'grid',
              didDrawPage: (data: any) => {
                if (data.pageNumber > 1) {
                  addPageHeader(entityName);
                }
              },
            });

            hasContent = true;
          }

          if (!hasContent) {
            this.toast.show('No entity data available to export', 'error');
            return;
          }

          doc.save(`entity_data_${companyCID}.pdf`);
          this.toast.show('PDF file downloaded successfully', 'success');
        } catch (e) {
          console.error('Error generating PDF:', e);
          this.toast.show('Failed to generate PDF file', 'error');
        }
      },
      error: (error: any) => {
        console.error('Error downloading PDF data:', error);
        this.toast.show('Failed to download PDF data', 'error');
      }
    });
  }

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
      this.fileSelected.emit(event.dataTransfer.files);
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files);
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }
}
