import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';

@Component({
  selector: 'app-admin-monthly-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerOnlyDirective],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">eTariff >> Add Monthly Invoice</div>
            <h1 class="modal-title">Admin Invoice Monthly Add</h1>
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
                  <option value="Month">Month</option>
                  <option value="Quarter">Quarter</option>
                  <option value="Year">Year</option>
                </select>
              </div>

              <div class="form-row">
                <label class="field-label">Account Group:</label>
                <select class="form-control" [(ngModel)]="local.agid" (change)="generateInvoiceName()">
                  <option [ngValue]="-1">All Groups</option>
                  <option *ngFor="let g of groups" [ngValue]="g.agid">{{ g.groupName || 'Unnamed Group' }}</option>
                </select>
              </div>

              <div class="form-row date-row">
                <div class="date-field">
                  <label class="field-label">Invoice Month Start Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.startDate" (change)="generateInvoiceName()" />
                </div>
                <div class="date-field">
                  <label class="field-label">End Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.endDate" />
                </div>
              </div>

              <div class="form-row" style="margin-top: 10px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <button class="btn btn-filings-count" (click)="getFilingsCount()" [disabled]="filingsCountLoading">
                    {{ filingsCountLoading ? 'Loading...' : 'FilingsCount' }}
                  </button>
                  <span *ngIf="filingsCount !== null" style="font-size:14px; font-weight:700; color:#0369a1;">
                    Count: {{ filingsCount }}
                  </span>
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
                <input class="form-control" [(ngModel)]="local.clientNotes" />
              </div>

              <div class="form-row">
                <label class="field-label">Client Notes Title:</label>
                <input class="form-control" [(ngModel)]="local.clientNotesTitle" />
              </div>

              <div class="form-row">
                <label class="field-label">Desc:</label>
                <input class="form-control" [(ngModel)]="local.desc" />
              </div>

              <div class="form-row">
                <label class="field-label">Invoice Name:</label>
                <input class="form-control" [(ngModel)]="local.invoiceName" />
              </div>

              <div class="form-row">
                <label class="field-label">Invoice Date:</label>
                <input class="form-control" type="date" [(ngModel)]="local.invoiceDate" />
              </div>

              <div class="form-row">
                <label class="field-label">Invoice ID:</label>
                <input class="form-control" [(ngModel)]="local.invoiceId" disabled />
              </div>

              <div class="form-row checkbox-group">
                <label class="checkbox-container">
                  <input type="checkbox" [(ngModel)]="local.isInvoiceSent" />
                  <span class="checkmark"></span>
                  Is Invoice Sent
                </label>
                <label class="checkbox-container">
                  <input type="checkbox" [(ngModel)]="local.isPaymentReceived" />
                  <span class="checkmark"></span>
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
      max-width: 950px;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      animation: modalSlideDown 0.3s ease-out;
    }
    @keyframes modalSlideDown {
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
    .date-row { display: flex; flex-direction: row; gap: 15px; }
    .date-field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .price-qty-row { display: flex; flex-direction: row; gap: 15px; }
    .price-field { flex: 1; }
    .qty-field { width: 90px; }
    .highlight .form-control { border: 2px solid #ef4444; background: #fff1f2; font-weight: 700; color: #991b1b; }
    .btn-filings-count { background: #15803d; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; width: fit-content; font-size: 12px; font-weight: 600; }
    .btn-filings-count:hover { background: #166534; }
    .modal-footer { padding: 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: center; gap: 12px; background: #f8fafc; }
    .btn-modal { padding: 10px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s, box-shadow 0.2s; }
    .btn-submit { background: #0369a1; color: #fff; border: none; } .btn-submit:hover { background: #0284c7; }
    .btn-reset { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; } .btn-reset:hover { background: #e2e8f0; }
    .btn-dummy { display: none; background: #7c3aed; color: #fff; border: none; } .btn-dummy:hover { background: #6d28d9; }
    .btn-cancel { background: #fff; color: #dc2626; border: 1px solid #fca5a5; } .btn-cancel:hover { background: #fef2f2; }
    .checkbox-group { display: flex; gap: 30px; padding: 10px 0; }
    .checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 600; color: #334155; }
    .form-control { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; }
    .form-control:disabled { background: #f1f5f9; cursor: not-allowed; }
  `]
})
export class AdminMonthlyInvoiceComponent implements OnChanges {
  @Input() open = false;
  @Input() company: any;
  @Input() groups: any[] = [];
  @Input() editingInvoice: any = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() addEvent = new EventEmitter<any>();
  @Output() updateEvent = new EventEmitter<any>();

  local: any = {};
  isEditMode = false;
  filingsCount: number | null = null;
  filingsCountLoading = false;

  constructor(private apiService: ApiService, private toast: ToastService, private dateFormatter: DateFormatterService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      this.filingsCount = null;
      // Defer by one tick so all input bindings (company, groups etc.) are resolved
      setTimeout(() => {
        if (this.editingInvoice) {
          this.isEditMode = true;
          this.loadEditData();
        } else {
          this.isEditMode = false;
          this.reset();
        }
      }, 0);
    }
    
    if (changes['company'] && this.open && !this.isEditMode) {
      this.reset();
    }
  }

  loadEditData() {
    const inv = this.editingInvoice;
    this.local = {
      invoiceName: inv.invoiceName || inv.InvoiceName || '',
      invoiceDate: this.formatDateForInput(inv.invoiceDate || inv.InvoiceDate),
      startDate: this.formatDateForInput(inv.monthStartDate || inv.MonthStartDate),
      endDate: this.formatDateForInput(inv.monthEndDate || inv.MonthEndDate),
      agid: inv.agid || inv.AGID || -1,
      price: inv.monthPrice || inv.MonthPrice || 0,
      qty: inv.qty || inv.Qty || 0,
      filingServicePrice: inv.filingServicePrice || inv.FilingServicePrice || 0,
      additionalUsersPrice: inv.additionalUsersPrice || inv.AdditionalUsersPrice || 0,
      invoicePrice: inv.invoicePrice || inv.InvoicePrice || 0,
      size: inv.monthSize || inv.MonthSize || 'Pay-per-use',
      serviceType: inv.serviceName || inv.ServiceName || 'Month',
      note: inv.note || '',
      clientNotes: inv.clientNotes || inv.ClientNotes || '',
      clientNotesTitle: inv.clientNotesTitle || inv.ClientNotesTitle || '',
      desc: inv.desc || '',
      isInvoiceSent: inv.isInvoiceSent || inv.IsInvoiceSent || false,
      isPaymentReceived: inv.paymentReceived || inv.PaymentReceived || false,
      paymentReceivedDate: this.formatDateForInput(inv.paymentDate || inv.PaymentDate)
    };
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
      console.warn('[AdminMonthlyInvoice] Company object not provided to modal');
    }
    
    this.local = {
      cid: this.company?.cid,
      aid: this.company?.aid || 0,
      companyName: companyName,
      serviceType: 'Month',
      agid: -1,
      startDate: this.formatDateForInput(new Date()),
      endDate: this.formatDateForInput(new Date()),
      price: 0,
      qty: 1,
      filingServicePrice: 0,
      additionalUsersPrice: 0,
      invoicePrice: 0,
      size: 'Pay-per-use',
      note: '(Pay-per-use)',
      clientNotes: '',
      clientNotesTitle: '',
      desc: '',
      invoiceDate: this.formatDateForInput(new Date()),
      isInvoiceSent: false,
      isPaymentReceived: false,
      paymentReceivedDate: null,
      invoiceId: 'NEW',
      invoiceName: ''
    };
    this.generateInvoiceName();
    this.calcInvoicePrice();
  }

  fillDummyData() {
    const serviceTypes = ['Month', 'Quarter', 'Year'];
    const sizes = ['Pay-per-use', 'Small', 'Medium', 'Large'];
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const price = parseFloat((Math.random() * 500 + 50).toFixed(2));
    const qty = Math.floor(Math.random() * 20) + 1;
    const filingServicePrice = parseFloat((Math.random() * 100).toFixed(2));
    const additionalUsersPrice = parseFloat((Math.random() * 50).toFixed(2));
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 3), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const isPaymentReceived = Math.random() > 0.5;

    this.local = {
      ...this.local,
      serviceType,
      startDate: this.formatDateForInput(startDate),
      endDate: this.formatDateForInput(endDate),
      price,
      qty,
      filingServicePrice,
      additionalUsersPrice,
      invoicePrice: (price * qty) + filingServicePrice + additionalUsersPrice,
      size,
      note: size === 'Pay-per-use' ? '(Pay-per-use)' : `${size} plan`,
      clientNotes: 'Auto-generated test invoice for QA purposes.',
      clientNotesTitle: 'Test Invoice',
      desc: `Monthly billing cycle — ${serviceType} rate`,
      invoiceDate: this.formatDateForInput(new Date()),
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
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(this.local.startDate || new Date());
    const dateStr = monthNames[d.getMonth()] + d.getFullYear();
    const groupSuffix = this.local.agid === -1 ? 'AllGroups' : 'Group' + this.local.agid;
    this.local.invoiceName = `PENDING_${company}_${this.local.serviceType}_-${groupSuffix}-${dateStr}`;
  }

  calcInvoicePrice() {
    const p = parseFloat(this.local.price) || 0;
    const q = parseInt(this.local.qty) || 0;
    const f = parseFloat(this.local.filingServicePrice) || 0;
    const u = parseFloat(this.local.additionalUsersPrice) || 0;
    this.local.invoicePrice = (p * q) + f + u;
  }

  getFilingsCount() {
    const aid = this.company?.aid;
    const agid = this.local.agid === -1 ? 0 : (this.local.agid || 0);
    if (!aid) {
      this.toast.warning('Account context missing. Please re-select company.');
      return;
    }

    this.filingsCountLoading = true;
    this.filingsCount = null;
    this.apiService.getAdminGetInvoiceMonthlyCountByCID(aid, agid).subscribe({
      next: (res: any) => {
        this.filingsCountLoading = false;
        let count = 0;
        if (Array.isArray(res)) {
          const table = res.find((t: any) => t.tableName === 'Table1' || t.tableName === 'Table');
          const row = table?.rows?.[0] || res[0];
          count = row?.count ?? row?.Count ?? row?.FilingsCount ?? row?.column1 ?? 0;
        } else if (res !== null && res !== undefined) {
          count = res?.count ?? res?.Count ?? res?.FilingsCount ?? (typeof res === 'number' ? res : 0);
        }
        
        this.filingsCount = count;
        this.local.qty = count;
        this.calcInvoicePrice();
      },
      error: (err) => {
        this.filingsCountLoading = false;
        console.error('Error fetching filings count:', err);
        this.toast.error('Failed to fetch filings count');
      }
    });
  }

  sendTestPayload() {
    
    this.local.serviceType = 'Month';
    this.local.startDate = '2026-05-01';
    this.local.endDate = '2026-05-31';
    this.local.invoiceDate = '2026-05-18';
    this.local.price = 120;
    this.local.qty = 2;
    this.local.filingServicePrice = 0;
    this.local.additionalUsersPrice = 0;
    this.local.size = 'Monthly';
    this.local.clientNotesTitle = 'Monthly Filing';
    this.local.clientNotes = '1Monthly compliance filing for Southern Company';
    this.local.isInvoiceSent = true;
    this.local.isPaymentReceived = true;
    this.local.paymentReceivedDate = '2026-05-12';
    this.local.isAnnualInclude = false;
    this.local.isFSInclude = true;
    this.local.isAdditionalUsersInclude = false;
    this.calcInvoicePrice();
    this.generateInvoiceName();
    this.toast.info('Dummy data filled — review and click Add to submit.');
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
