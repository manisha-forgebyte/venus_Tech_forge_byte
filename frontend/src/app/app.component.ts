import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AdminTopbarComponent } from './shared/components/admin-topbar/admin-topbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AlertModalComponent } from './shared/components/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from './core/services/auth.service';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { HtmlEntityEncoderDirective } from './shared/directives/html-entity-encoder.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, NavbarComponent, AdminTopbarComponent, ToastComponent, AlertModalComponent, ConfirmModalComponent, HtmlEntityEncoderDirective],
  template: `
    <div class="app-container">
      <app-admin-topbar *ngIf="!isLoginPage && isLoggedIn"></app-admin-topbar>
      <app-navbar></app-navbar>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer" *ngIf="!isLoginPage">
        <p>Copyright © {{ currentYear }} Venus Tech Inc. All rights reserved. | <a href="#">Privacy Policy</a></p>
      </footer>

      <button class="fab-help" *ngIf="!isLoginPage">?</button>
    </div>
    <app-toast></app-toast>
    <app-alert-modal></app-alert-modal>
    <app-confirm-modal></app-confirm-modal>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'mbr';
  isLoginPage = false;
  isLoggedIn = false;
  private authSub: Subscription | null = null;

  get currentYear(): number { return new Date().getFullYear(); }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const url = event.urlAfterRedirects;
      this.isLoginPage = url === '/login' || url === '/';
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
