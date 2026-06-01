import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { RoleAwareRouterService } from '../../../core/services/role-aware-router.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav #navElem class="navbar" [class.login-mode]="!isLoggedIn" [class.floating]="isFloating">
      <div class="brand" *ngIf="isLoggedIn">
        <div class="avatar" *ngIf="currentCompany?.Title">{{ currentCompany?.Title.substring(0,2).toUpperCase() }}</div>
        <div class="brand-text">
          <div class="brand-name" *ngIf="currentCompany?.Title">{{ currentCompany?.Title }}</div>
          <div class="brand-cid" *ngIf="currentCompany?.company_id">Company ID - {{ currentCompany?.company_id }}</div>
          <div class="brand-welcome" *ngIf="currentUserName || currentCompany?.userName">
            Welcome <strong>{{ currentUserName || currentCompany?.userName }}</strong>
          </div>
        </div>
      </div>

      <div class="nav-menu-container-wrapper">
        <div class="nav-menu-container">
          <ul class="nav-menu" [class.disabled]="!isLoggedIn">
            <li class="nav-item" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/account')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">Account</a>
            </li>
            <li class="nav-item" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/company')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">Company</a>
            </li>
            <li class="nav-item" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/assets')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">Assets</a>
            </li>
            <li class="nav-item dropdown" [class.disabled]="!isLoggedIn" (click)="toggleEntitiesDropdown($event)">
              <a class="nav-link" [class.disabled-link]="!isLoggedIn" [class.active]="router.url.includes('/entities')">
                Screens
                <span class="dropdown-arrow" [class.open]="showEntitiesDropdown"></span>
              </a>
              <ul class="dropdown-menu" *ngIf="showEntitiesDropdown && isLoggedIn">
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/authorization')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Authorization
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/category-status')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                  Category Status
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/mitigations')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Mitigations
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/self-limitations')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  Self Limitations
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/operating-reserves')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Operating Reserves
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/entities-to-entities')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Entities to Entities
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/entities-to-generator-assets')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Entities to Generator Assets
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/entities-to-ppas')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Entities to PPAs
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/entities-to-vertical-assets')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Entities to Vertical Assets
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/indicative-pss')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Indicative PSS
                </a></li>
                <li><a [routerLink]="roleRouter.getRouteUrl('/entities/indicative-mss')" (click)="closeDropdown(); $event.stopPropagation()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Indicative MSS
                </a></li>
              </ul>
            </li>
            <li class="nav-item" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/filings')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">Filings</a>
            </li>
            <li class="nav-item" *ngIf="isLoggedIn && (currentGID === 1 || currentGID === 2)" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/user')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">User</a>
            </li>
            <li class="nav-item" [class.disabled]="!isLoggedIn">
              <a [routerLink]="roleRouter.getRouteUrl('/profile')" routerLinkActive="active" class="nav-link" [class.disabled-link]="!isLoggedIn" (click)="handleNavClick($event)">My Profile</a>
            </li>
          </ul>
        </div>
      </div>

      <button class="btn logout-btn" *ngIf="isLoggedIn" (click)="logout()">
        <span class="logout-icon"></span>
        Logout
      </button>
    </nav>

    <div class="navbar-spacer" *ngIf="isFloating" [style.height.px]="navbarHeight"></div>
  `,
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  showEntitiesDropdown = false;
  currentCompany: any = null;
  isLoggedIn = false;
  currentUserName: string | null = null;
  currentGID: number | null = null;
  private authSubscription: Subscription | null = null;
  private companySubscription: Subscription | null = null;
  private apiSubscription: Subscription | null = null;

  
  isFloating = false;
  navbarHeight = 0;
  private navOffsetTop = 0;
  @ViewChild('navElem') navElem!: ElementRef<HTMLElement>;

  constructor(
    public router: Router,
    private companyContextService: CompanyContextService,
    private authService: AuthService,
    private apiService: ApiService,
    public roleRouter: RoleAwareRouterService
  ) {
    
    document.addEventListener('click', () => {
      this.showEntitiesDropdown = false;
    });
  }

  ngOnInit() {
    
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
      if (isAuth) {
        this.loadCurrentUserName();
      } else {
        this.currentUserName = null;
        this.currentGID = null;
      }
    });

    
    this.companySubscription = this.companyContextService.currentCompany$.subscribe(company => {
      this.currentCompany = company;
    });
  }

  ngAfterViewInit() {
    
    try {
      this.navbarHeight = this.navElem?.nativeElement?.offsetHeight || 0;
      const rect = this.navElem?.nativeElement?.getBoundingClientRect();
      this.navOffsetTop = (rect?.top ?? 0) + window.scrollY;
    } catch (e) {  }

    
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const sc = window.scrollY || window.pageYOffset || 0;
    const shouldFloat = sc > this.navOffsetTop;
    if (shouldFloat !== this.isFloating) {
      this.isFloating = shouldFloat;
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    
    try {
      this.navbarHeight = this.navElem?.nativeElement?.offsetHeight || this.navbarHeight;
      const rect = this.navElem?.nativeElement?.getBoundingClientRect();
      this.navOffsetTop = (rect?.top ?? 0) + window.scrollY;
      this.onWindowScroll();
    } catch (e) {  }
  }

  ngOnDestroy() {
    
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
  }

  toggleEntitiesDropdown(event: Event) {
    if (!this.isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.showEntitiesDropdown = !this.showEntitiesDropdown;
  }

  closeDropdown() {
    this.showEntitiesDropdown = false;
  }

  handleNavClick(event: Event) {
    if (!this.isLoggedIn) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Navigation attempted without authentication. Redirecting to login.');
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private extractFirstRow(apiData: any): any | null {
    if (!apiData) return null;
    if (Array.isArray(apiData)) {
      const table = apiData.find((t: any) => t && Array.isArray(t.rows) && t.rows.length > 0);
      if (table) return table.rows[0];
      return apiData[0] ?? null;
    }
    if (apiData.rows && Array.isArray(apiData.rows)) {
      return apiData.rows[0] ?? null;
    }
    return apiData ?? null;
  }

  private loadCurrentUserName() {
    
    const currentUserStr = localStorage.getItem('currentUser');
    let uid: number | null = null;
    let email: string | null = null;
    if (currentUserStr) {
      try {
        const cu = JSON.parse(currentUserStr);
        uid = cu?.uid ?? cu?.Uid ?? cu?.UID ?? cu?.id ?? null;
        email = cu?.email ?? cu?.Email ?? cu?.user_email ?? null;
        const rawGid = cu?.gid ?? cu?.Gid ?? cu?.GID ?? cu?.roleID ?? null;
        this.currentGID = (rawGid !== null && rawGid !== undefined) ? Number(rawGid) : null;
      } catch (e) {
        
      }
    }

    if (uid) {
      this.apiSubscription = this.apiService.getUserByID(uid).subscribe({
        next: (data) => {
          const r = this.extractFirstRow(data);
          const fn = r?.fname ?? r?.first_name ?? r?.Fname ?? r?.name ?? '';
          const ln = r?.lname ?? r?.last_name ?? r?.Lname ?? '';
          const full = `${fn} ${ln}`.trim();
          
          this.currentUserName = full || r?.userName || email || null;
        },
        error: (err) => {
          console.error('Error loading current user details:', err);
          
          this.currentUserName = email ?? null;
        }
      });
    } else if (email) {
      
      const company = this.companyContextService.getCompany();
      const cid = company?.cid ?? company?.company_id ?? null;

      if (cid) {
        this.apiSubscription = this.apiService.getUserListByCID(cid).subscribe({
          next: (data: any) => {
            const records = Array.isArray(data) ? data : (data?.rows ?? []);
            const found = records.find((r: any) => (r.email ?? r.Email ?? '').toLowerCase() === (email ?? '').toLowerCase());
            if (found) {
              const fn = found.fname ?? found.first_name ?? found.Fname ?? found.name ?? '';
              const ln = found.lname ?? found.last_name ?? found.Lname ?? '';
              const full = `${fn} ${ln}`.trim();
              
              this.currentUserName = full || found.userName || email || null;
            } else {
              this.currentUserName = email ?? null;
            }
          },
          error: (err) => {
            console.error('Error searching user list for email:', err);
            this.currentUserName = email ?? null;
          }
        });
      } else {
        
        this.currentUserName = email ?? null;
      }
    } else {
      this.currentUserName = null;
    }
  }
}
