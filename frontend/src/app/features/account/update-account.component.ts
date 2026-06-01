import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerOnlyDirective } from '../../shared/directives/date-picker-only.directive';
import { ToastService } from '../../shared/services/toast.service';
import { DateFormatterService } from '../../core/services/date-formatter.service';

@Component({
  selector: 'app-update-account',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerOnlyDirective],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">eTariff >> {{ isAdd ? 'Add' : 'Update' }} Account</div>
            <h1 class="modal-title">{{ isAdd ? 'Add' : 'Update' }} Account</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <!-- Customer View: Clean 2-Column Layout -->
          <ng-container *ngIf="!isAdmin">
            <h3 class="section-heading">Account Update</h3>
            <div class="customer-form-grid">
              <!-- Left Column -->
              <div class="form-column">
                <div class="form-row">
                  <label class="field-label">Account Name: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.accName" maxlength="200" placeholder="Venus Tech" />
                </div>

                <div class="form-row">
                  <label class="field-label">Contact Person: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.contactName" maxlength="100" placeholder="Van Muithineni" />
                </div>

                <div class="form-row">
                  <label class="field-label">Address 1: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.address1" maxlength="200" placeholder="13568 Cedar Run Ln" />
                </div>

                <div class="form-row">
                  <label class="field-label">Address 2:</label>
                  <input class="form-control" [(ngModel)]="local.address2" maxlength="200" />
                </div>

                <div class="form-row">
                  <label class="field-label">City: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.city" maxlength="100" placeholder="Herndon" />
                </div>

                <div class="form-row">
                  <label class="field-label">State: <span class="required">*</span></label>
                  <div class="select-wrapper">
                    <select class="form-control select-box" [(ngModel)]="local.state">
                      <option [ngValue]="null">--Select State--</option>
                      <option *ngFor="let s of usStates" [ngValue]="s.id">{{ s.name }} ({{ s.abbr }})</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="form-column">
                <div class="form-row">
                  <label class="field-label">Zipcode: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.zipcode" maxlength="10" placeholder="20171" />
                </div>

                <div class="form-row">
                  <label class="field-label">Email: <span class="required">*</span></label>
                  <input class="form-control" type="email" [(ngModel)]="local.eMail" maxlength="150" placeholder="contact@venustechllc.com" />
                </div>

                <div class="form-row">
                  <label class="field-label">Phone 1: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.phone1" (input)="local.phone1 = formatPhoneNumber(local.phone1)" maxlength="12" placeholder="202-683-6263" />
                  <span class="help-text">(Format: 111-111-1111 or 111-111-1111 x123)</span>
                </div>

                <div class="form-row">
                  <label class="field-label">Phone 2:</label>
                  <input class="form-control" [(ngModel)]="local.phone2" (input)="local.phone2 = formatPhoneNumber(local.phone2)" maxlength="12" placeholder="202-683-6264" />
                  <span class="help-text">(Format: 111-111-1111 or 111-111-1111 x123)</span>
                </div>

                <div class="form-row">
                  <label class="field-label">Fax:</label>
                  <input class="form-control" [(ngModel)]="local.fax" (input)="local.fax = formatPhoneNumber(local.fax)" maxlength="12" />
                  <span class="help-text">(Format: 111-111-1111)</span>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Admin View: Full Layout with All Fields -->
          <ng-container *ngIf="isAdmin">
            <h3 class="section-heading">Account Information</h3>
            <div class="form-grid">
              <!-- Left Column -->
              <div class="column">
                <div class="form-row">
                  <label class="field-label">Account Name: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.accName" maxlength="200" placeholder="Venus Tech" />
                </div>

                <div class="form-row">
                  <label class="field-label">Contact Person: <span class="required">*</span></label>
                  <input class="form-control" [(ngModel)]="local.contactName" maxlength="100" placeholder="Van Muithineni" />
                </div>

                <div class="form-row">
                  <label class="field-label">Email: <span class="required">*</span></label>
                  <input class="form-control" type="email" [(ngModel)]="local.eMail" maxlength="150" placeholder="contact&#64;venustechllc.com" />
                </div>

                <div class="form-row">
                  <label class="field-label">URL:</label>
                  <input class="form-control" [(ngModel)]="local.url" maxlength="250" placeholder="https://www.example.com" />
                </div>

                <div class="form-row">
                  <label class="field-label">Phone 1:</label>
                  <input class="form-control" [(ngModel)]="local.phone1" (input)="local.phone1 = formatPhoneNumber(local.phone1)" maxlength="12" placeholder="202-683-6263" />
                  <span class="help-text">(Format: 111-111-1111)</span>
                </div>

                <div class="form-row">
                  <label class="field-label">Phone 2:</label>
                  <input class="form-control" [(ngModel)]="local.phone2" (input)="local.phone2 = formatPhoneNumber(local.phone2)" maxlength="12" placeholder="202-683-6264" />
                  <span class="help-text">(Format: 111-111-1111)</span>
                </div>

                <div class="form-row">
                  <label class="field-label">Fax:</label>
                  <input class="form-control" [(ngModel)]="local.fax" (input)="local.fax = formatPhoneNumber(local.fax)" maxlength="12" />
                  <span class="help-text">(Format: 111-111-1111)</span>
                </div>
              </div>

              <!-- Right Column -->
              <div class="column">
                <div class="form-row">
                  <label class="field-label">Address 1:</label>
                  <input class="form-control" [(ngModel)]="local.address1" maxlength="200" placeholder="13568 Cedar Run Ln" />
                </div>

                <div class="form-row">
                  <label class="field-label">Address 2:</label>
                  <input class="form-control" [(ngModel)]="local.address2" maxlength="200" />
                </div>

                <div class="form-row">
                  <label class="field-label">City:</label>
                  <input class="form-control" [(ngModel)]="local.city" maxlength="100" placeholder="Herndon" />
                </div>

                <div class="form-row">
                  <label class="field-label">State:</label>
                  <div class="select-wrapper">
                    <select class="form-control select-box" [(ngModel)]="local.state">
                      <option [ngValue]="null">--Select State--</option>
                      <option *ngFor="let s of usStates" [ngValue]="s.id">{{ s.name }} ({{ s.abbr }})</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <label class="field-label">Zip Code:</label>
                  <input class="form-control" [(ngModel)]="local.zipcode" maxlength="10" placeholder="20171" />
                </div>

                <div class="form-row">
                  <label class="field-label">Start Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.startDateStr" />
                </div>

                <div class="form-row">
                  <label class="field-label">Expire Date:</label>
                  <input class="form-control" type="date" [(ngModel)]="local.expireDateStr" />
                </div>
              </div>
            </div>

            <!-- Seeds / Limits -->
            <div class="divider-section"></div>
            <h3 class="section-heading">Seeds / Limits</h3>
            <div class="seeds-grid">
              <div class="form-row">
                <label class="field-label">Company Seeds:</label>
                <input class="form-control" type="number" [(ngModel)]="local.companySeeds" min="0" />
              </div>
              <div class="form-row">
                <label class="field-label">Tariff Seeds:</label>
                <input class="form-control" type="number" [(ngModel)]="local.tariffSeeds" min="0" />
              </div>
              <div class="form-row">
                <label class="field-label">User Seeds:</label>
                <input class="form-control" type="number" [(ngModel)]="local.userSeeds" min="0" />
              </div>
            </div>

            <!-- Options -->
            <div class="divider-section"></div>
            <h3 class="section-heading">Options</h3>
            <div class="options-row">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="local.isActive" />
                <span class="cb-box"></span>
                <span class="label-text">Is Active</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="local.isAllowCompAdd" />
                <span class="cb-box"></span>
                <span class="label-text">Allow Company Add</span>
              </label>
            </div>
          </ng-container>
        </div>

        <footer class="modal-footer">
          <button class="btn-modal btn-submit" (click)="doSave()">Save</button>
          <button class="btn-modal btn-reset" (click)="reset()">Reset</button>
          <button class="btn-modal btn-submit" *ngIf="isAdd && isAdmin" (click)="fillDummyData()">Test Data</button>
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
      overflow-y: auto;
      padding: 40px 20px;
    }

    .modal {
      background: #ffffff;
      width: 100%;
      max-width: 680px;
      margin: auto;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      animation: modalSlideIn 0.3s ease-out;
      display: flex;
      flex-direction: column;
    }

    @keyframes modalSlideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e0e5f2;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-shrink: 0;
    }

    .breadcrumb {
      font-size: 11px;
      color: #718096;
      margin-bottom: 4px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #2b3674;
      margin: 0;
    }

    .close-x {
      width: 36px;
      height: 36px;
      font-size: 24px;
      color: #a3aed0;
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      margin: -8px -8px 0 0;
      border-radius: 50%;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f4f7fe;
        color: #2b3674;
      }
    }

    .modal-body {
      padding: 24px 24px 16px;
      overflow-y: auto;
      max-height: 70vh;
    }

    .section-heading {
      font-size: 14px;
      font-weight: 700;
      color: #2b3674;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .customer-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    .form-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .seeds-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .form-grid, .seeds-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .modal-backdrop {
        padding: 10px;
      }
    }

    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: #4a5568;
    }

    .required { color: #e53e3e; }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e0e5f2;
      border-radius: 8px;
      font-size: 13px;
      color: #2d3748;
      background: #fff;
      transition: border-color 0.2s ease;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #47548c;
        box-shadow: 0 0 0 2px rgba(71, 84, 140, 0.1);
      }

      &::placeholder {
        color: #a0aec0;
      }
    }

    .select-wrapper {
      position: relative;
      &::after {
        content: '▼';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        color: #4a5568;
        pointer-events: none;
      }
    }

    .select-box {
      appearance: none;
    }

    .help-text {
      font-size: 11px;
      color: #718096;
      margin-top: 2px;
    }

    .divider-section {
      height: 1px;
      background: #0099cc;
      margin: 20px 0;
    }

    
    .options-row {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #4a5568;
      font-weight: 500;
      user-select: none;
      position: relative;

      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .cb-box {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid #cbd5e0;
        border-radius: 4px;
        background: #fff;
        transition: all 0.2s ease;
        flex-shrink: 0;
        position: relative;
      }

      input[type="checkbox"]:checked + .cb-box {
        background: #2b3674;
        border-color: #2b3674;

        &::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
      }

      .label-text {
        font-size: 13px;
      }
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e5f2;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .btn-modal {
      flex: 0 1 auto;
      min-width: 100px;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-modal.btn-submit,
    .btn-modal.btn-save {
      background: #2b3674;
      color: white;

      &:hover:not(:disabled) {
        background: #1e2551;
      }
    }

    .btn-modal.btn-reset {
      background: #718096;
      color: white;

      &:hover:not(:disabled) {
        background: #4a5568;
      }
    }

    .btn-modal.btn-cancel {
      background: #e2e8f0;
      color: #2d3748;

      &:hover:not(:disabled) {
        background: #cbd5e0;
      }
    }
  `]
})
export class UpdateAccountComponent implements OnChanges {
  @Input() account: any;
  @Input() open = false;
  @Input() isAdd = false;
  @Input() isAdmin = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saveEvent = new EventEmitter<any>();

  local: any = {};

  constructor(private toast: ToastService, private dateFormatter: DateFormatterService) {}

  
  usStates = [
    { id: 1, abbr: 'AL', name: 'Alabama' }, { id: 2, abbr: 'AK', name: 'Alaska' },
    { id: 3, abbr: 'AZ', name: 'Arizona' }, { id: 4, abbr: 'AR', name: 'Arkansas' },
    { id: 5, abbr: 'CA', name: 'California' }, { id: 6, abbr: 'CO', name: 'Colorado' },
    { id: 7, abbr: 'CT', name: 'Connecticut' }, { id: 8, abbr: 'DE', name: 'Delaware' },
    { id: 9, abbr: 'DC', name: 'District of Columbia' }, { id: 10, abbr: 'FL', name: 'Florida' },
    { id: 11, abbr: 'GA', name: 'Georgia' }, { id: 12, abbr: 'HI', name: 'Hawaii' },
    { id: 13, abbr: 'ID', name: 'Idaho' }, { id: 14, abbr: 'IL', name: 'Illinois' },
    { id: 15, abbr: 'IN', name: 'Indiana' }, { id: 16, abbr: 'IA', name: 'Iowa' },
    { id: 17, abbr: 'KS', name: 'Kansas' }, { id: 18, abbr: 'KY', name: 'Kentucky' },
    { id: 19, abbr: 'LA', name: 'Louisiana' }, { id: 20, abbr: 'ME', name: 'Maine' },
    { id: 21, abbr: 'MD', name: 'Maryland' }, { id: 22, abbr: 'MA', name: 'Massachusetts' },
    { id: 23, abbr: 'MI', name: 'Michigan' }, { id: 24, abbr: 'MN', name: 'Minnesota' },
    { id: 25, abbr: 'MS', name: 'Mississippi' }, { id: 26, abbr: 'MO', name: 'Missouri' },
    { id: 27, abbr: 'MT', name: 'Montana' }, { id: 28, abbr: 'NE', name: 'Nebraska' },
    { id: 29, abbr: 'NV', name: 'Nevada' }, { id: 30, abbr: 'NH', name: 'New Hampshire' },
    { id: 31, abbr: 'NJ', name: 'New Jersey' }, { id: 32, abbr: 'NM', name: 'New Mexico' },
    { id: 33, abbr: 'NY', name: 'New York' }, { id: 34, abbr: 'NC', name: 'North Carolina' },
    { id: 35, abbr: 'ND', name: 'North Dakota' }, { id: 36, abbr: 'OH', name: 'Ohio' },
    { id: 37, abbr: 'OK', name: 'Oklahoma' }, { id: 38, abbr: 'OR', name: 'Oregon' },
    { id: 39, abbr: 'PA', name: 'Pennsylvania' }, { id: 40, abbr: 'RI', name: 'Rhode Island' },
    { id: 41, abbr: 'SC', name: 'South Carolina' }, { id: 42, abbr: 'SD', name: 'South Dakota' },
    { id: 43, abbr: 'TN', name: 'Tennessee' }, { id: 44, abbr: 'TX', name: 'Texas' },
    { id: 45, abbr: 'UT', name: 'Utah' }, { id: 46, abbr: 'VT', name: 'Vermont' },
    { id: 47, abbr: 'VA', name: 'Virginia' }, { id: 48, abbr: 'WA', name: 'Washington' },
    { id: 49, abbr: 'WV', name: 'West Virginia' }, { id: 50, abbr: 'WI', name: 'Wisconsin' },
    { id: 51, abbr: 'WY', name: 'Wyoming' }
  ];

  ngOnChanges() {
    this.initializeData();
  }

  private initializeData() {
    if (this.isAdd) {
      this.local = {
        aid: null,
        accName: '',
        contactName: '',
        eMail: '',
        url: '',
        phone1: '',
        phone2: '',
        fax: '',
        address1: '',
        address2: '',
        city: '',
        state: null,
        zipcode: '',
        startDateStr: this.toDateInputStr(new Date()),
        expireDateStr: '',
        companySeeds: 0,
        tariffSeeds: 0,
        userSeeds: 0,
        isActive: true,
        isAllowCompAdd: true
      };
    } else if (this.account) {
      console.log('[UPDATE-ACCOUNT] Received account:', this.account);
      
      
      this.local = {
        aid: this.account.aid ?? this.account.Aid ?? null,
        accName: this.account.accName ?? this.account.AccName ?? this.account.name ?? this.account.accountName ?? '',
        contactName: this.account.contactName ?? this.account.ContactName ?? this.account.contactPerson ?? this.account.ContactPerson ?? '',
        eMail: this.account.eMail ?? this.account.EMail ?? this.account.email ?? this.account.Email ?? '',
        url: this.account.url ?? this.account.URL ?? this.account.Url ?? '',
        phone1: this.account.phone1 ?? this.account.Phone1 ?? this.account.phone_1 ?? '',
        phone2: this.account.phone2 ?? this.account.Phone2 ?? this.account.phone_2 ?? '',
        fax: this.account.fax ?? this.account.Fax ?? '',
        address1: this.account.address1 ?? this.account.Address1 ?? '',
        address2: this.account.address2 ?? this.account.Address2 ?? '',
        city: this.account.city ?? this.account.City ?? '',
        state: this.account.state ?? this.account.state_id ?? (this.account.State ? this.findStateId(this.account.State) : null),
        zipcode: this.account.zipcode ?? this.account.ZipCode ?? this.account.zipCode ?? '',
        companySeeds: this.account.companySeeds ?? this.account.CompanySeeds ?? 0,
        tariffSeeds: this.account.tariffSeeds ?? this.account.TariffSeeds ?? 0,
        userSeeds: this.account.userSeeds ?? this.account.UserSeeds ?? 0,
        isActive: this.account.isActive ?? this.account.IsActive ?? false,
        isAllowCompAdd: this.account.isAllowCompAdd ?? this.account.IsAllowCompAdd ?? false,
        startDateStr: this.toDateInputStr(this.account.startDate ?? this.account.StartDate ?? this.account.SDate),
        expireDateStr: this.toDateInputStr(this.account.expireDate ?? this.account.ExpireDate ?? this.account.EDate),
        modifiedUID: this.account.modifiedUID ?? this.account.ModifiedUID ?? 1
      };
      
      console.log('[UPDATE-ACCOUNT] Initialized local:', this.local);
    } else {
      this.local = {};
    }
  }

  private findStateId(abbr: string | null): number | null {
    if (!abbr) return null;
    const state = this.usStates.find(s => s.abbr === abbr);
    return state ? state.id : null;
  }

  
  private toDateInputStr(val: any): string {
    return this.dateFormatter.formatToInputDate(val);
  }

  
  private toISODateTime(dateStr: string): string | null {
    if (!dateStr) return null;
    return this.dateFormatter.formatToIsoWithTime(dateStr) || null;
  }

  close() {
    this.open = false;
    this.openChange.emit(false);
  }

  reset() {
    this.initializeData();
  }

  formatPhoneNumber(value: any): string {
    if (!value) return '';
    let cleaned = value.toString().replace(/\D/g, '');
    cleaned = cleaned.substring(0, 10);
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  fillDummyData() {
    this.local.accName = 'Test Account Demo';
    this.local.contactName = 'John Doe';
    this.local.eMail = 'test@venustechllc.com';
    this.local.url = 'https://www.venustechllc.com';
    this.local.phone1 = '202-683-6263';
    this.local.phone2 = '202-683-6264';
    this.local.fax = '';
    this.local.address1 = '13568 Cedar Run Ln';
    this.local.address2 = '';
    this.local.city = 'Herndon';
    this.local.state = 47; 
    this.local.zipcode = '20171';
    const today = new Date();
    this.local.startDateStr = this.toDateInputStr(today);
    const expiry = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    this.local.expireDateStr = this.toDateInputStr(expiry);
    this.local.companySeeds = 10;
    this.local.tariffSeeds = 50;
    this.local.userSeeds = 20;
    this.local.isActive = true;
    this.local.isAllowCompAdd = true;
  }

  doSave() {
    console.log('[UPDATE-ACCOUNT] doSave called, this.local:', this.local);
    
    
    if (!this.local.accName?.trim()) { this.toast.warning('Account Name is required'); return; }
    if (!this.local.contactName?.trim()) { this.toast.warning('Contact Person is required'); return; }
    if (!this.local.eMail?.trim()) { this.toast.warning('Email is required'); return; }

    
    const payload: any = {
      id: this.local.aid ?? this.account?.aid ?? this.account?.Aid ?? 0,
      aid: this.local.aid ?? 0,
      AID: this.local.aid ?? this.account?.aid ?? this.account?.Aid ?? 0,
      accName: this.local.accName?.trim(),
      AccName: this.local.accName?.trim(),
      accountName: this.local.accName?.trim(),
      contactName: this.local.contactName?.trim(),
      eMail: this.local.eMail?.trim(),
      url: this.local.url?.trim() || '',
      phone1: this.local.phone1 || '',
      phone2: this.local.phone2 || '',
      fax: this.local.fax || '',
      address1: this.local.address1?.trim() || '',
      address2: this.local.address2?.trim() || '',
      city: this.local.city?.trim() || '',
      state: this.local.state ?? 0,
      zipcode: this.local.zipcode?.trim() || '',
      startDate: this.toISODateTime(this.local.startDateStr),
      expireDate: this.toISODateTime(this.local.expireDateStr),
      companySeeds: Number(this.local.companySeeds) || 0,
      tariffSeeds: Number(this.local.tariffSeeds) || 0,
      userSeeds: Number(this.local.userSeeds) || 0,
      isActive: !!this.local.isActive,
      isAllowCompAdd: !!this.local.isAllowCompAdd,
      modifiedUID: this.local.modifiedUID ?? 0
    };

    console.log('[UPDATE-ACCOUNT] Payload to emit:', payload);
    this.saveEvent.emit(payload);
    this.close();
  }
}
