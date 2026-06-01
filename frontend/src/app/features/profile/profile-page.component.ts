import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UpdateProfileComponent } from './update-profile.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UpdateProfileComponent],
  template: `
    <div class="page-container">
      <div class="profile-header">
        <h1 class="page-title">My Profile</h1>
        <button class="btn btn-update" (click)="onUpdateClick()" [disabled]="isLoading">Update Profile</button>
      </div>

      <!-- Error State -->
      <div class="alert alert-error" *ngIf="errorMessage">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
        <button class="btn-retry" (click)="loadUserProfile()">Retry</button>
      </div>

      <!-- Skeleton Loading State -->
      <div class="profile-card" *ngIf="isLoading">
        <div class="profile-form">
          <div class="form-row" *ngFor="let row of [1,2,3]">
            <div class="form-group" *ngFor="let col of [1,2]">
              <div class="skeleton skeleton-label"></div>
              <div class="skeleton skeleton-input"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-card" *ngIf="!isLoading">
        <div class="profile-form">
          <!-- Row 1 -->
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [value]="profile.firstName" placeholder="First Name" readonly>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [value]="profile.lastName" placeholder="Last Name" readonly>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input type="email" [value]="profile.email" placeholder="Email" readonly>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [value]="'**********'" placeholder="**********" readonly>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="form-row">
            <div class="form-group">
              <label>Work Phone</label>
              <input type="text" [value]="profile.workPhone" placeholder="Work Phone" readonly>
            </div>
            <div class="form-group">
              <label>Mobile Phone</label>
              <input type="text" [value]="profile.mobilePhone" placeholder="Mobile Phone" readonly>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Profile Modal -->
    <app-update-profile 
      [(open)]="isUpdateOpen" 
      [profile]="profile" 
      (saveEvent)="onProfileUpdate($event)">
    </app-update-profile>
  `,
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  isUpdateOpen = false;
  isLoading = false;
  errorMessage = '';
  currentUserId: number = 0;

  profile = {
    uid: 0,
    firstName: '',
    lastName: '',
    email: '',
    workPhone: '',
    mobilePhone: '',
    password: ''
  };

  constructor(private apiService: ApiService, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        
        this.currentUserId = user.uid ?? user.Uid ?? user.UID ??
          user.id ?? user.Id ?? user.ID ??
          user.userID ?? user.userId ?? user.UserID ??
          user.userid ?? user.Id_User ?? 0;

        console.log('ID extracted from currentUser:', this.currentUserId);

        
        this.profile = this.normalizeUserProfile(user);
      } catch (e) {
        console.error('Error parsing current user from localStorage:', e);
      }
    }

    if (!this.currentUserId || this.currentUserId === 0) {
      console.warn('Current User ID not found in localStorage.');
      this.errorMessage = 'User identity not found. Please try logging out and back in.';
      this.isLoading = false;
      return;
    }

    this.apiService.getUserByID(this.currentUserId).subscribe({
      next: (data) => {
        console.log('User profile loaded from API:', data);
        const record = this.extractUserRecord(data);
        if (record) {
          this.profile = this.normalizeUserProfile(record);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile from API:', error);
        this.isLoading = false;

        if (error.status === 401) {
          sessionStorage.setItem('logoutMessage', 'You have successfully logged out, please re login to access.');
          this.router.navigate(['/login']);
        } else {
          
          if (this.profile && this.profile.uid !== 0) {
            console.log('API failed, using fallback data from localStorage');
            
          } else {
            this.errorMessage = error.error?.message || 'Failed to load profile from server. Please try again.';
          }
        }
      }
    });
  }

  normalizeUserProfile(apiData: any): any {
    if (!apiData) {
      return {
        uid: 0, firstName: '', lastName: '', email: '', workPhone: '', mobilePhone: '', password: ''
      };
    }

    
    console.log('Normalizing API data:', apiData);

    return {
      uid: apiData.uid ?? apiData.Uid ?? apiData.UID ?? apiData.userID ?? apiData.userID ?? apiData.id ?? apiData.ID ?? 0,
      firstName: apiData.firstName ?? apiData.FirstName ?? apiData.first_name ?? apiData.fname ?? apiData.fName ?? '',
      lastName: apiData.lastName ?? apiData.LastName ?? apiData.last_name ?? apiData.lname ?? apiData.lName ?? '',
      email: apiData.email ?? apiData.Email ?? apiData.eMail ?? apiData.emailAddress ?? '',
      workPhone: apiData.workPhone ?? apiData.WorkPhone ?? apiData.work_phone ?? apiData.phone ?? apiData.Phone ?? apiData.officephone ?? '',
      mobilePhone: apiData.mobilePhone ?? apiData.MobilePhone ?? apiData.mobile_phone ?? apiData.phoneNumber ?? apiData.phoneNumber ?? apiData.cell ?? apiData.Cell ?? apiData.mobile ?? '',
      password: ''
    };
  }

  private extractUserRecord(apiData: any): any {
    if (!apiData) { return null; }

    
    if (Array.isArray(apiData)) {
      const tableWithRows = apiData.find(t => t && Array.isArray(t.rows) && t.rows.length > 0);
      if (tableWithRows) {
        return tableWithRows.rows[0];
      }
    }

    if (apiData.rows && Array.isArray(apiData.rows) && apiData.rows.length > 0) {
      return apiData.rows[0];
    }

    return apiData; 
  }

  denormalizeUserProfile(normalized: any): any {
    if (!normalized) { return {}; }

    
    let cid = 1;
    let gid = 1;
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        cid = user.cid ?? user.Cid ?? user.CID ?? 1;
        gid = user.gid ?? user.Gid ?? user.GID ?? user.roleID ?? 1;
      } catch (e) { }
    }

    const id = (normalized.uid && normalized.uid !== 0) ? normalized.uid : this.currentUserId;

    return {
      cid: cid,
      uid: id,
      gid: gid,
      modifiedUID: id,
      isPassChange: !!normalized.password,
      firstName: normalized.firstName ?? null,
      lastName: normalized.lastName ?? null,
      eMail: normalized.email ?? null,
      password: normalized.password ?? null,
      phone: normalized.workPhone ?? null,
      mobile: normalized.mobilePhone ?? null,
      companyIds: null 
    };
  }

  onUpdateClick() {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Fetching fresh profile data for update modal...');
    this.apiService.getUserByID(this.currentUserId || 0).subscribe({
      next: (data) => {
        console.log('Fresh profile data received:', data);
        const record = this.extractUserRecord(data);
        if (record) {
          this.profile = this.normalizeUserProfile(record);
        }
        this.isLoading = false;
        this.isUpdateOpen = true; 
      },
      error: (error) => {
        console.error('Error refreshing profile data:', error);
        this.isLoading = false;
        
        this.isUpdateOpen = true;

        
        if (error.status !== 401) {
          console.warn('Using cached profile data due to API failure');
        } else {
          sessionStorage.setItem('logoutMessage', 'You have successfully logged out, please re login to access.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onProfileUpdate(updatedData: any) {
    this.saveUserProfile(updatedData);
  }

  saveUserProfile(data: any) {
    this.isLoading = true;
    this.errorMessage = '';

    const apiPayload = this.denormalizeUserProfile(data);
    console.log('=== SENDING USER UPDATE PAYLOAD (UpdateMyProfile) ===');
    console.log('Raw payload:', JSON.stringify(apiPayload, null, 2));

    this.apiService.updateMyProfile(apiPayload).subscribe({
      next: (result) => {
        console.log('User profile updated successfully:', result);
        this.isUpdateOpen = false;
        this.toast.success('Profile updated successfully!');
        
        this.loadUserProfile();
      },
      error: (error) => {
        console.error('Error updating profile via UpdateMyProfile:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }
}
