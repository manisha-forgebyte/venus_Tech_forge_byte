import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-admin-invoice-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, FormatDatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">eTariff >> Invoice</div>
            <h1 class="modal-title">Invoice List</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <div class="top-actions">
            <button class="btn btn-update" (click)="updateBulkStatus()">Update Invoice Status</button>
            <div class="spacer"></div>
            <button class="btn btn-green" (click)="triggerAddMonthly()">Add Monthly Invoice</button>
            <button class="btn btn-green" (click)="triggerAddInvoice()">Add Invoice</button>
          </div>

          <!-- Loading state -->
          <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="5" [columns]="9"></app-skeleton-loader>

          <div class="table-wrapper" *ngIf="!isLoading">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px;">
                    <input type="checkbox" [(ngModel)]="selectAll" (change)="onSelectAllChange()" />
                  </th>
                  <th>Account</th>
                  <th>Company</th>
                  <th>Inv Id</th>
                  <th>InvoiceName</th>
                  <th>Inv Date</th>
                  <th>ServiceName</th>
                  <th>Price($)</th>
                  <th style="text-align:center;">Paid</th>
                  <th style="text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inv of invoices">
                  <td><input type="checkbox" [(ngModel)]="inv.selected" /></td>
                  <td>{{ inv.account || inv.Account || 'N/A' }}</td>
                  <td>{{ inv.company || inv.Company || 'N/A' }}</td>
                  <td>{{ inv.invoiceId || inv.InvoiceID || inv.id }}</td>
                  <td><span class="invoice-name-text">{{ inv.invoiceName || inv.InvoiceName }}</span></td>
                  <td>{{ inv.invoiceDate | formatDate }}</td>
                  <td>{{ inv.serviceName || inv.ServiceName || 'Filing' }}</td>
                  <td>{{ inv.invoicePrice | currency }}</td>
                  <td style="text-align:center;">
                    <input type="checkbox" [(ngModel)]="inv.isPaid" (change)="togglePaidStatus(inv)" />
                  </td>
                  <td style="text-align:center;">
                    <div class="row-actions">
                      <button class="action-btn pdf" title="Download PDF" (click)="downloadPDF(inv)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </button>
                      <button class="action-btn edit" title="Edit Invoice" (click)="editInvoice(inv)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="invoices.length === 0">
                   <td colspan="10" style="text-align:center; padding: 40px; color: #94a3b8;">No invoices found for this company context.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 4500;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow-y: auto;
      padding: 40px 20px;
    }
    .modal {
      background: #ffffff;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      animation: modalFadeIn 0.3s ease-out;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-header {
      padding: 16px 24px;
      border-bottom: 2px solid #0891b2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .modal-title { font-size: 24px; font-weight: 500; color: #0369a1; margin: 0; }
    .breadcrumb { font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .close-x { font-size: 28px; color: #94a3b8; background: none; border: none; cursor: pointer; line-height: 1; }
    .modal-body { padding: 24px; }
    .info-banner { background: #eff6ff; color: #1e40af; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 500; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
    .top-actions { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
    .spacer { flex: 1; }
    .btn { padding: 8px 16px; border-radius: 4px; border: none; font-weight: 600; cursor: pointer; font-size: 13px; }
    .btn-update { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .btn-green { background: #15803d; color: white; }
    .btn-green:hover { background: #166534; }
    .table-wrapper { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 6px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f8fafc; color: #0369a1; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
    .data-table td { padding: 12px 16px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .invoice-name-text { color: #0369a1; font-weight: 600; }
    .row-actions { display: flex; gap: 10px; justify-content: center; }
    .action-btn { background: none; border: none; padding: 4px; cursor: pointer; }
    .action-btn svg { width: 18px; height: 18px; }
    .action-btn.pdf { color: #ef4444; }
    .action-btn.edit { color: #3b82f6; }
  `]
})
export class AdminInvoiceSummaryComponent implements OnChanges {
  @Input() open = false;
  @Input() cid: number = 0;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() openAddMonthly = new EventEmitter<void>();
  @Output() openAddInvoice = new EventEmitter<void>();
  @Output() editInvoiceEvent = new EventEmitter<any>();
  @Output() markAsPaidEvent = new EventEmitter<any>();

  invoices: any[] = [];
  isLoading = false;
  selectAll = false;

  constructor(private apiService: ApiService, private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      this.loadInvoices();
    }
  }

  loadInvoices() {
    if (!this.cid) return;
    this.isLoading = true;
    this.apiService.adminGetInvoices(this.cid).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        let rows: any[] = [];
        if (Array.isArray(res)) {
          
          if (res.length > 0 && res[0]?.rows !== undefined) {
            res.forEach((table: any) => {
              if (Array.isArray(table.rows)) {
                rows = rows.concat(table.rows);
              }
            });
          } else {
            rows = res;
          }
        } else if (res?.rows) {
          rows = res.rows;
        } else if (res) {
          rows = [res];
        }
        this.invoices = (rows || []).map((inv: any) => {
          const normalizedInv = {
            ...inv,
            selected: false,
            isPaid: inv.IsPaid ?? inv.isPaid ?? false,
            invoiceId: inv.invoiceId || inv.InvoiceId || inv.InvoiceID || inv.id || inv.ID,
            invoiceName: inv.invoiceName || inv.InvoiceName,
            invoiceDate: inv.invoiceDate || inv.InvoiceDate || inv.Date,
            invoicePrice: inv.invoicePrice || inv.InvoicePrice || inv.Price || inv.monthPrice || inv.MonthPrice,
            serviceName: inv.serviceName || inv.ServiceName,
            account: inv.account || inv.Account || inv.accName,
            company: inv.company || inv.Company || inv.companyName
          };
          if (!normalizedInv.invoiceId) {
            console.warn('Invoice missing ID field:', inv);
          }
          return normalizedInv;
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error('Failed to load invoices.');
        console.error('Error loading invoices:', err);
      }
    });
  }

  onSelectAllChange() {
    this.invoices.forEach(inv => inv.selected = this.selectAll);
  }

  togglePaidStatus(inv: any) {
    this.markAsPaidEvent.emit(inv);
  }

  updateBulkStatus() {
    const selected = this.invoices.filter(i => i.selected);
    if (selected.length === 0) {
      this.toast.warning('Please select at least one invoice.');
      return;
    }
    
    this.markAsPaidEvent.emit(selected);
  }

  downloadPDF(inv: any) {
    if (!inv) {
      this.toast.error('Invoice data is missing');
      return;
    }
    const invId = inv.invoiceId || inv.InvoiceID || inv.id;
    if (!invId) {
      this.toast.error('Invoice ID not found');
      return;
    }
    
    
    this.apiService.getInvoiceByID(invId).subscribe({
      next: (response: any) => {
        // Extract actual data from API response (may be wrapped in table structure)
        let invoiceData = response;
        if (Array.isArray(response) && response.length > 0) {
          const table = response.find((t: any) => t.rows && Array.isArray(t.rows)) || response[0];
          invoiceData = table?.rows?.[0] || table || response[0];
        } else if (response?.rows && Array.isArray(response.rows)) {
          invoiceData = response.rows[0] || response;
        }
        this.generateAndDownloadPDF(invoiceData, invId);
      },
      error: (err) => {
        console.error('Error fetching invoice details:', err);
        this.toast.error('Failed to fetch invoice details for PDF generation');
      }
    });
  }

  private generateAndDownloadPDF(invoiceData: any, invoiceId: any) {
    try {
      
      const invoiceHTML = this.buildInvoiceHTML(invoiceData);
      const printWindow = window.open('', '', 'width=900,height=600');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        
        
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            this.toast.success('Invoice PDF opened for printing');
          }, 500);
        }, 250);
      }
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      this.toast.error('Failed to generate invoice PDF');
    }
  }

  private buildInvoiceHTML(invoice: any): string {
    const monthPrice = invoice.monthPrice ?? invoice.MonthPrice ?? 0;
    const isMonthly = monthPrice > 0;

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const fc = (value: any) => `$${(parseFloat(value) || 0).toFixed(2)}`;

    const invId     = invoice.InvoiceId ?? invoice.invoiceId ?? invoice.InvoiceID ?? invoice.id ?? 'N/A';
    const invDate   = formatDate(invoice.invoiceDate ?? invoice.InvoiceDate ?? invoice.InvoiceDatetime ?? '');
    const company   = invoice.company ?? invoice.Company ?? invoice.companyName ?? invoice.CompanyName ?? invoice.Title ?? '';
    const accName   = invoice.account ?? invoice.Account ?? invoice.accName ?? invoice.AccountName ?? invoice.AccName ?? '';
    const phone     = invoice.phone ?? invoice.Phone ?? invoice.phone11 ?? invoice.phone1 ?? '(555) 555-5555';
    const email     = invoice.email ?? invoice.Email ?? invoice.email1 ?? invoice.billing_email ?? 'contact@venustech.com';
    const service   = invoice.serviceName ?? invoice.ServiceName ?? invoice.service ?? 'Filing Service';
    const size      = isMonthly ? (invoice.monthSize ?? invoice.MonthSize ?? invoice.sizeNotes ?? '') : (invoice.sizeNotes ?? invoice.SizeNotes ?? invoice.Size ?? '');
    const qty       = invoice.qty ?? invoice.Qty ?? invoice.quantity ?? 1;
    // Use InvoicePrice first (total), then monthPrice, then individual price field
    const price     = invoice.InvoicePrice ?? invoice.invoicePrice ?? monthPrice ?? (invoice.price ?? invoice.Price ?? 0);
    const charge    = price * qty;
    const notes     = invoice.clientNotes ?? invoice.ClientNotes ?? invoice.Notes ?? '';
    const notesTitle = invoice.clientNotesTitle ?? invoice.ClientNotesTitle ?? invoice.NotesTitle ?? '';

    
    const logoUrl = `${window.location.origin}/assets/venus_logo.png`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invId}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; margin: 30px; }
    table { border-collapse: collapse; }
    td, th { font-size: 11pt; }
    .outer { width: 100%; border: 0; padding: 0; margin: 0; }
    .outer td { vertical-align: top; padding: 2px; }
    .logo-img { max-height: 80px; }
    .purchase-order { vertical-align: middle; }
    .inner-table { width: 100%; border: 1px solid #999; }
    .inner-table th { background-color: #E4DFEC; font-weight: bold; padding: 4px; text-align: left; font-size: 10pt; }
    .inner-table td { padding: 4px; font-size: 10pt; vertical-align: top; }
    .total-row { background-color: #EBF1DE; font-weight: bold; }
    .bank-section { margin-top: 12px; font-size: 10pt; }
    .footer-note { color: green; font-weight: bold; margin-top: 10px; font-size: 10pt; }
    .thank-you { text-align: center; margin-top: 20px; font-size: 11pt; }
    @media print {
      body { margin: 15px; }
      button { display: none; }
    }
  </style>
</head>
<body>

<table class="outer" cellpadding="2" cellspacing="2">
  <!-- Row 1: Logo + Purchase Order header -->
  <tr>
    <td width="1%">&nbsp;</td>
    <td width="58%" valign="top">
      <img src="${logoUrl}" class="logo-img" alt="Venus Tech Logo" title="Venus Tech Logo" />
    </td>
    <td width="41%" valign="middle" class="purchase-order">
      PURCHASE ORDER${isMonthly ? ' MBR Database' : ''}<br/>
      Date:&nbsp;${invDate}<br/>
      Invoice #&nbsp;${invId}
    </td>
  </tr>

  <!-- Row 2: blank + blank + client name -->
  <tr>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>${accName}</td>
  </tr>

  <!-- Row 3: blank + Venus Tech Inc + company -->
  <tr>
    <td>&nbsp;</td>
    <td><strong>Venus Tech Inc</strong></td>
    <td>${company}</td>
  </tr>

  <!-- Phone row -->
  <tr>
    <td>&nbsp;</td>
    <td>Phone:&nbsp;</td>
    <td>${phone}</td>
  </tr>

  <!-- Email row -->
  <tr>
    <td>&nbsp;</td>
    <td>Email:&nbsp;</td>
    <td>${email}</td>
  </tr>

  <!-- Spacer -->
  <tr><td colspan="3">&nbsp;</td></tr>

  ${notes ? `
  <!-- Client Notes -->
  <tr>
    <td>&nbsp;</td>
    <td colspan="2"><strong>${notesTitle}</strong>&nbsp;${notes}</td>
  </tr>
  <tr><td colspan="3">&nbsp;</td></tr>
  ` : ''}

  <!-- Service table -->
  <tr>
    <td>&nbsp;</td>
    <td colspan="2">
      <table class="inner-table" cellpadding="2" cellspacing="0">
        <thead>
          <tr>
            <th><strong>Service</strong></th>
            <th width="24%"><strong>SIZE/Plan Option</strong></th>
            <th width="5%"><strong>QTY</strong></th>
            <th width="10%"><strong>PRICE</strong></th>
            <th width="10%"><strong>CHARGE</strong></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${company}</td>
            <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;&nbsp;${service}</td>
            <td align="center">${size}</td>
            <td>${qty}</td>
            <td align="right">${fc(price)}</td>
            <td align="right">${fc(charge)}</td>
          </tr>
          ${invoice.isIncludeAnnual || invoice.IsIncludeAnnual ? `
          <tr>
            <td>&nbsp;&nbsp;&nbsp;Annual Compliance</td>
            <td>&nbsp;</td><td>1</td>
            <td align="right"></td><td align="right"></td>
          </tr>` : ''}
          ${invoice.isIncludeFS || invoice.IsIncludeFS ? `
          <tr>
            <td>&nbsp;&nbsp;&nbsp;Financial Statements</td>
            <td>&nbsp;</td><td>1</td>
            <td align="right"></td><td align="right"></td>
          </tr>` : ''}
          ${invoice.isIncludeAdditionalUsers || invoice.IsIncludeAdditionalUsers ? `
          <tr>
            <td>&nbsp;&nbsp;&nbsp;Additional Users</td>
            <td>&nbsp;</td><td>1</td>
            <td align="right"></td><td align="right"></td>
          </tr>` : ''}
          <tr class="total-row">
            <td colspan="4" align="right"><b>Total:</b></td>
            <td align="right">&nbsp;<b>${fc(charge)}</b></td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>

  <!-- Spacer -->
  <tr><td colspan="3">&nbsp;</td></tr>

  <!-- Wire Transfers -->
  <tr>
    <td>&nbsp;</td>
    <td colspan="2" class="bank-section">
      <span style="text-decoration:underline">For Wire Transfers</span><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bank of America, Routing# 026009593&nbsp;&nbsp;&nbsp;&nbsp;A/C# 435024060442<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Wire Transfer to : Venus Tech Inc.
    </td>
  </tr>
  <tr><td colspan="3">&nbsp;</td></tr>

  <!-- Remittance -->
  <tr>
    <td>&nbsp;</td>
    <td colspan="2" class="bank-section">
      <span style="text-decoration:underline">For Remittance/Direct Deposit/ACH</span><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bank of America, Routing# 051000017&nbsp;&nbsp;&nbsp;&nbsp;A/C# 435024060442<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Remittance to : Venus Tech Inc.
    </td>
  </tr>
  <tr><td colspan="3">&nbsp;</td></tr>

  <!-- Payment note -->
  <tr>
    <td colspan="3" class="footer-note">* Please send payment within 30 days of receiving this invoice.</td>
  </tr>
  <tr><td colspan="3">&nbsp;</td></tr>

  <!-- Thank you -->
  <tr>
    <td colspan="3" class="thank-you">THANK&nbsp;&nbsp;YOU FOR YOUR PATRONAGE</td>
  </tr>
</table>

</body>
</html>`;
  }

  editInvoice(inv: any) {
    this.editInvoiceEvent.emit(inv);
  }

  triggerAddMonthly() {
    this.openAddMonthly.emit();
  }

  triggerAddInvoice() {
    this.openAddInvoice.emit();
  }

  close() {
    this.openChange.emit(false);
  }
}
