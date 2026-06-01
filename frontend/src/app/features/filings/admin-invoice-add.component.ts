import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';

@Component({
  selector: 'app-admin-invoice-add',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerOnlyDirective, FormatDatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">eTariff >> Add Invoice</div>
            <h1 class="modal-title">Admin Invoice Add</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="column">
              <div class="form-row">
                <label class="field-label">Company Name:</label>
                <input class="form-control" [(ngModel)]="local.companyName" disabled />
              </div>

              <div class="form-row">
                <label class="field-label">Service Type:</label>
                <select class="form-control" [(ngModel)]="local.serviceType" (change)="generateInvoiceName()">
                  <option value="Filing">Filing</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div class="checkbox-multi-row">
                <div class="row">
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isAnnual"><span></span>Is Annual</label>
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isFilingService"><span></span>Is Filing Service</label>
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isFSPremium"><span></span>Is FS Premium</label>
                </div>
                <div class="row">
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isAnnualInclude"><span></span>Is Annual Include</label>
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isFSInclude"><span></span>Is FS Include</label>
                   <label class="cb-container"><input type="checkbox" [(ngModel)]="local.isAdditionalUsersInclude"><span></span>Is Additional Users Include</label>
                </div>
              </div>

              <div class="form-row price-qty-row">
                <div class="price-field">
                  <label class="field-label">Price:</label>
                  <input class="form-control" type="number" [(ngModel)]="local.price" (input)="calcInvoicePrice()" />
                </div>
                <div class="qty-field">
                  <label class="field-label">Qty:</label>
                  <input class="form-control" type="number" [(ngModel)]="local.qty" (input)="calcInvoicePrice()" />
                </div>
              </div>

              <div class="form-row">
                <label class="field-label">Filing Service Price:</label>
                <input class="form-control" type="number" [(ngModel)]="local.filingServicePrice" (input)="calcInvoicePrice()" />
              </div>

              <div class="form-row">
                <label class="field-label">Additional Users Price:</label>
                <input class="form-control" type="number" [(ngModel)]="local.additionalUsersPrice" (input)="calcInvoicePrice()" />
              </div>

              <div class="form-row highlight">
                <label class="field-label">Invoice Price:</label>
                <input class="form-control" type="number" [(ngModel)]="local.invoicePrice" readonly />
              </div>
            </div>

            <!-- Right Column -->
            <div class="column">
              <div class="form-row">
                <label class="field-label">Size:</label>
                <select class="form-control" [(ngModel)]="local.size">
                  <option value="Pay-per-use">Pay-per-use</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div class="form-row">
                <label class="field-label">Note:</label>
                <input class="form-control" [(ngModel)]="local.note" />
              </div>

              <div class="form-row">
                <label class="field-label">Client Notes:</label>
                <textarea class="form-control" [(ngModel)]="local.clientNotes" rows="2"></textarea>
              </div>

              <div class="form-row">
                <label class="field-label">Client Notes Title:</label>
                <input class="form-control" [(ngModel)]="local.clientNotesTitle" />
              </div>

              <div class="form-row">
                <label class="field-label">Account Group:</label>
                <select class="form-control" [(ngModel)]="local.agid">
                  <option [ngValue]="0">--Select Group--</option>
                  <option *ngFor="let g of groups" [ngValue]="g.agid">{{ g.groupName || 'Unnamed Group' }}</option>
                </select>
              </div>

              <div class="form-row">
                <label class="field-label">Select Filing:</label>
                <select class="form-control" [(ngModel)]="local.filingId">
                  <option [ngValue]="null">--Select Filing--</option>
                  <option *ngFor="let f of filings" [ngValue]="f.fid || f.id">{{ f.fercsubid || f.fercstatus }} - {{ f.filingdate | formatDate }}</option>
                </select>
              </div>

              <div class="form-row">
                <label class="field-label">Invoice Name:</label>
                <input class="form-control" [(ngModel)]="local.invoiceName" />
              </div>

              <div class="form-row">
                <label class="field-label">Invoice Date:</label>
                <input class="form-control" type="date" [(ngModel)]="local.invoiceDate" (change)="generateInvoiceName()" />
              </div>

              <div class="form-row date-row">
                <div class="date-field">
                  <label class="field-label">Month Start Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.monthStartDate" />
                </div>
                <div class="date-field">
                  <label class="field-label">Month End Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.monthEndDate" />
                </div>
              </div>

              <div class="form-row checkbox-group">
                <label class="cb-container">
                  <input type="checkbox" [(ngModel)]="local.isInvoiceSent" />
                  <span></span>
                  Is Invoice Sent
                </label>
                <label class="cb-container">
                  <input type="checkbox" [(ngModel)]="local.isPaymentReceived" />
                  <span></span>
                  Is Payment Received
                </label>
              </div>

              <div class="form-row" *ngIf="local.isPaymentReceived">
                <label class="field-label">Payment Received Date:</label>
                <input class="form-control" type="date" [(ngModel)]="local.paymentReceivedDate" />
              </div>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-modal btn-submit" (click)="doAdd()">{{ isEditMode ? 'Update' : 'Add' }}</button>
          <button class="btn-modal btn-dummy" (click)="fillDummyData()">Dummy Data</button>
          <button class="btn-modal btn-reset" (click)="reset()">Reset</button>
          <button class="btn-modal btn-cancel" (click)="close()">Cancel</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 5000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow-y: auto;
      padding: 40px 20px;
    }
    .modal {
      background: #ffffff;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      animation: modalSlideIn 0.3s ease-out;
    }
    @keyframes modalSlideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      padding: 16px 24px;
      border-bottom: 2px solid #0891b2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .breadcrumb { font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .modal-title { font-size: 24px; font-weight: 500; color: #0369a1; margin: 0; }
    .close-x { font-size: 28px; color: #94a3b8; background: none; border: none; cursor: pointer; line-height: 1; }
    .modal-body { padding: 32px 40px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .column { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: flex; flex-direction: column; gap: 5px; }
    .field-label { font-size: 13px; font-weight: 600; color: #334155; }
    .checkbox-multi-row { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .checkbox-multi-row .row { display: flex; gap: 20px; }
    .cb-container { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; font-weight: 600; color: #475569; position: relative; }
    .cb-container input { opacity: 0; width: 0; height: 0; position: absolute; }
    .cb-container span { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 3px; position: relative; }
    .cb-container input:checked ~ span { background: #0369a1; border-color: #0369a1; }
    .cb-container input:checked ~ span::after { content: ''; position: absolute; left: 4px; top: 1px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .price-qty-row { display: flex; flex-direction: row; gap: 15px; }
    .price-field { flex: 1; }
    .qty-field { width: 90px; }
    .highlight .form-control { border: 2px solid #ef4444; background: #fff1f2; font-weight: 700; color: #991b1b; }
    .modal-footer { padding: 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: center; gap: 12px; background: #f8fafc; }
    .btn-modal { padding: 10px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s, box-shadow 0.2s; }
    .btn-submit { background: #0369a1; color: #fff; border: none; } .btn-submit:hover { background: #0284c7; }
    .btn-reset { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; } .btn-reset:hover { background: #e2e8f0; }
    .btn-dummy { display: none; background: #7c3aed; color: #fff; border: none; } .btn-dummy:hover { background: #6d28d9; }
    .btn-cancel { background: #fff; color: #dc2626; border: 1px solid #fca5a5; } .btn-cancel:hover { background: #fef2f2; }
    .form-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; }
    .form-control:disabled { background: #f1f5f9; cursor: not-allowed; }
  `]
})
export class AdminInvoiceAddComponent implements OnChanges {
  @Input() open = false;
  @Input() company: any;
  @Input() editingInvoice: any = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() addEvent = new EventEmitter<any>();
  @Output() updateEvent = new EventEmitter<any>();

  local: any = {};
  isEditMode = false;
  filings: any[] = [];
  @Input() groups: any[] = [];

  constructor(private apiService: ApiService, private toast: ToastService, private dateFormatter: DateFormatterService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      // Defer by one tick so all input bindings (company, groups etc.) are resolved
      setTimeout(() => {
        if (this.editingInvoice) {
          this.isEditMode = true;
          this.loadEditData();
        } else {
          this.isEditMode = false;
          this.reset();
        }
        this.loadFilings();
        if (!this.groups?.length) this.loadGroups();
      }, 0);
    }
  }

  loadEditData() {
    const inv = this.editingInvoice;
    this.local = {
      invoiceName: inv.invoiceName || inv.InvoiceName || '',
      invoiceDate: this.formatDateForInput(inv.invoiceDate || inv.InvoiceDate),
      monthStartDate: this.formatDateForInput(inv.monthStartDate || inv.MonthStartDate),
      monthEndDate: this.formatDateForInput(inv.monthEndDate || inv.MonthEndDate),
      filingId: inv.fid || inv.FID || 0,
      agid: inv.agid || inv.AGID || 0,
      price: inv.price || inv.Price || 0,
      qty: inv.qty || inv.Qty || 0,
      size: inv.sizeNotes || inv.SizeNotes || '',
      serviceType: inv.serviceName || inv.ServiceName || '',
      clientNotes: inv.clientNotes || inv.ClientNotes || '',
      clientNotesTitle: inv.clientNotesTitle || inv.ClientNotesTitle || '',
      isInvoiceSent: inv.isInvoiceSent || inv.IsInvoiceSent || false,
      isPaymentReceived: inv.paymentReceived || inv.PaymentReceived || false,
      paymentReceivedDate: this.formatDateForInput(inv.paymentDate || inv.PaymentDate),
      isAnnualInclude: inv.isIncludeAnnual || inv.IsIncludeAnnual || false,
      isFSInclude: inv.isIncludeFS || inv.IsIncludeFS || false,
      isAdditionalUsersInclude: inv.isIncludeAdditionalUsers || inv.IsIncludeAdditionalUsers || false
    };
  }

  loadGroups() {
    const aid = this.company?.aid;
    if (!aid) return;
    this.apiService.getAccountGroupsByAIDWithParams(aid, 'accountgroup', 'agid', 'groupname').subscribe({
      next: (res: any) => {
        let rows: any[] = [];
        if (Array.isArray(res)) {
          const table = res.find((t: any) => t && Array.isArray(t.rows));
          rows = table ? table.rows : res;
        } else if (res?.rows) {
          rows = res.rows;
        } else if (res?.data) {
          rows = res.data;
        }
        this.groups = rows
          .filter((g: any) => (g?.value ?? g?.agid ?? g?.id) !== -1)
          .map((g: any) => ({
            agid: g.value ?? g.agid ?? g.AGID ?? g.id,
            groupName: (g.text ?? g.groupName ?? g.GroupName ?? g.groupname ?? g.agName ?? '').trim() || 'Unnamed Group'
          }));
      },
      error: (err) => console.error('Error loading groups:', err)
    });
  }

  loadFilings() {
    if (this.company?.cid) {
      this.apiService.adminGetFilingsForInvoices(this.company.cid).subscribe({
        next: (res: any) => {
          let rows = [];
          if (Array.isArray(res)) {
            const table = res.find((t: any) => t.tableName === 'Table1' || t.tableName === 'Table');
            rows = table ? table.rows : res;
          }
          this.filings = rows || [];
        },
        error: (err) => console.error('Error loading filings:', err)
      });
    }
  }

  reset() {
    let companyName = 'N/A';
    
    // Try multiple ways to get company name
    if (this.company) {
      companyName = this.company?.Title 
        || this.company?.companyName 
        || this.company?.Company 
        || this.company?.company_id 
        || this.company?.Name 
        || this.company?.title
        || this.company?.name
        || 'N/A';
    }
    
    // Warn if company name is still N/A
    if (companyName === 'N/A' && !this.company) {
      console.warn('[AdminInvoiceAdd] Company object not provided to modal');
    }
    
    this.local = {
      cid: this.company?.cid,
      aid: this.company?.aid || 0,
      companyName: companyName,
      serviceType: 'Filing',
      isAnnual: true,
      isFilingService: true,
      isFSPremium: true,
      isAnnualInclude: false,
      isFSInclude: false,
      isAdditionalUsersInclude: false,
      price: 0,
      qty: 1,
      filingServicePrice: 0,
      additionalUsersPrice: 0,
      invoicePrice: 0,
      size: 'Pay-per-use',
      note: '',
      clientNotes: '',
      clientNotesTitle: '',
      agid: 0,
      filingId: null,
      invoiceName: '',
      invoiceDate: this.formatDateForInput(new Date()),
      monthStartDate: this.formatDateForInput(new Date()),
      monthEndDate: this.formatDateForInput(new Date()),
      isInvoiceSent: false,
      isPaymentReceived: false,
      paymentReceivedDate: null
    };
    this.generateInvoiceName();
    this.calcInvoicePrice();
  }

  fillDummyData() {
    const serviceTypes = ['Filing', 'Monthly'];
    const sizes = ['Pay-per-use', 'Small', 'Medium', 'Large'];
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const price = Math.round(Math.random() * 400 + 50);
    const qty = Math.floor(Math.random() * 15) + 1;
    const filingServicePrice = Math.round(Math.random() * 100);
    const additionalUsersPrice = Math.round(Math.random() * 50);
    const invoicePrice = (price * qty) + filingServicePrice + additionalUsersPrice;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 3), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const isPaymentReceived = Math.random() > 0.5;

    this.local = {
      ...this.local,
      serviceType,
      isAnnual: Math.random() > 0.5,
      isFilingService: Math.random() > 0.5,
      isFSPremium: Math.random() > 0.5,
      isAnnualInclude: Math.random() > 0.5,
      isFSInclude: Math.random() > 0.5,
      isAdditionalUsersInclude: Math.random() > 0.5,
      price,
      qty,
      filingServicePrice,
      additionalUsersPrice,
      invoicePrice,
      size,
      note: size === 'Pay-per-use' ? '(Pay-per-use)' : `${size} plan`,
      clientNotes: 'Auto-generated test invoice for QA purposes.',
      clientNotesTitle: 'Test Invoice',
      invoiceDate: this.formatDateForInput(new Date()),
      monthStartDate: this.formatDateForInput(startDate),
      monthEndDate: this.formatDateForInput(endDate),
      isInvoiceSent: Math.random() > 0.5,
      isPaymentReceived,
      paymentReceivedDate: isPaymentReceived ? this.formatDateForInput(new Date()) : null
    };
    this.generateInvoiceName();
  }

  formatDateForInput(date: any): string {
    return this.dateFormatter.formatToInputDate(date);
  }

  generateInvoiceName() {
    const company = (this.company?.Title || this.company?.company_id || 'Company').replace(/\s+/g, '');
    const d = new Date(this.local.invoiceDate || new Date());
    const dateStr = (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + '-' + d.getFullYear();
    this.local.invoiceName = `PENDING_${company}_${this.local.serviceType}__on_${dateStr}`;
  }

  calcInvoicePrice() {
    const p = parseFloat(this.local.price) || 0;
    const q = parseInt(this.local.qty) || 0;
    const f = parseFloat(this.local.filingServicePrice) || 0;
    const u = parseFloat(this.local.additionalUsersPrice) || 0;
    this.local.invoicePrice = (p * q) + f + u;
  }

  doAdd() {
    if (!this.local.invoiceName) {
      this.toast.warning('Invoice Name is required');
      return;
    }
    if (this.isEditMode) {
      this.updateEvent.emit({ ...this.local, invoiceId: this.editingInvoice.invoiceId || this.editingInvoice.id });
    } else {
      this.addEvent.emit(this.local);
    }
    this.close();
  }

  close() {
    this.openChange.emit(false);
  }
}
