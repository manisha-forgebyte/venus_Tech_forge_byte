import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { UpdateAccountComponent } from './update-account.component';
import { AdminInvoiceSummaryComponent } from '../filings/admin-invoice-summary.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { Router } from '@angular/router';
import { CompanyContextService } from '../../core/services/company-context.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [CommonModule, FormsModule, UpdateAccountComponent, AdminInvoiceSummaryComponent, SkeletonLoaderComponent],
  template: `
    <div class="page-container admin-account-page">
      <div class="top-bar">
        <h1 class="page-title">Admin Account List</h1>
        <div class="top-actions">
          <button class="btn btn-primary" (click)="openInvoices()">Invoices</button>
          <button class="btn btn-primary" (click)="openAddAccount()">Add Account</button>
        </div>
      </div>


      <!-- Loading skeleton -->
      <app-skeleton-loader *ngIf="isLoading" type="table" [rows]="5" [columns]="5"></app-skeleton-loader>

      <div class="table-card" *ngIf="!isLoading">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Companies</th>
                <th>Users</th>
                <th>Start Date</th>
                <th>Expire Date</th>
                <th>IsActive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let account of accounts; trackBy: trackByAccount">
                <td><span class="link-text" (click)="viewAccountDetails(account)">{{ account.accName || 'N/A' }}</span></td>
                <td>
                  <span class="link-text" (click)="viewAccountCompanies(account)">{{ account.companiesCount ?? 0 }}</span>
                  <span class="count-badge" *ngIf="account.companySeeds != null">({{ account.companySeeds }})</span>
                </td>
                <td>
                  <span class="link-text" (click)="viewAccountUsers(account)">{{ account.usersCount ?? 0 }}</span>
                  <span class="count-badge" *ngIf="account.userSeeds != null">({{ account.userSeeds }})</span>
                </td>
                <td>{{ formatDate(account.startDate) }}</td>
                <td>{{ formatDate(account.expireDate) }}</td>
                <td style="text-align:center;">
                  <span class="status-pill" [class.active]="account.isActive === true" [class.inactive]="account.isActive !== true">
                    {{ account.isActive === true ? 'Active' : (account.isActive === false ? 'Inactive' : '—') }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">

                    <button class="edit-btn" title="Edit" (click)="editAccount(account)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="delete-btn" title="Delete" (click)="deleteAccount(account)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="accounts.length === 0 && !isLoading">
                <td colspan="7" style="text-align:center; padding:40px; color:#a3aed0;">No accounts found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Account Modal -->
    <app-update-account
      [open]="isAccountModalOpen"
      [isAdd]="isAddMode"
      [isAdmin]="true"
      [account]="selectedAccount"
      (openChange)="isAccountModalOpen = $event"
      (saveEvent)="onAccountSave($event)"
    ></app-update-account>

    <!-- Invoice Summary Modal -->
    <app-admin-invoice-summary
       [open]="isInvoiceSummaryModalOpen"
       (openChange)="isInvoiceSummaryModalOpen = $event"
       [cid]="cid">
    </app-admin-invoice-summary>
  `,
  styleUrls: ['./admin-account.component.scss']
})
export class AdminAccountComponent implements OnInit {
  accounts: any[] = [];
  isLoading = false;

  
  isAccountModalOpen = false;
  isInvoiceSummaryModalOpen = false;
  isAddMode = false;
  selectedAccount: any = null;

  public uid = 0;
  public cid = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private companyContextService: CompanyContextService,
    private toast: ToastService,
    private dateFormatter: DateFormatterService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAccounts();
  }

  private loadCurrentUser(): void {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.uid = Number(user.uid ?? user.Uid ?? user.id ?? 0);
        this.cid = Number(user.cid ?? user.Cid ?? 0);
      }
    } catch (e) {
      console.error('Error parsing currentUser', e);
    }
  }

  loadAccounts(): void {
    if (this.accounts.length === 0) this.isLoading = true;
    this.apiService.adminGetAccounts().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('AdminGetAccounts raw response:', response);

        if (Array.isArray(response)) {
          this.accounts = response.map(acc => ({
            aid: acc.aid ?? acc.AID ?? acc.Aid ?? null,
            accName: acc.accName ?? acc.AccName ?? acc.AccountName ?? acc.accountName ?? 'N/A',
            companiesCount: acc.Companies ?? acc.companiesCount ?? acc.CompaniesCount ?? 0,
            companySeeds: acc.CompanySeeds ?? acc.companySeeds ?? null,
            usersCount: acc.Users ?? acc.usersCount ?? acc.UsersCount ?? null,
            userSeeds: acc.UserSeeds ?? acc.userSeeds ?? null,
            startDate: acc.startDate ?? acc.StartDate ?? null,
            expireDate: acc.expireDate ?? acc.ExpireDate ?? null,
            isActive: acc.isActive !== undefined ? acc.isActive : acc.IsActive
          }));
        } else {
          this.accounts = [];
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toast.error('Failed to load accounts. Please try again later.');
        console.error('Error loading accounts:', err);
      }
    });
  }



  
  private applyAccountDetails(account: any, details: any): void {
    
    
    let d = Array.isArray(details) ? details[0] : details;
    if (d && d.tableName && Array.isArray(d.rows)) {
      d = d.rows[0];
    }
    if (!d) return;

    account.aid = account.aid ?? d.aid ?? d.AID ?? d.Aid ?? null;
    account.accName = account.accName || d.AccName || d.accName || d.AccountName || d.accountName || d.Name || d.name || account.accName;
    account.companySeeds = d.CompanySeeds ?? d.companySeeds ?? d.companiesMax ?? account.companySeeds;
    account.userSeeds = d.UserSeeds ?? d.userSeeds ?? d.usersMax ?? account.userSeeds;
    account.tariffSeeds = d.TariffSeeds ?? d.tariffSeeds ?? account.tariffSeeds;
    account.usersCount = d.UserCount ?? d.userCount ?? d.UsersCount ?? d.usersCount ?? account.usersCount;
    account.startDate = d.StartDate ?? d.startDate ?? d.SDate ?? account.startDate;
    account.expireDate = d.ExpireDate ?? d.expireDate ?? d.EDate ?? account.expireDate;
    account.isActive = d.IsActive ?? d.isActive ?? account.isActive;
    account.contactName = d.ContactName ?? d.contactName ?? null;
    account.eMail = d.EMail ?? d.eMail ?? d.email ?? null;
    account.url = d.URL ?? d.Url ?? d.url ?? null;
    account.phone1 = d.Phone1 ?? d.phone1 ?? null;
    account.phone2 = d.Phone2 ?? d.phone2 ?? null;
    account.fax = d.Fax ?? d.fax ?? null;
    account.address1 = d.Address1 ?? d.address1 ?? null;
    account.address2 = d.Address2 ?? d.address2 ?? null;
    account.city = d.City ?? d.city ?? null;
    account.state = d.state_id ?? d.State ?? d.state ?? null;
    account.zipcode = d.ZipCode ?? d.zipCode ?? d.zipcode ?? null;
    account.isAllowCompAdd = d.IsAllowCompAdd ?? d.isAllowCompAdd ?? null;
  }

  formatDate(value: any): string {
    if (!value) return 'N/A';
    try {
      return this.dateFormatter.formatToDisplay(value) || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  viewAccountDetails(account: any): void {
    const aid = account.aid ?? account.AID ?? account.id;
    if (aid) {
      this.isLoading = true;
      this.apiService.getAccountDetailsByAID(aid).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          this.applyAccountDetails(account, response);
          this.editAccount(account);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching account details:', err);
          this.toast.error('Failed to load account details.');
        }
      });
    }
  }



  editAccount(account: any): void {
    const aid = account.aid ?? account.AID;
    if (!aid) {
      this.openModalWithAccount(account);
      return;
    }

    this.isLoading = true;
    this.apiService.getAccountDetailsByAID(aid).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.applyAccountDetails(account, response);
        this.openModalWithAccount(account);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading full account details:', err);
        
        this.openModalWithAccount(account);
      }
    });
  }

  private openModalWithAccount(account: any): void {
    this.selectedAccount = { ...account, modifiedUID: this.uid };
    this.isAddMode = false;
    this.isAccountModalOpen = true;
  }

  async deleteAccount(account: any) {
    const aid = account.aid ?? account.AID;
    if (!aid) {
      console.warn('Cannot delete account: AID not found');
      return;
    }

    const name = account.accName || account.name || 'this account';
    if (await this.confirmService.show(`Are you sure you want to delete "${name}"?`, 'Confirm Delete', 'Delete', 'Cancel')) {
      this.isLoading = true;
      this.apiService.adminDeleteAccount(aid).subscribe({
        next: (result: any) => {
          this.isLoading = false;
          if (result && (result.resultId > 0 || result.ResultId > 0)) {
            this.toast.success(`Account "${name}" deleted successfully!`);
            this.loadAccounts(); 
          } else {
            const errMsg = result?.errMsg || result?.ErrMsg || 'Unknown error deleting account.';
            this.toast.error(`Failed to delete account: ${errMsg}`);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error deleting account:', err);
          this.toast.error('Failed to delete account. Please try again.');
        }
      });
    }
  }

  viewAccountCompanies(account: any): void {
    const aid = account.aid ?? account.AID;
    if (!aid) return;

    
    this.companyContextService.setCompany({
      aid: aid,
      accName: account.accName || account.name,
      Account: account.accName || account.name
    });

    this.router.navigate(['/admin/company']);
  }

  viewAccountUsers(account: any): void {
    const aid = account.aid ?? account.AID;
    if (!aid) return;

    this.isLoading = true;
    this.apiService.adminGetCompaniesByAID(aid).subscribe({
      next: (companies: any) => {
        this.isLoading = false;
        
        let firstCid: number | null = null;
        let firstCompany: any = null;

        if (Array.isArray(companies) && companies.length > 0) {
          
          const table = companies.find((t: any) => t.tableName === 'Table1' || t.tableName === 'Table');
          const rows = table ? table.rows : companies;
          
          if (Array.isArray(rows) && rows.length > 0) {
            const first = rows[0];
            firstCid = first.cid ?? first.CID ?? first.companyId ?? first.company_id;
            firstCompany = first;
          }
        }

        if (firstCid) {
          
          this.companyContextService.setCompany({
            aid: aid,
            accName: account.accName || account.name,
            cid: firstCid,
            Title: firstCompany.Title ?? firstCompany.Company ?? firstCompany.name ?? account.accName,
            company_id: firstCompany.company_id ?? firstCompany.companyID ?? firstCid
          });
          this.router.navigate(['/admin/user']);
        } else {
          this.toast.warning('Cannot view users: No companies found for this account.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching companies for user view:', err);
        this.toast.error('Failed to load companies for this account.');
      }
    });
  }

  openInvoices(): void { 
    if (!this.cid) {
       this.toast.warning('Account context missing. Please ensure your session is active.');
       return;
    }
    this.isInvoiceSummaryModalOpen = true; 
  }

  openAddAccount(): void {
    this.selectedAccount = { modifiedUID: this.uid };
    this.isAddMode = true;
    this.isAccountModalOpen = true;
  }

  
  onAccountSave(payload: any): void {
    console.log('Account save payload:', payload);

    
    payload.modifiedUID = this.uid;

    if (this.isAddMode) {
      this.apiService.createAccount(payload).subscribe({
        next: (result: any) => {
          if (result && (result.resultId > 0 || result.ResultId > 0)) {
            this.toast.success(`Account "${payload.accName}" created successfully!`);
            this.loadAccounts(); 
          } else {
            const errMsg = result?.errMsg || result?.ErrMsg || 'Unknown error creating account.';
            this.toast.error(`Failed to create account: ${errMsg}`);
          }
        },
        error: (err: any) => {
          console.error('CreateAccount error:', err);
          this.toast.error('Failed to create account. Please try again.');
        }
      });
    } else {
      this.apiService.updateAccount(payload).subscribe({
        next: (result: any) => {
          if (result && (result.resultId > 0 || result.ResultId > 0)) {
            this.toast.success(`Account "${payload.accName}" updated successfully!`);
            this.loadAccounts(); 
          } else {
            const errMsg = result?.errMsg || result?.ErrMsg || 'Unknown error updating account.';
            this.toast.error(`Failed to update account: ${errMsg}`);
          }
        },
        error: (err: any) => {
          console.error('UpdateAccount error:', err);
          this.toast.error('Failed to update account. Please try again.');
        }
      });
    }
    this.isAccountModalOpen = false;
  }

  trackByAccount(index: number, account: any): any {
    return account.aid || index;
  }
}
