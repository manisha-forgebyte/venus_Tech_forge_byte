import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-topbar" *ngIf="isLoggedIn && isSiteAdmin">
      <div class="admin-topbar-content">
        <div class="admin-badge">
          <svg class="badge-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          <span class="badge-text">MBR Site Admin</span>
          <div class="active-context-badge" *ngIf="currentCompany">
            <span class="context-separator"></span>
            <span class="context-title">{{ currentCompany.Title }}</span>
            <span class="context-cid" *ngIf="currentCompany.company_id">#{{ currentCompany.company_id }}</span>
          </div>
        </div>
        <div class="admin-actions">
          <button class="admin-link" (click)="goToAdmin()" *ngIf="!isOnAdminPanel()">Admin Panel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-topbar {
      background: linear-gradient(135deg, #075985 0%, #1e3a8a 100%);
      background-image: 
        linear-gradient(135deg, #075985 0%, #1e3a8a 100%),
        radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 10px);
      color: #fff;
      padding: 10px 0;
      box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3), inset 0 -2px 0 rgba(0, 255, 255, 0.5);
      border-bottom: 1px solid #00ffff;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(8px);
    }

    .admin-topbar-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .admin-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(0, 255, 255, 0.4);
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    }

    .badge-icon {
      width: 20px;
      height: 20px;
      color: #00ffff; 
      filter: drop-shadow(0 0 5px #00ffff);
    }

    .badge-text {
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #fff;
      text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
    }

    .admin-actions {
      display: flex;
      gap: 12px;
    }

    .admin-link {
      background: #00ffff;
      color: #1e3a8a;
      border: none;
      padding: 7px 18px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
    }

    .admin-link:hover {
      background: #fff;
      color: #2563eb;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
    }

    .admin-link:active {
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .admin-topbar-content {
        flex-direction: row;
        gap: 8px;
        padding: 0 16px;
      }

      .badge-text {
        font-size: 11px;
      }

      .admin-badge {
        padding: 4px 10px;
      }

      .active-context-badge {
        display: none; 
      }
    }

    .active-context-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }

    .context-separator {
      height: 14px;
      width: 1px;
      background: rgba(255, 255, 255, 0.3);
      margin: 0 4px;
    }

    .context-title {
      font-size: 11px;
      font-weight: 600;
      color: #00ffff;
      text-shadow: 0 0 5px rgba(0, 255, 255, 0.4);
    }

    .context-cid {
      font-size: 9px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.1);
      padding: 1px 6px;
      border-radius: 4px;
    }
  `]
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
  isSiteAdmin = false;
  isLoggedIn = false;
  currentCompany: any = null;
  private companySub: Subscription | null = null;
  private authSub: Subscription | null = null;

  constructor(
    private router: Router,
    private companyContextService: CompanyContextService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
      if (isAuth) {
        this.checkAdminStatus();
      } else {
        this.isSiteAdmin = false;
        this.currentCompany = null;
      }
    });

    this.companySub = this.companyContextService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
    });
  }

  ngOnDestroy() {
    if (this.companySub) {
      this.companySub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  checkAdminStatus() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.isSiteAdmin = (Number(user.gid) === 1 || Number(user.GID) === 1);
    } catch (e) {
      this.isSiteAdmin = false;
    }
  }

  isOnAdminPanel(): boolean {
    return this.router.url.includes('/admin');
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
