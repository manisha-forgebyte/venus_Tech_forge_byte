import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SanitizeInputDirective],
  template: `
    <div class="modal-overlay" *ngIf="open" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="breadcrumbs">MBRDB >> Update Profile</div>
            <h2 class="modal-title">My Profile</h2>
          </div>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>

        <div class="modal-body">
          <div class="form-two-col">
            <!-- Left Column -->
            <div class="form-col">
              <div class="form-group">
                <label class="field-label">First Name : <span class="required">*</span></label>
                <input type="text" [(ngModel)]="formData.firstName" class="form-control">
              </div>
              <div class="form-group">
                <label class="field-label">Last Name : <span class="required">*</span></label>
                <input type="text" [(ngModel)]="formData.lastName" class="form-control">
              </div>
              <div class="form-group">
                <label class="field-label">Work Phone :</label>
                <input type="text" [(ngModel)]="formData.workPhone" (input)="formData.workPhone = formatPhoneNumber(formData.workPhone)" class="form-control" placeholder="XXX-XXX-XXXX">
                <small class="helper-text">(Format: 984-801-2345)</small>
              </div>
              <div class="form-group">
                <label class="field-label">Mobile Phone :</label>
                <input type="text" [(ngModel)]="formData.mobilePhone" (input)="formData.mobilePhone = formatPhoneNumber(formData.mobilePhone)" class="form-control" placeholder="XXX-XXX-XXXX">
                <small class="helper-text">(Format: 984-801-2345)</small>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-col">
              <div class="form-group">
                <label class="field-label">Email : <span class="required">*</span></label>
                <input type="email" [(ngModel)]="formData.email" class="form-control">
              </div>
              <div class="form-group">
                <label class="field-label">Change password</label>
                <label style="display:flex; align-items:center; gap:12px; margin-top:6px;">
                  <input type="checkbox" [(ngModel)]="formData.changePassword" />
                  <span style="font-size:13px; color:#475569;">Show password fields to update your password</span>
                </label>
                <small class="helper-text">(Leave unchecked to keep your existing password.)</small>
              </div>
              <div class="form-group" *ngIf="formData.changePassword">
                <label class="field-label">New Password</label>
                <input type="password" [(ngModel)]="formData.password" class="form-control" placeholder="Enter new password (optional)" />
                <small class="helper-text">(Optional: provide both fields to change password — min 6 chars, must include letters and numbers.)</small>
              </div>
              <div class="form-group" *ngIf="formData.changePassword">
                <label class="field-label">Confirm New Password</label>
                <input type="password" [(ngModel)]="formData.confirmPassword" class="form-control" placeholder="Confirm new password" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-modal btn-submit" (click)="onUpdate()">Update</button>
          <button class="btn-modal btn-reset" (click)="onReset()">Reset</button>
          <button class="btn-modal btn-cancel" (click)="closeModal()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../styles/variables';

    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(4px);
    }

    .modal-container {
      background: #fff; width: 90%; max-width: 900px;
      border-radius: $border-radius-lg; box-shadow: $modal-shadow;
      overflow: hidden; display: flex; flex-direction: column;
    }

    .modal-header {
      padding: 24px 32px; display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 1px solid $border-light;
      .breadcrumbs { font-size: 13px; color: $text-muted; margin-bottom: 4px; font-weight: 500; }
      .modal-title { font-size: 22px; color: $primary-navy; margin: 0; font-weight: 700; }
      .close-btn { background: none; border: none; font-size: 28px; color: $text-muted; cursor: pointer; &:hover { color: $primary-navy; } }
    }

    .modal-body { padding: 32px; max-height: 70vh; overflow-y: auto; }
    .form-two-col { display: flex; gap: 40px; }
    .form-col { flex: 1; display: flex; flex-direction: column; gap: 24px; }

    .form-group {
      display: flex; flex-direction: column; gap: 8px;
      .required { color: $danger; }
      .helper-text { font-size: 11px; color: #718096; margin-top: 2px; }
    }

    .modal-footer {
      padding: 24px 32px; border-top: 1px solid $border-light; display: flex; justify-content: center; gap: 12px;

      .btn-modal {
        flex: 1;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #2B3674;
        color: white;
        text-align: center;

        &:hover:not(:disabled) {
          background: darken(#2B3674, 5%);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &.btn-submit,
        &.btn-save {
          background: #2B3674;
        }

        &.btn-reset {
          background: #718096;
          &:hover:not(:disabled) { background: darken(#718096, 8%); }
        }

        &.btn-cancel {
          background: #E2E8F0;
          color: #2D3748;
          &:hover:not(:disabled) {
            background: #CBD5E0;
          }
        }
      }
    }

    @media (max-width: $breakpoint-sm) {
      .form-two-col { flex-direction: column; }
    }
  `]
})
export class UpdateProfileComponent implements OnChanges {
  @Input() open = false;
  @Input() profile: any = {};
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saveEvent = new EventEmitter<any>();

  formData = {
    uid: 0,
    firstName: '',
    lastName: '',
    email: '',
    
    changePassword: false,
    password: '',
    confirmPassword: '',
    workPhone: '',
    mobilePhone: ''
  };

  constructor(private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile && Object.keys(this.profile).length > 0) {
      this.formData = { 
        ...this.formData,
        uid: this.profile.uid ?? 0,
        firstName: this.profile.firstName ?? '',
        lastName: this.profile.lastName ?? '',
        email: this.profile.email ?? '',
        workPhone: this.profile.workPhone ?? '',
        mobilePhone: this.profile.mobilePhone ?? ''
      };
      
      this.formData.changePassword = false;
      this.formData.password = '';
      this.formData.confirmPassword = '';
    }
  }

  closeModal() {
    this.open = false;
    this.openChange.emit(false);
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

  onUpdate() {
    
    if (!this.formData.firstName) { this.toast.warning('First Name is required'); return; }
    if (!this.formData.lastName) { this.toast.warning('Last Name is required'); return; }
    if (!this.formData.email) { this.toast.warning('Email is required'); return; }
    
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) { 
      this.toast.warning('Please enter a valid email address'); 
      return; 
    }

    
    if (this.formData.changePassword) {
      const pwd = (this.formData.password || '').toString();
      const cpwd = (this.formData.confirmPassword || '').toString();

      
      const hasAnyPwd = !!(pwd || cpwd);
      if (hasAnyPwd) {
        
        if (!pwd || !cpwd) { this.toast.warning('Please provide both password fields to update your password, or leave both empty to keep the current password.'); return; }
        if (pwd.length < 6) { this.toast.warning('Password must be at least 6 characters'); return; }
        if (!/[0-9]/.test(pwd)) { this.toast.warning('Password must contain at least one number'); return; }
        if (!/[a-zA-Z]/.test(pwd)) { this.toast.warning('Password must contain at least one letter'); return; }
        if (pwd !== cpwd) { this.toast.warning('Passwords do not match'); return; }
      }
    }

    
    const payload: any = {
      uid: this.formData.uid,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      workPhone: this.formData.workPhone,
      mobilePhone: this.formData.mobilePhone
    };

    if (this.formData.changePassword) {
      const pwd = (this.formData.password || '').toString();
      const cpwd = (this.formData.confirmPassword || '').toString();
      if (pwd && cpwd) {
        
        payload.password = pwd;
      }
    }

    this.saveEvent.emit(payload);
    this.closeModal();
  }

  onReset() {
    this.formData = { 
      uid: this.profile.uid ?? 0,
      firstName: this.profile.firstName ?? '',
      lastName: this.profile.lastName ?? '',
      email: this.profile.email ?? '',
      changePassword: false,
      password: '',
      confirmPassword: '',
      workPhone: this.profile.workPhone ?? '',
      mobilePhone: this.profile.mobilePhone ?? ''
    };
  }
}
