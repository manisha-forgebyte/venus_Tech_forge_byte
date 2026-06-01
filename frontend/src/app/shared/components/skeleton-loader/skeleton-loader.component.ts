import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Table skeleton: rows of shimmer cells -->
    <div class="skeleton-table" *ngIf="type === 'table'">
      <div class="skeleton-table-header">
        <div class="skeleton-cell skeleton-header-cell" *ngFor="let c of colArray"></div>
      </div>
      <div class="skeleton-table-row" *ngFor="let r of rowArray">
        <div class="skeleton-cell" *ngFor="let c of colArray"></div>
      </div>
    </div>

    <!-- Card skeleton: label/value pairs in 2 columns -->
    <div class="skeleton-card" *ngIf="type === 'card'">
      <div class="skeleton-card-row" *ngFor="let r of rowArray">
        <div class="skeleton-field" *ngFor="let c of colArray">
          <div class="skeleton skeleton-label"></div>
          <div class="skeleton skeleton-input"></div>
        </div>
      </div>
    </div>

    <!-- List skeleton: simple rows -->
    <div class="skeleton-list" *ngIf="type === 'list'">
      <div class="skeleton-list-row" *ngFor="let r of rowArray">
        <div class="skeleton skeleton-line" [style.width]="getRandomWidth(r)"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 6px;
    }

    
    .skeleton-table { padding: 16px; }

    .skeleton-table-header {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid #eef0f6;
    }

    .skeleton-header-cell {
      height: 18px !important;
      opacity: 0.7;
    }

    .skeleton-table-row {
      display: flex;
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid #f3f5fa;
    }

    .skeleton-cell {
      flex: 1;
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
    }

    
    .skeleton-card { padding: 24px; }

    .skeleton-card-row {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }

    .skeleton-field {
      flex: 1;
    }

    .skeleton-label {
      width: 100px;
      height: 14px;
      margin-bottom: 8px;
    }

    .skeleton-input {
      width: 100%;
      height: 44px;
    }

    
    .skeleton-list { padding: 16px; }

    .skeleton-list-row {
      padding: 12px 0;
      border-bottom: 1px solid #f3f5fa;
    }

    .skeleton-line {
      height: 16px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'card' | 'list' = 'table';
  @Input() rows = 5;
  @Input() columns = 5;

  get rowArray() { return Array.from({ length: this.rows }, (_, i) => i); }
  get colArray() { return Array.from({ length: this.columns }, (_, i) => i); }

  getRandomWidth(index: number): string {
    const widths = ['60%', '80%', '45%', '70%', '55%', '90%', '65%', '75%'];
    return widths[index % widths.length];
  }
}
