import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleAwareRouterService {
  constructor(private router: Router) {}

  
  navigate(regularPath: string, adminPath?: string) {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isSiteAdmin = Number(user.gid) === 1;

      const path = isSiteAdmin 
        ? (adminPath || `/admin${regularPath}`)
        : regularPath;

      this.router.navigate([path]);
    } catch (e) {
      console.error('Error in RoleAwareRouterService:', e);
      this.router.navigate([regularPath]);
    }
  }

  
  getRouteUrl(regularPath: string, adminPath?: string): string {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const isSiteAdmin = Number(user.gid) === 1;

      return isSiteAdmin 
        ? (adminPath || `/admin${regularPath}`)
        : regularPath;
    } catch (e) {
      return regularPath;
    }
  }

  
  isSiteAdmin(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return Number(user.gid) === 1;
    } catch (e) {
      return false;
    }
  }
}
