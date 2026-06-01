import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../services/toast.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Subscription } from 'rxjs';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-filing-flags-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent],
  template: `
    <!-- Filing Flags Modal (Test / Submission) -->
    <div class="modal-overlay" *ngIf="mode" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-titles">
            <span class="sub-title">MBRDB &gt;&gt; Update Filing Information</span>
            <h2 class="main-title">{{ mode === 'TEST' ? 'Sandbox Test Filing' : 'FERC Submission Filing' }}</h2>
          </div>
          <button class="close-btn" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading skeleton while API data is fetched -->
          <app-skeleton-loader *ngIf="filingFlagsLoading" type="list" [rows]="8"></app-skeleton-loader>

          <div class="filing-flags-form" *ngIf="!filingFlagsLoading">
            <div class="option-row select-all">
              <span class="label"><strong>Select/Unselect ALL:</strong></span>
              <label class="custom-checkbox">
                <input type="checkbox" [checked]="isAllFlagsSelected" (change)="toggleAllFlags($event)">
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="option-row"><span class="label">Include MBR Authorizations:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incAuth"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include MBR Category Status:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incCS"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include MBR Mitigations:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incMit"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include MBR Operating Reserves:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incOR"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include MBR Self Limitation:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incSL"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Entities to Entities:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incEtoE"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Entities to Gen Assets:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incEtoGen"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Entities to PPA's:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incEtoPPA"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Entities to Vertical Assets:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incEtoVA"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Indicative PSS:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incIPSS"><span class="checkmark"></span></label></div>
            <div class="option-row"><span class="label">Include Indicative MSS:<span class="req">*</span></span><label class="custom-checkbox"><input type="checkbox" [(ngModel)]="filingFlags.incIMSS"><span class="checkmark"></span></label></div>
          </div>
        </div>

        <div class="modal-footer">
          <ng-container *ngIf="mode === 'TEST'">
            <button class="btn-modal btn-submit" [disabled]="filingFlagsLoading || isSaving" (click)="onSave()">Submit To Sandbox Test</button>
            <button class="btn-modal btn-save" [disabled]="filingFlagsLoading || isSaving" (click)="onSaveFlags()">Save</button>
            <button class="btn-modal btn-reset" [disabled]="filingFlagsLoading" (click)="onReset()">Reset</button>
          </ng-container>
          <ng-container *ngIf="mode === 'SUBMISSION'">
            <button class="btn-modal btn-submit" [disabled]="filingFlagsLoading || isSaving" (click)="onSave()">Submit Filing TO FERC</button>
            <button class="btn-modal btn-reset" [disabled]="filingFlagsLoading" (click)="onReset()">Reset</button>
            <button class="btn-modal btn-cancel" (click)="onClose()">Cancel</button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filing-flags-modal.component.scss']
})
export class FilingFlagsModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() mode: 'TEST' | 'SUBMISSION' | null = null;
  @Output() closed = new EventEmitter<void>();

  filingFlags: any = {
    incAuth: false, incCS: false, incMit: false, incOR: false, incSL: false,
    incEtoE: false, incEtoGen: false, incEtoPPA: false, incEtoVA: false,
    incIPSS: false, incIMSS: false
  };
  filingFlagsLoading = false;
  isSaving = false;

  companyId = 0;
  private companySub!: Subscription;

  constructor(private apiService: ApiService, private companyContextService: CompanyContextService, private toast: ToastService) {}

  ngOnInit(): void {
    this.companySub = this.companyContextService.currentCompany$.subscribe(company => {
      if (company) {
        this.companyId = company.cid || company.company_id || 0;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.companySub) { this.companySub.unsubscribe(); }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] && this.mode) {
      this.loadFilingFlags();
    }
  }

  get isAllFlagsSelected(): boolean {
    return this.filingFlags.incAuth && this.filingFlags.incCS && this.filingFlags.incMit &&
      this.filingFlags.incOR && this.filingFlags.incSL && this.filingFlags.incEtoE &&
      this.filingFlags.incEtoGen && this.filingFlags.incEtoPPA && this.filingFlags.incEtoVA &&
      this.filingFlags.incIPSS && this.filingFlags.incIMSS;
  }

  toggleAllFlags(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filingFlags = {
      incAuth: checked, incCS: checked, incMit: checked, incOR: checked, incSL: checked,
      incEtoE: checked, incEtoGen: checked, incEtoPPA: checked, incEtoVA: checked,
      incIPSS: checked, incIMSS: checked
    };
  }

  loadFilingFlags(): void {
    this.filingFlagsLoading = true;
    this.apiService.getFilingFlagsByCID(this.companyId).subscribe({
      next: (res: any) => {
        
        const data = Array.isArray(res) ? res[0] : res;
        if (data) {
          this.filingFlags = {
            incAuth: !!(data.IncAuth ?? data.incAuth),
            incCS:   !!(data.IncCS   ?? data.incCS),
            incMit:  !!(data.IncMit  ?? data.incMit),
            incOR:   !!(data.IncOR   ?? data.incOR),
            incSL:   !!(data.IncSL   ?? data.incSL),
            incEtoE: !!(data.IncEtoE ?? data.incEtoE),
            incEtoGen: !!(data.IncEtoGen ?? data.incEtoGen),
            incEtoPPA: !!(data.IncEtoPPA ?? data.incEtoPPA),
            incEtoVA:  !!(data.IncEtoVA  ?? data.incEtoVA),
            incIPSS: !!(data.IncIPSS ?? data.incIPSS),
            incIMSS: !!(data.IncIMSS ?? data.incIMSS)
          };
        }
        this.filingFlagsLoading = false;
      },
      error: (err: any) => {
        console.error('[FilingFlagsModal] loadFilingFlags error:', err);
        this.filingFlagsLoading = false;
      }
    });
  }

  onSaveFlags(): void {
    this.isSaving = true;
    let currentUid = 1;
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUid = parseInt(String(u.uid || u.id || 1), 10);
    } catch (e) {}

    const payload = {
      cid: this.companyId,
      uid: currentUid,
      incAuth: this.filingFlags.incAuth,
      incCS: this.filingFlags.incCS,
      incMit: this.filingFlags.incMit,
      incOR: this.filingFlags.incOR,
      incSL: this.filingFlags.incSL,
      incEtoE: this.filingFlags.incEtoE,
      incEtoGen: this.filingFlags.incEtoGen,
      incEtoPPA: this.filingFlags.incEtoPPA,
      incEtoVA: this.filingFlags.incEtoVA,
      incIPSS: this.filingFlags.incIPSS,
      incIMSS: this.filingFlags.incIMSS,
      sandboxTest: false 
    };
    this.apiService.updateFilingFlags(payload).subscribe({
      next: (res: any) => {
        console.log('[FilingFlagsModal] saveFlags success:', res);
      },
      error: (err: any) => {
        console.error('[FilingFlagsModal] saveFlags error:', err);
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  onSave(): void {
    this.isSaving = true;
    let currentUid = 1;
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUid = parseInt(String(u.uid || u.id || 1), 10);
    } catch (e) {}

    const flagsPayload = {
      cid: this.companyId,
      uid: currentUid,
      incAuth: this.filingFlags.incAuth,
      incCS: this.filingFlags.incCS,
      incMit: this.filingFlags.incMit,
      incOR: this.filingFlags.incOR,
      incSL: this.filingFlags.incSL,
      incEtoE: this.filingFlags.incEtoE,
      incEtoGen: this.filingFlags.incEtoGen,
      incEtoPPA: this.filingFlags.incEtoPPA,
      incEtoVA: this.filingFlags.incEtoVA,
      incIPSS: this.filingFlags.incIPSS,
      incIMSS: this.filingFlags.incIMSS,
      sandboxTest: this.mode === 'TEST'
    };
    this.apiService.updateFilingFlags(flagsPayload).subscribe({
      next: (res: any) => {
        console.log('[FilingFlagsModal] updateFilingFlags success:', res);
        this.toast.success(this.mode === 'TEST' ? 'Submitted to Sandbox Test successfully!' : 'Submitted Filing to FERC successfully!');
        this.isSaving = false;
        this.onClose();
      },
      error: (err: any) => {
        console.error('[FilingFlagsModal] updateFilingFlags error:', err);
        this.isSaving = false;
        this.toast.error('Failed to submit filing.');
      }
    });
  }

  onReset(): void {
    this.loadFilingFlags();
  }

  onClose(): void {
    this.closed.emit();
  }
}
