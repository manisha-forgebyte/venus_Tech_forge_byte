import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { ToastService } from '../../shared/services/toast.service';
import { FERCFilingValidator } from '../../core/validators/ferc-filing.validator';
import { DateFormatterService } from '../../core/services/date-formatter.service';

@Component({
  selector: 'app-update-company',
  standalone: true,
  imports: [CommonModule, FormsModule, SanitizeInputDirective],
  template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">eTariff >> {{ isAdd ? 'Add' : 'Update' }} Company</div>
            <h1 class="modal-title">{{ isAdd ? 'Add' : 'Update' }} Company</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <!-- Left Column -->
            <div class="column">
              <div class="form-row">
                <label class="field-label">Company ID: <span class="required">*</span></label>
                <input class="form-control" [class.error]="cidError" [(ngModel)]="local.company_id" (input)="onCompanyIdInput()" maxlength="10" />
                <small class="error-text" *ngIf="cidError">{{ cidError }}</small>
                <small class="hint-text">Format: C followed by 6 digits (e.g., C991990)</small>
              </div>

              <div class="form-row">
                <label class="field-label">FERC eReg Email: <span class="required">*</span></label>
                <input class="form-control" [class.error]="emailError" [(ngModel)]="local.validation_email" (input)="onEmailInput()" placeholder="user@example.com" maxlength="100" />
                <small class="error-text" *ngIf="emailError">{{ emailError }}</small>
                <small class="hint-text">Must be a valid eRegistered email authorized for MBR submission</small>
              </div>

              <div class="form-row">
                <label class="field-label">Company Name: <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="local.Title" placeholder="Company Name" maxlength="200" />
              </div>

              <div class="form-row">
                <label class="field-label">Notes:</label>
                <textarea class="form-control" rows="5" [(ngModel)]="local.description" maxlength="500"></textarea>
              </div>

              <div class="form-row">
                <label class="field-label">Account Group:</label>
                <div class="select-wrapper">
                  <select class="form-control select-box" [(ngModel)]="local.agid">
                    <option [ngValue]="null">--Select All--</option>
                    <option *ngFor="let g of groups" [ngValue]="g.agid">{{ g.groupName }}</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <label class="field-label">Contact Person: <span class="required" *ngIf="isAdd">*</span></label>
                <input class="form-control" [(ngModel)]="local.ContactName" maxlength="100" />
              </div>

              <div class="form-row">
                <label class="field-label">Billing Person:</label>
                <input class="form-control" [(ngModel)]="local.BillingName" maxlength="100" />
              </div>

              <div class="form-row">
                <label class="field-label">Phone 1:</label>
                <input class="form-control" [(ngModel)]="local.phone1" (input)="local.phone1 = formatPhoneNumber(local.phone1)" placeholder="984-801-2345" maxlength="12" />
                <span class="help-text">(Format: 984-801-2345)</span>
              </div>
            </div>

            <!-- Right Column -->
            <div class="column">
              <div class="form-row">
                <label class="field-label">FERC Password:</label>

                <ng-container *ngIf="!local.IsPassChange; else editPass">
                  <!-- Show masked placeholder when user is not changing password -->
                  <input class="form-control" type="password" [value]="'*'.repeat(local._existingPasswordMaskLength || 4)" disabled />
                </ng-container>

                <ng-template #editPass>
                  <!-- Editable password when user opts to change it -->
                  <input class="form-control" type="password" [(ngModel)]="local.FERCPassword" placeholder="Enter new FERC password" maxlength="50" />
                </ng-template>

                <small class="help-text" *ngIf="!local.IsPassChange">Current password is hidden. Check 'Add/Change FERC Password' to enter a new one.</small>
              </div>

              <div class="form-row checkbox-row">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="local.IsPassChange" />
                  <span class="cb-box"></span>
                  <span class="label-text">Add/Change FERC Password</span>
                </label>
              </div>

              <div class="form-row checkbox-row">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="local.IsActive" />
                  <span class="cb-box"></span>
                  <span class="label-text">Is Active</span>
                </label>
              </div>

              <div class="form-row">
                <label class="field-label">Contact Email: <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="local.email" maxlength="100" />
              </div>

              <div class="form-row">
                <label class="field-label">Billing Email:</label>
                <input class="form-control" [(ngModel)]="local.billing_email" maxlength="100" />
              </div>

              <div class="form-row">
                <label class="field-label">Phone 2:</label>
                <input class="form-control" [(ngModel)]="local.phone2" (input)="local.phone2 = formatPhoneNumber(local.phone2)" placeholder="984-801-2345" maxlength="12" />
                <span class="help-text">(Format: 984-801-2345)</span>
              </div>

              <div class="form-row">
                <label class="field-label">Start Date:</label>
                <div class="date-input-wrapper">
                  <input class="form-control" [class.error]="startDateError" [(ngModel)]="local.StartDate" (input)="onStartDateInput()" placeholder="MM/DD/YYYY" maxlength="10" />
                  <span class="calendar-icon" (click)="startDatePicker.showPicker()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <input #startDatePicker type="date" class="date-picker-hidden" (change)="onStartDatePickerChange(startDatePicker.value)" />
                </div>
                <small class="error-text" *ngIf="startDateError">{{ startDateError }}</small>
              </div>

              <div class="form-row">
                <label class="field-label">Expire Date:</label>
                <div class="date-input-wrapper">
                  <input class="form-control" [class.error]="expireDateError" [(ngModel)]="local.ExpireDate" (input)="onExpireDateInput()" placeholder="MM/DD/YYYY" maxlength="10" />
                  <span class="calendar-icon" (click)="expireDatePicker.showPicker()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <input #expireDatePicker type="date" class="date-picker-hidden" (change)="onExpireDatePickerChange(expireDatePicker.value)" />
                </div>
                <small class="error-text" *ngIf="expireDateError">{{ expireDateError }}</small>
              </div>
            </div>
          </div>

        </div>

        <footer class="modal-footer">
          <button class=\"btn-modal btn-submit\" (click)=\"doSave()\" [disabled]=\"isSaving\">{{ isSaving ? 'Saving...' : 'Save' }}</button>
          <button class=\"btn-modal btn-reset\" (click)=\"reset()\" [disabled]=\"isSaving\">Reset</button>
          <button class=\"btn-modal btn-submit\" (click)=\"fillDummyData()\" [disabled]=\"isSaving\" *ngIf=\"isAdd && isAdmin\">Test Data</button>
          <button class=\"btn-modal btn-cancel\" (click)=\"close()\" [disabled]=\"isSaving\">Cancel</button>
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
      padding: 32px 24px;
      overflow-y: visible;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .modal-backdrop {
        padding: 10px;
      }
    }

    .column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .required { color: #e53e3e; }

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

    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
      user-select: none;

      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .cb-box {
        width: 18px;
        height: 18px;
        background: #ffffff;
        border: 2px solid #2b3674;
        border-radius: 4px;
        position: relative;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .cb-box::after {
        content: '';
        position: absolute;
        display: none;
        left: 5px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input:checked ~ .cb-box {
        background: #2b3674;
      }

      input:checked ~ .cb-box::after {
        display: block;
      }
    }

    .section-heading {
      font-size: 16px;
      font-weight: 700;
      color: #2b3674;
      margin: 0 0 16px 0;
    }

    .modal-footer {
      padding: 24px;
      border-top: 1px solid #e0e5f2;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    
    .form-control.error {
      border-color: #E31A1A !important;
      background-color: #FFF5F5;
    }

    .date-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .form-control {
        flex: 1;
        padding-right: 36px;
      }

      .calendar-icon {
        position: absolute;
        right: 10px;
        cursor: pointer;
        color: #2b3674;
        user-select: none;
        display: flex;
        align-items: center;

        svg {
          display: block;
        }

        &:hover {
          color: #1e2551;
        }
      }

      .date-picker-hidden {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
        border: none;
        padding: 0;
      }
    }

    .error-text {
      color: #E31A1A;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
      display: block;
    }

    .hint-text {
      color: #718096;
      font-size: 11px;
      margin-top: 4px;
      display: block;
      font-style: italic;
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
export class UpdateCompanyComponent implements OnChanges {
  @Input() company: any;
  @Input() groups: any[] = [];
  @Input() open = false;
  @Input() isAdd = false;
  @Input() isAdmin = false;
  @Input() isSaving = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saveEvent = new EventEmitter<any>();

  local: any = {};
  cidError: string | null = null;
  emailError: string | null = null;
  startDateError: string | null = null;
  expireDateError: string | null = null;
  private lastCidToast: string | null = null;
  private lastEmailToast: string | null = null;
  private lastStartDateToast: string | null = null;
  private lastExpireDateToast: string | null = null;

  constructor(private toast: ToastService, private dateFormatter: DateFormatterService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['company'] && this.company) {
      
      this.local = { ...this.company };

      console.log('UpdateCompanyComponent received:', this.company);

      this.local.Title = this.local.Title ?? this.local.title ?? '';
      this.local.email = this.local.email ?? this.local.eMail ?? this.local.validation_email ?? this.local.validationEmail ?? '';
      this.local.validation_email = this.local.validation_email ?? this.local.validationEmail ?? '';
      this.local.ContactName = this.local.ContactName ?? this.local.contactName ?? this.local.contact_name ?? '';
      this.local.BillingName = this.local.BillingName ?? this.local.billingName ?? this.local.billing_name ?? '';
      this.local.phone1 = this.local.phone1 ?? this.local.phone_1 ?? '';
      this.local.phone2 = this.local.phone2 ?? this.local.phone_2 ?? '';
      this.local.StartDate = this.formatDateForInput(this.local.StartDate ?? this.local.startDate ?? this.local.SDate);
      this.local.ExpireDate = this.formatDateForInput(this.local.ExpireDate ?? this.local.expireDate ?? this.local.EDate);
      this.local.prog_code = this.local.prog_code ?? this.local.progCode ?? '';
      this.local.IsActive = this.local.IsActive ?? this.local.isActive ?? false;
      this.local.billing_email = this.local.billing_email ?? this.local.billingEmail ?? '';
      this.local.description = this.local.description ?? this.local.notes ?? '';

      
      this.local.isPassChange = !!(this.local.isPassChange || this.local.IsPassChange);
      this.local.IsPassChange = this.local.isPassChange; 

      
      this.local._existingPasswordMaskLength = (this.company && this.company.FERCPassword) ? this.company.FERCPassword.length : 8;

      
      this.local.FERCPassword = '';
    }
  }

  
  private formatDateForInput(dateValue: any): string | null {
    return this.dateFormatter.formatToInputDate(dateValue) || null;
  }

  close() { this.open = false; this.openChange.emit(false); }
  
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
    this.local.company_id = 'C999999';
    this.local.validation_email = 'test@venustech.com';
    this.local.Title = 'Test Company Demo';
    this.local.description = 'Auto-filled test data for development';
    this.local.ContactName = 'John Doe';
    this.local.BillingName = 'Jane Doe';
    this.local.phone1 = '984-801-2345';
    this.local.phone2 = '919-555-1234';
    this.local.email = 'contact@venustech.com';
    this.local.billing_email = 'billing@venustech.com';
    this.local.FERCPassword = '';
    this.local.IsPassChange = false;
  }

  reset() { 
    this.local = { ...this.company }; 
    this.local.IsPassChange = false; 
    this.local.FERCPassword = ''; 
    this.local._existingPasswordMaskLength = (this.company && this.company.FERCPassword) ? this.company.FERCPassword.length : 8;
    
    this.cidError = null;
    this.emailError = null;
    this.startDateError = null;
    this.expireDateError = null;
    this.lastCidToast = null;
    this.lastEmailToast = null;
    this.lastStartDateToast = null;
    this.lastExpireDateToast = null;
  }
  doSave() { 
    
    const cidError = FERCFilingValidator.getCidErrorMessage(this.local.company_id || '');
    if (cidError) {
      this.cidError = cidError;
      this.toast.error(`Company ID: ${cidError}`);
      return;
    }

    
    const emailError = FERCFilingValidator.getEmailErrorMessage(this.local.validation_email || '');
    if (emailError) {
      this.emailError = emailError;
      this.toast.error(`FERC eReg Email: ${emailError}`);
      return;
    }

    
    if (!this.local.Title) {
      this.toast.warning('Company Name is required');
      return;
    }

    
    if (this.local.StartDate) {
      const startErr = FERCFilingValidator.getDateErrorMessage(this.local.StartDate);
      if (startErr) {
        this.startDateError = startErr;
        this.toast.error(`Start Date: ${startErr}`);
        return;
      }
    }

    if (this.local.ExpireDate) {
      const expireErr = FERCFilingValidator.getDateErrorMessage(this.local.ExpireDate);
      if (expireErr) {
        this.expireDateError = expireErr;
        this.toast.error(`Expire Date: ${expireErr}`);
        return;
      }
    }

    if (this.local.IsPassChange) {
      
      this.local.isPassChange = true;
    } else {
      
      delete this.local.FERCPassword;
      this.local.isPassChange = false;
    }

    const payload = {
      ...this.local,
      cid: this.local.cid ?? this.company?.cid ?? this.company?.CID ?? this.company?.Cid ?? null,
      CID: this.local.cid ?? this.company?.cid ?? this.company?.CID ?? this.company?.Cid ?? null,
      aid: this.local.aid ?? this.company?.aid ?? this.company?.Aid ?? null,
      AID: this.local.aid ?? this.company?.aid ?? this.company?.Aid ?? null,
      agid: this.local.agid ?? this.company?.agid ?? this.company?.AGID ?? null,
      AGID: this.local.agid ?? this.company?.agid ?? this.company?.AGID ?? null,
      company_id: this.local.company_id ?? this.company?.company_id ?? this.company?.companyId ?? '',
      companyId: this.local.companyId ?? this.local.company_id ?? this.company?.companyId ?? '',
      CompanyID: this.local.companyId ?? this.local.company_id ?? this.company?.companyId ?? '',
    };

    this.saveEvent.emit(payload);
    this.close();
  }

  onCompanyIdInput() {
    const cid = this.local.company_id || '';
    this.cidError = FERCFilingValidator.getCidErrorMessage(cid);

    
    const isValid = FERCFilingValidator.validateReportingEntityCid(cid);
    const toastMsg = isValid ? `✓ Valid Company ID: ${cid.toUpperCase()}` : (this.cidError || '');

    if (toastMsg && toastMsg !== this.lastCidToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else if (this.cidError) {
        this.toast.warning(toastMsg);
      }
      this.lastCidToast = toastMsg;
    }
  }

  onEmailInput() {
    const email = this.local.validation_email || '';
    this.emailError = FERCFilingValidator.getEmailErrorMessage(email);

    
    const isValid = FERCFilingValidator.validateERegEmail(email);
    const toastMsg = isValid ? `✓ Valid eReg Email: ${email}` : (this.emailError || '');

    if (toastMsg && toastMsg !== this.lastEmailToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else if (this.emailError) {
        this.toast.warning(toastMsg);
      }
      this.lastEmailToast = toastMsg;
    }
  }

  onStartDateInput() {
    const date = this.local.StartDate || '';
    
    if (date.trim()) {
      this.startDateError = FERCFilingValidator.getDateErrorMessage(date);

      const isValid = FERCFilingValidator.validateDate(date);
      const toastMsg = isValid ? `✓ Valid start date: ${date}` : (this.startDateError || '');

      if (toastMsg && toastMsg !== this.lastStartDateToast) {
        if (isValid) {
          this.toast.success(toastMsg);
        } else {
          this.toast.warning(toastMsg);
        }
        this.lastStartDateToast = toastMsg;
      }
    } else {
      this.startDateError = null;
    }
  }

  onExpireDateInput() {
    const date = this.local.ExpireDate || '';
    
    if (date.trim()) {
      this.expireDateError = FERCFilingValidator.getDateErrorMessage(date);

      const isValid = FERCFilingValidator.validateDate(date);
      const toastMsg = isValid ? `✓ Valid expire date: ${date}` : (this.expireDateError || '');

      if (toastMsg && toastMsg !== this.lastExpireDateToast) {
        if (isValid) {
          this.toast.success(toastMsg);
        } else {
          this.toast.warning(toastMsg);
        }
        this.lastExpireDateToast = toastMsg;
      }
    } else {
      this.expireDateError = null;
    }
  }

  
  private isoToDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return isoDate;
  }

  onStartDatePickerChange(isoValue: string): void {
    if (isoValue) {
      this.local.StartDate = this.isoToDisplay(isoValue);
      this.onStartDateInput();
    }
  }

  onExpireDatePickerChange(isoValue: string): void {
    if (isoValue) {
      this.local.ExpireDate = this.isoToDisplay(isoValue);
      this.onExpireDateInput();
    }
  }
}
