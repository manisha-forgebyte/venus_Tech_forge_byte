import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminRedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isSiteAdmin = Number(user.gid) === 1;

      if (isSiteAdmin) {
        
        const routeMap: { [key: string]: string } = {
          '/company': '/admin/company',
          '/account': '/admin/account',
          '/assets': '/admin/assets',
          '/user': '/admin/user',
          '/profile': '/admin/profile',
          '/filings': '/admin/filings',
          '/entities': '/admin/entities'
        };

        const currentPath = state.url.split('?')[0]; 
        const adminPath = routeMap[currentPath] || `/admin${currentPath}`;

        if (!state.url.startsWith('/admin')) {
          this.router.navigateByUrl(adminPath);
          return false;
        }
      } else {
        
        if (state.url.startsWith('/admin')) {
          this.router.navigate(['/company']);
          return false;
        }
      }
    } catch (e) {
      console.error('Error in AdminRedirectGuard:', e);
    }

    return true;
  }
}
