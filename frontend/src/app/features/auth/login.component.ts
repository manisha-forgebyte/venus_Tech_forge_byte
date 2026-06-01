import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SanitizeInputDirective],
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-header">
            <div class="lock-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
            </div>
            <h1>Welcome Back</h1>
            <p class="subtitle">Sign in to access your account</p>
          </div>

          <!-- Error Message Display -->
          <div class="alert alert-error" *ngIf="errorMessage">
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Success Message Display -->
          <div class="alert alert-success" *ngIf="successMessage">
            <span class="success-icon">✅</span>
            {{ successMessage }}
          </div>

          <!-- Loading Indicator -->
          <div class="alert alert-info" *ngIf="isLoading">
            <span class="loading-spinner">⏳</span>
            Authenticating...
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">
                <span class="icon">✉</span>
                Email Address
                <span class="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="user@example.com"
                maxlength="100"
                class="form-control"
                [class.is-invalid]="isEmailInvalid"
                [disabled]="isLoading"
              />
              <small class="error-message" *ngIf="isEmailInvalid">
                <span class="error-icon">⭕</span>
                <span *ngIf="loginForm.get('email')?.errors?.['maxlength']">Email must be at most 100 characters</span>
                <span *ngIf="!loginForm.get('email')?.errors?.['maxlength']">Please enter a valid email address</span>
              </small>
            </div>

            <div class="form-group">
              <label for="password">
                <span class="icon">🔒</span>
                Password
                <span class="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••••"
                maxlength="15"
                class="form-control"
                [class.is-invalid]="isPasswordInvalid"
                [disabled]="isLoading"
              />
              <small class="error-message" *ngIf="isPasswordInvalid">
                <span class="error-icon">⭕</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                <span *ngIf="loginForm.get('password')?.errors?.['maxlength']">Password cannot exceed 15 characters</span>
                <span *ngIf="!loginForm.get('password')?.errors?.['minlength'] && !loginForm.get('password')?.errors?.['maxlength']">Please enter a valid password</span>
              </small>
              <small class="help-text">
                Forgot password? Contact your account admin to reset
              </small>
            </div>

            <div class="button-group">
              <button type="submit" class="btn btn-primary" [disabled]="isLoading || loginForm.invalid">
                {{ isLoading ? 'Signing In...' : 'Sign In' }}
              </button>
              <button type="reset" class="btn btn-secondary" (click)="onReset()" [disabled]="isLoading">Reset</button>
            </div>
          </form>
        </div>

        <footer class="login-footer">
          <p>Copyright © 2026 Venus Tech Inc. All rights reserved. | <a href="#">Privacy Policy</a></p>
        </footer>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get isEmailInvalid(): boolean {
    const emailControl = this.loginForm.get('email');
    return !!(emailControl && emailControl.invalid && emailControl.touched);
  }

  get isPasswordInvalid(): boolean {
    const passwordControl = this.loginForm.get('password');
    return !!(passwordControl && passwordControl.invalid && passwordControl.touched);
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]]
    });
  }

  ngOnInit(): void {
    
    const logoutMsg = sessionStorage.getItem('logoutMessage');
    if (logoutMsg) {
      this.successMessage = logoutMsg;
      sessionStorage.removeItem('logoutMessage');
    }

    
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('User already logged in, redirecting to company page');
      this.router.navigate(['/company']);
    }
  }

  onSubmit(): void {
    
    this.errorMessage = '';

    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    
    const { email, password } = this.loginForm.value;

    
    this.isLoading = true;

    
    this.apiService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        const authPayload = this.unwrapAuthResponse(response);

        
        const authToken = authPayload.access_token ?? authPayload.token ?? null;
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }

        const refreshToken = authPayload.refresh_token ?? authPayload.refreshToken ?? authPayload.tokens?.refreshToken ?? null;
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        
        if (authPayload.expires_in) {
          const expiry = Date.now() + Number(authPayload.expires_in) * 1000;
          localStorage.setItem('authTokenExpiry', String(expiry));
        }

        
        localStorage.setItem('lastActivity', String(Date.now()));

        
        let currentUser: any = null;
        if (authPayload.user) {
          currentUser = { ...authPayload.user };
        } else if (authPayload.uid || authPayload.id || authPayload.userID || authPayload.Email || authPayload.eMail) {
          currentUser = { ...authPayload };
        }

        
        if (authToken) {
          try {
            const payload = JSON.parse(atob(authToken.split('.')[1]));
            const uidClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'];
            if (!currentUser) currentUser = {};
            if (uidClaim && !currentUser.uid) currentUser.uid = Number(uidClaim);
            if (payload['aid'] && !currentUser.aid) currentUser.aid = Number(payload['aid']);
            if (payload['cid'] && !currentUser.cid) currentUser.cid = Number(payload['cid']);
            if (payload['gid'] && !currentUser.gid) currentUser.gid = Number(payload['gid']);
          } catch (e) {  }
        }

        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        
        this.authService.updateAuthStatus();

        
        this.isLoading = false;
        this.router.navigate(['/company']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;

        
        if (error.error && typeof error.error === 'object' && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again later.';
        }

        
        this.loginForm.patchValue({ password: '' });
      }
    });
  }

  onReset(): void {
    this.loginForm.reset();
    this.errorMessage = '';
  }

  private unwrapAuthResponse(response: any): any {
    if (response?.data && typeof response.data === 'object') {
      return response.data;
    }
    return response ?? {};
  }
}
