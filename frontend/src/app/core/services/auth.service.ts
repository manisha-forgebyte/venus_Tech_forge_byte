import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  
  private readonly INACTIVITY_TIMEOUT_MS = 4 * 60 * 60 * 1000; 
  private readonly REFRESH_CHECK_INTERVAL_MS = 60 * 1000; 
  private readonly REFRESH_THRESHOLD_MS = 5 * 60 * 1000; 

  private refreshInProgress = false;
  private refreshTimerHandle: number | null = null;
  private activityListenersInstalled = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private ngZone: NgZone
  ) {
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken' || e.key === 'refreshToken' || e.key === 'authTokenExpiry' || e.key === 'currentUser' || e.key === 'lastActivity') {
        this.updateAuthStatus();
      }
    });

    
    this.startMonitoring();
  }

  private checkAuthentication(): boolean {
    return !!localStorage.getItem('authToken');
  }

  public updateAuthStatus(): void {
    const isAuth = this.checkAuthentication();
    this.isAuthenticatedSubject.next(isAuth);
    if (isAuth) {
      this.ensureMonitoringStarted();
    } else {
      this.stopMonitoring();
    }
  }

  public login(): void {
    this.updateAuthStatus();
  }

  public logout(silent = false): void {
    
    
    try {
      localStorage.clear();
    } catch (e) {  }

    
    this.isAuthenticatedSubject.next(false);
    this.stopMonitoring();

    
    if (!silent) {
      try {
        sessionStorage.setItem('logoutMessage', 'You have successfully logged out, if you are expecting to see more or have issues please contact the Administrator');
        this.router.navigate(['/login']);
      } catch (e) { console.warn('Router navigation failed on logout', e); }
    }
  }

  public isAuthenticated(): boolean {
    return this.checkAuthentication();
  }

  
  private ensureMonitoringStarted() {
    if (!this.activityListenersInstalled) {
      this.installActivityListeners();
    }
    if (this.refreshTimerHandle == null) {
      this.startRefreshTimer();
    }
  }

  private startMonitoring() {
    if (this.checkAuthentication()) {
      this.ensureMonitoringStarted();
    }
  }

  private stopMonitoring() {
    if (this.refreshTimerHandle != null) {
      clearInterval(this.refreshTimerHandle);
      this.refreshTimerHandle = null;
    }
    this.removeActivityListeners();
  }

  private installActivityListeners() {
    const update = () => this.updateLastActivity();
    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, update));
    this.activityListenersInstalled = true;
    
    if (!localStorage.getItem('lastActivity')) {
      this.updateLastActivity();
    }
  }

  private removeActivityListeners() {
    const update = () => this.updateLastActivity();
    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => window.removeEventListener(evt, update));
    this.activityListenersInstalled = false;
  }

  private updateLastActivity() {
    try {
      localStorage.setItem('lastActivity', Date.now().toString());
    } catch (e) {  }
  }

  private startRefreshTimer() {
    
    this.ngZone.runOutsideAngular(() => {
      this.refreshTimerHandle = window.setInterval(() => {
        this.checkRefreshAndInactivity();
      }, this.REFRESH_CHECK_INTERVAL_MS) as unknown as number;
    });
  }

  private checkRefreshAndInactivity() {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token) { return; }

    
    const last = Number(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    if (last && (now - last) > this.INACTIVITY_TIMEOUT_MS) {
      
      console.warn('Auto-logout due to inactivity');
      this.logout();
      return;
    }

    if (!refreshToken) {
      const expiry = Number(localStorage.getItem('authTokenExpiry') || '0');
      if (expiry && now > expiry) {
        this.logout();
      }
      return;
    }

    
    const expStr = localStorage.getItem('authTokenExpiry');
    if (expStr) {
      const expiry = Number(expStr);
      const timeLeft = expiry - now;
      
      if (timeLeft < this.REFRESH_THRESHOLD_MS && !this.refreshInProgress) {
        this.refreshInProgress = true;
        this.apiService.refreshToken(refreshToken).subscribe({
          next: (resp) => {
            this.handleRefreshResponse(resp);
            this.refreshInProgress = false;
          },
          error: (err) => {
            console.error('Refresh token failed', err);
            this.refreshInProgress = false;
            
            const now2 = Date.now();
            const expiry2 = Number(localStorage.getItem('authTokenExpiry') || '0');
            if (expiry2 && (now2 - expiry2) > 0) {
              this.logout();
            }
          }
        });
      }
    } else {
      
      if (!this.refreshInProgress) {
        this.refreshInProgress = true;
        this.apiService.refreshToken(refreshToken).subscribe({
          next: (resp) => {
            this.handleRefreshResponse(resp);
            this.refreshInProgress = false;
          },
          error: () => { this.refreshInProgress = false; }
        });
      }
    }
  }

  private handleRefreshResponse(resp: any) {
    if (!resp) return;
    const payload = this.unwrapAuthResponse(resp);
    
    const newToken = payload.access_token ?? payload.token ?? null;
    if (newToken) {
      try {
        localStorage.setItem('authToken', newToken);
        const newRefreshToken = payload.refresh_token ?? payload.refreshToken ?? payload.tokens?.refreshToken ?? null;
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        if (payload.expires_in) {
          const expiry = Date.now() + Number(payload.expires_in) * 1000;
          localStorage.setItem('authTokenExpiry', String(expiry));
        }
        
        try {
          const cur = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updated = { ...cur } as any;
          
          ['aid','cid','uid','gid'].forEach(k => { if (payload[k]) updated[k] = payload[k]; });
          
          try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const uidClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'];
            if (uidClaim && !updated.uid) updated.uid = Number(uidClaim);
            if (payload['aid'] && !resp['aid']) updated.aid = Number(payload['aid']);
            if (payload['cid'] && !resp['cid']) updated.cid = Number(payload['cid']);
            if (payload['gid'] && !resp['gid']) updated.gid = Number(payload['gid']);
          } catch (e) {  }
          localStorage.setItem('currentUser', JSON.stringify(updated));
        } catch (e) {  }

        this.updateAuthStatus();
        this.updateLastActivity();
      } catch (e) { console.error('Error handling refresh response', e); }
    } else {
      console.warn('Refresh response did not contain access_token, forcing logout');
      this.logout();
    }
  }

  private unwrapAuthResponse(resp: any): any {
    if (resp?.data && typeof resp.data === 'object') {
      return resp.data;
    }
    return resp ?? {};
  }
}
