import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-admin-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, FormatDatePipe],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <h1 class="modal-title">Filings Invoice List</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <div class="actions-row">
            <button class="btn btn-update" (click)="updateInvoiceStatus()">Update Invoice Status</button>
          </div>

          <div class="table-wrapper">
            <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="8" [columns]="8"></app-skeleton-loader>
            
            <table class="data-table" *ngIf="!isLoading">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="isAllSelected()" />
                  </th>
                  <th>Account</th>
                  <th>Company</th>
                  <th>Account Group</th>
                  <th>FERC sub Id</th>
                  <th>FERC sub status</th>
                  <th>Filing Date</th>
                  <th style="width: 80px; text-align: center;">Inv Billed</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of invoiceFilings">
                  <td style="text-align: center;">
                    <input type="checkbox" [(ngModel)]="f.selected" />
                  </td>
                  <td>{{ f.Account || f.accName || 'N/A' }}</td>
                  <td>{{ f.Company || f.companyName || 'N/A' }}</td>
                  <td>{{ f.AccountGroup || f.agName || '--' }}</td>
                  <td>{{ f.FERCSubID || f.fercsubid || '--' }}</td>
                  <td>
                    <span class="status-pill" [class.passed]="(f.FERCSubStatus || f.fercstatus) === 'PASSED'">
                      {{ f.FERCSubStatus || f.fercstatus || 'N/A' }}
                    </span>
                  </td>
                  <td>{{ (f.FilingDate || f.filingdate) | formatDate }}</td>
                  <td style="text-align: center;">
                     <input type="checkbox" [(ngModel)]="f.InvBilled" disabled />
                  </td>
                </tr>
                <tr *ngIf="invoiceFilings.length === 0 && !isLoading">
                  <td colspan="8" class="empty-state">No filings available for invoice check.</td>
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
      max-width: 1100px;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      animation: modalFadeIn 0.2s ease-out;
      display: flex;
      flex-direction: column;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      padding: 15px 20px;
      border-bottom: 2px solid #0891b2;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 24px;
      font-weight: 500;
      color: #0369a1;
      margin: 0;
      font-family: inherit;
    }

    .close-x {
      font-size: 28px;
      color: #94a3b8;
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
      &:hover { color: #64748b; }
    }

    .modal-body {
      padding: 20px;
    }

    .info-banner {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 15px;
      color: #475569;
      font-size: 14px;
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 15px;
    }

    .btn-update {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      &:hover { background: #e2e8f0; }
    }

    .table-wrapper {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .data-table th {
      background: linear-gradient(to bottom, #ffffff, #f8fafc);
      color: #0369a1;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #bae6fd;
      font-weight: 600;
      border-right: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
      color: #334155;
    }

    .data-table tr:hover {
      background-color: #f0f9ff;
    }

    .status-pill {
      font-weight: 600;
      color: #ef4444; 
    }

    .status-pill.passed {
      color: #15803d;
    }

    .empty-state {
      text-align: center;
      padding: 40px !important;
      color: #94a3b8;
      font-style: italic;
    }

    input[type="checkbox"] {
      cursor: pointer;
    }
  `]
})
export class AdminInvoiceListComponent implements OnChanges {
  @Input() open = false;
  @Input() cid = 0;
  @Output() openChange = new EventEmitter<boolean>();

  invoiceFilings: any[] = [];
  isLoading = false;

  constructor(private apiService: ApiService, private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open && this.cid) {
      this.loadInvoices();
    }
  }

  loadInvoices() {
    if (!this.cid) {
      this.isLoading = false;
      this.invoiceFilings = [];
      return;
    }

    this.isLoading = true;
    this.apiService.adminGetFilingsForInvoices(this.cid).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        let rows = [];
        if (Array.isArray(res)) {
          const table = res.find((t: any) => t.tableName === 'Table1' || t.tableName === 'Table') || res[0];
          rows = table?.rows || res;
        }

        this.invoiceFilings = rows.map((f: any) => ({
          ...f,
          selected: false,
          InvBilled: f.InvBilled ?? f.isBilled ?? f.IsBilled ?? f.invBilled ?? false
        }));
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching invoices:', err);
        this.toast.error('Failed to load invoices');
      }
    });
  }

  isAllSelected() {
    return this.invoiceFilings.length > 0 && this.invoiceFilings.every(f => f.selected);
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.invoiceFilings.forEach(f => f.selected = checked);
  }

  updateInvoiceStatus() {
    const selected = this.invoiceFilings.filter(f => f.selected);
    if (selected.length === 0) {
      this.toast.warning('Please select at least one filing');
      return;
    }

    const ids = selected.map(f => f.fid || f.id || f.FID).join(',');
    this.isLoading = true;
    this.apiService.adminUpdateInvoicesIsBilledByIDs({ ids, value: true }).subscribe({
      next: (res) => {
        this.toast.success('Invoice status updated successfully');
        this.loadInvoices();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating invoice status:', err);
        this.toast.error('Failed to update invoice status');
      }
    });
  }

  close() {
    this.openChange.emit(false);
  }
}
