import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { FERCFilingValidator } from '../../core/validators/ferc-filing.validator';

@Component({
  selector: 'app-mbr-filing-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filing-form-container">
      <h2>MBR Filing Submission</h2>
      
      <!-- Reporting Entity CID Field -->
      <div class="form-group">
        <label>Company Identifier (Reporting Entity CID) <span class="required">*</span></label>
        <input 
          type="text" 
          placeholder="e.g., C991990"
          [(ngModel)]="formData.reportingEntityCid"
          (input)="onCidInput()"
          [class.error]="cidError"
          class="form-control"
        />
        <small class="error-text" *ngIf="cidError">{{ cidError }}</small>
        <small class="hint-text">Format: C followed by 6 digits (e.g., C991990)</small>
      </div>

      <!-- eRegistered Email Field -->
      <div class="form-group">
        <label>eRegistered Email <span class="required">*</span></label>
        <input 
          type="email" 
          placeholder="your.email@company.com"
          [(ngModel)]="formData.eRegEmail"
          (input)="onEmailInput()"
          [class.error]="emailError"
          class="form-control"
        />
        <small class="error-text" *ngIf="emailError">{{ emailError }}</small>
        <small class="hint-text">Must be authorized for MBR submission on behalf of the CID</small>
      </div>

      <!-- Filing Date Field -->
      <div class="form-group">
        <label>Filing Date <span class="required">*</span></label>
        <input 
          type="text" 
          placeholder="MM/DD/YYYY"
          [(ngModel)]="formData.filingDate"
          (input)="onFilingDateInput()"
          [class.error]="filingDateError"
          class="form-control"
        />
        <small class="error-text" *ngIf="filingDateError">{{ filingDateError }}</small>
        <small class="hint-text">Date format: MM/DD/YYYY, YYYY-MM-DD, or DD/MM/YYYY</small>
      </div>

      <!-- Report Period Start Date Field -->
      <div class="form-group">
        <label>Report Period Start Date <span class="required">*</span></label>
        <input 
          type="text" 
          placeholder="MM/DD/YYYY"
          [(ngModel)]="formData.reportPeriodStart"
          (input)="onReportPeriodStartInput()"
          [class.error]="reportPeriodStartError"
          class="form-control"
        />
        <small class="error-text" *ngIf="reportPeriodStartError">{{ reportPeriodStartError }}</small>
        <small class="hint-text">Beginning of the reporting period</small>
      </div>

      <!-- Report Period End Date Field -->
      <div class="form-group">
        <label>Report Period End Date <span class="required">*</span></label>
        <input 
          type="text" 
          placeholder="MM/DD/YYYY"
          [(ngModel)]="formData.reportPeriodEnd"
          (input)="onReportPeriodEndInput()"
          [class.error]="reportPeriodEndError"
          class="form-control"
        />
        <small class="error-text" *ngIf="reportPeriodEndError">{{ reportPeriodEndError }}</small>
        <small class="hint-text">End of the reporting period</small>
      </div>

      <!-- Authorization Effective Date Field -->
      <div class="form-group">
        <label>Authorization Effective Date</label>
        <input 
          type="text" 
          placeholder="MM/DD/YYYY"
          [(ngModel)]="formData.authEffectiveDate"
          (input)="onAuthEffectiveDateInput()"
          [class.error]="authEffectiveDateError"
          class="form-control"
        />
        <small class="error-text" *ngIf="authEffectiveDateError">{{ authEffectiveDateError }}</small>
        <small class="hint-text">When this authorization becomes effective. Defaults to 01/01/1960 if not provided</small>
      </div>

      <!-- Authorization Expiry Date Field -->
      <div class="form-group">
        <label>Authorization Expiry Date</label>
        <input 
          type="text" 
          placeholder="MM/DD/YYYY"
          [(ngModel)]="formData.authExpiryDate"
          (input)="onAuthExpiryDateInput()"
          [class.error]="authExpiryDateError"
          class="form-control"
        />
        <small class="error-text" *ngIf="authExpiryDateError">{{ authExpiryDateError }}</small>
        <small class="hint-text">When this authorization expires</small>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button 
          class="btn btn-primary" 
          (click)="onSubmit()"
          [disabled]="!isFormValid"
        >
          Submit Filing
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filing-form-container {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    h2 {
      margin-bottom: 20px;
      color: #2B3674;
    }

    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .required {
      color: #E31A1A;
    }

    .form-control {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #2B3674;
      box-shadow: 0 0 4px rgba(43, 54, 116, 0.2);
    }

    .form-control.error {
      border-color: #E31A1A;
      background-color: #fff5f5;
    }

    .error-text {
      color: #E31A1A;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .hint-text {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
      font-style: italic;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #2B3674;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1f2652;
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class MbrFilingFormComponent {
  formData = {
    reportingEntityCid: '',
    eRegEmail: '',
    filingDate: '',
    reportPeriodStart: '',
    reportPeriodEnd: '',
    authEffectiveDate: '',
    authExpiryDate: ''
  };

  cidError: string | null = null;
  emailError: string | null = null;
  filingDateError: string | null = null;
  reportPeriodStartError: string | null = null;
  reportPeriodEndError: string | null = null;
  authEffectiveDateError: string | null = null;
  authExpiryDateError: string | null = null;

  lastCidValidationToast: string | null = null;
  lastEmailValidationToast: string | null = null;
  lastFilingDateToast: string | null = null;
  lastReportPeriodStartToast: string | null = null;
  lastReportPeriodEndToast: string | null = null;
  lastAuthEffectiveDateToast: string | null = null;
  lastAuthExpiryDateToast: string | null = null;

  get isFormValid(): boolean {
    return !this.cidError && !this.emailError && 
           !this.filingDateError && !this.reportPeriodStartError && !this.reportPeriodEndError &&
           this.formData.reportingEntityCid.trim() !== '' && 
           this.formData.eRegEmail.trim() !== '' &&
           this.formData.filingDate.trim() !== '' &&
           this.formData.reportPeriodStart.trim() !== '' &&
           this.formData.reportPeriodEnd.trim() !== '';
  }

  constructor(private toast: ToastService) {}

  onCidInput() {
    const cid = this.formData.reportingEntityCid;
    this.cidError = FERCFilingValidator.getCidErrorMessage(cid);

    
    const isValid = FERCFilingValidator.validateReportingEntityCid(cid);
    const toastMsg = isValid ? `✓ Valid CID: ${cid.toUpperCase()}` : (this.cidError || '');

    
    if (toastMsg && toastMsg !== this.lastCidValidationToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else {
        this.toast.warning(toastMsg);
      }
      this.lastCidValidationToast = toastMsg;
    }
  }

  onEmailInput() {
    const email = this.formData.eRegEmail;
    this.emailError = FERCFilingValidator.getEmailErrorMessage(email);

    
    const isValid = FERCFilingValidator.validateERegEmail(email);
    const toastMsg = isValid ? `✓ Valid email: ${email}` : (this.emailError || '');

    
    if (toastMsg && toastMsg !== this.lastEmailValidationToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else {
        this.toast.warning(toastMsg);
      }
      this.lastEmailValidationToast = toastMsg;
    }
  }

  onFilingDateInput() {
    const date = this.formData.filingDate;
    this.filingDateError = FERCFilingValidator.getDateErrorMessage(date);

    
    const isValid = FERCFilingValidator.validateDate(date);
    const toastMsg = isValid ? `✓ Valid filing date: ${date}` : (this.filingDateError || '');

    if (toastMsg && toastMsg !== this.lastFilingDateToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else {
        this.toast.warning(toastMsg);
      }
      this.lastFilingDateToast = toastMsg;
    }
  }

  onReportPeriodStartInput() {
    const date = this.formData.reportPeriodStart;
    this.reportPeriodStartError = FERCFilingValidator.getDateErrorMessage(date);

    
    const isValid = FERCFilingValidator.validateDate(date);
    const toastMsg = isValid ? `✓ Valid start date: ${date}` : (this.reportPeriodStartError || '');

    if (toastMsg && toastMsg !== this.lastReportPeriodStartToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else {
        this.toast.warning(toastMsg);
      }
      this.lastReportPeriodStartToast = toastMsg;
    }
  }

  onReportPeriodEndInput() {
    const date = this.formData.reportPeriodEnd;
    this.reportPeriodEndError = FERCFilingValidator.getDateErrorMessage(date);

    
    const isValid = FERCFilingValidator.validateDate(date);
    const toastMsg = isValid ? `✓ Valid end date: ${date}` : (this.reportPeriodEndError || '');

    if (toastMsg && toastMsg !== this.lastReportPeriodEndToast) {
      if (isValid) {
        this.toast.success(toastMsg);
      } else {
        this.toast.warning(toastMsg);
      }
      this.lastReportPeriodEndToast = toastMsg;
    }
  }

  onAuthEffectiveDateInput() {
    const date = this.formData.authEffectiveDate;
    
    if (date.trim()) {
      this.authEffectiveDateError = FERCFilingValidator.getDateErrorMessage(date);

      const isValid = FERCFilingValidator.validateDate(date);
      const toastMsg = isValid ? `✓ Valid effective date: ${date}` : (this.authEffectiveDateError || '');

      if (toastMsg && toastMsg !== this.lastAuthEffectiveDateToast) {
        if (isValid) {
          this.toast.success(toastMsg);
        } else {
          this.toast.warning(toastMsg);
        }
        this.lastAuthEffectiveDateToast = toastMsg;
      }
    } else {
      this.authEffectiveDateError = null;
    }
  }

  onAuthExpiryDateInput() {
    const date = this.formData.authExpiryDate;
    
    if (date.trim()) {
      this.authExpiryDateError = FERCFilingValidator.getDateErrorMessage(date);

      const isValid = FERCFilingValidator.validateDate(date);
      const toastMsg = isValid ? `✓ Valid expiry date: ${date}` : (this.authExpiryDateError || '');

      if (toastMsg && toastMsg !== this.lastAuthExpiryDateToast) {
        if (isValid) {
          this.toast.success(toastMsg);
        } else {
          this.toast.warning(toastMsg);
        }
        this.lastAuthExpiryDateToast = toastMsg;
      }
    } else {
      this.authExpiryDateError = null;
    }
  }

  onSubmit() {
    
    const validation = FERCFilingValidator.validateFilingSubmission(
      this.formData.reportingEntityCid,
      this.formData.eRegEmail
    );

    if (!validation.valid) {
      this.toast.error('Please fix the errors before submitting');
      return;
    }

    
    if (!FERCFilingValidator.validateDate(this.formData.filingDate)) {
      this.toast.error('Filing Date is invalid');
      return;
    }

    if (!FERCFilingValidator.validateDate(this.formData.reportPeriodStart)) {
      this.toast.error('Report Period Start Date is invalid');
      return;
    }

    if (!FERCFilingValidator.validateDate(this.formData.reportPeriodEnd)) {
      this.toast.error('Report Period End Date is invalid');
      return;
    }

    
    if (!this.formData.authEffectiveDate || this.formData.authEffectiveDate.trim() === '') {
      this.formData.authEffectiveDate = '01/01/1960';
      this.toast.info('Authorization Effective Date defaulted to 01/01/1960');
    }

    
    if (this.formData.authEffectiveDate.trim() && 
        !FERCFilingValidator.validateDate(this.formData.authEffectiveDate)) {
      this.toast.error('Authorization Effective Date is invalid');
      return;
    }

    if (this.formData.authExpiryDate.trim() && 
        !FERCFilingValidator.validateDate(this.formData.authExpiryDate)) {
      this.toast.error('Authorization Expiry Date is invalid');
      return;
    }

    
    console.log('Submitting filing with:', this.formData);
    this.toast.success('Filing submitted successfully!');
    
    
  }
}
