import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SanitizeInputDirective } from '../../shared/directives/sanitize-input.directive';

@Component({
    selector: 'app-add-asset',
    standalone: true,
    imports: [CommonModule, FormsModule, SanitizeInputDirective],
    template: `
    <div class="modal-backdrop" *ngIf="open" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-content">
            <div class="breadcrumb">MBRDB>>{{ editData ? 'Edit' : 'Add' }} Assets</div>
            <h1 class="modal-title">Asset {{ editData ? 'Edit' : 'Add' }}</h1>
          </div>
          <button class="close-x" (click)="close()">×</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <!-- First Row -->
            <div class="form-row">
              <label class="field-label">Gen Code:</label>
              <input class="form-control" [(ngModel)]="asset.genCode" placeholder="Enter Gen Code" />
            </div>

            <div class="form-row">
              <label class="field-label">Gen Name: <span class="required">*</span></label>
              <input class="form-control" [(ngModel)]="asset.genName" placeholder="Enter Generator Name" />
            </div>

            <!-- Second Row -->
            <div class="form-row">
              <label class="field-label">country: <span class="required">*</span></label>
              <div class="select-wrapper">
                <select class="form-control select-box" [(ngModel)]="asset.country">
                  <option [ngValue]="undefined">--Select Country--</option>
                  <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <label class="field-label">State: <span class="required">*</span></label>
              <input class="form-control" [(ngModel)]="asset.state" placeholder="Enter State (e.g. AZ)" (keydown)="onStateKeydown($event)" maxlength="2" style="text-transform: uppercase" />
            </div>

            <!-- Third Row -->
            <div class="form-row">
              <label class="field-label">Nameplate Capacity MW: <span class="required">*</span></label>
              <input class="form-control" type="number" [(ngModel)]="asset.capacity" placeholder="0.0000" />
            </div>

            <div class="form-row">
              <label class="field-label">Operating Month: <span class="required">*</span></label>
              <div class="select-wrapper">
                <select class="form-control select-box" [(ngModel)]="asset.opMonth">
                  <option [ngValue]="undefined">--Select Month--</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>

            <!-- Fourth Row -->
            <div class="form-row">
              <label class="field-label">Operating Year: <span class="required">*</span></label>
              <input class="form-control" [(ngModel)]="asset.opYear" placeholder="YYYY" maxlength="4" (keydown)="onYearKeydown($event)" />
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-modal btn-submit" (click)="save()">{{ editData ? 'Update' : 'Add' }}</button>
          <button class="btn-modal btn-reset" (click)="reset()">Reset</button>
          <button class="btn-modal btn-cancel" (click)="close()">Cancel</button>
        </footer>
      </div>
    </div>
  `,
    styleUrls: ['./add-asset.component.scss']
})
export class AddAssetComponent {
    @Input() open = false;
    @Input() editData: any = null;
    @Output() openChange = new EventEmitter<boolean>();
    @Output() saveEvent = new EventEmitter<any>();

    asset: any = {};

    countries: string[] = [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
        'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
        'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
        'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
        'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
        'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
        'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
        'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
        'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
        'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
        'Kenya', 'Kiribati', 'Korea North', 'Korea South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
        'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
        'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
        'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
        'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
        'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
        'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
        'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
        'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
        'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
        'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
        'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
        'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
        'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
    ];

    onStateKeydown(event: KeyboardEvent): void {
        if (event.key === 'Tab' || event.key === 'Backspace' || event.key === 'Delete' ||
            event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
        if (!/^[a-zA-Z]$/.test(event.key)) {
            event.preventDefault();
        }
    }

    onYearKeydown(event: KeyboardEvent): void {
        if (event.key === 'Tab' || event.key === 'Backspace' || event.key === 'Delete' ||
            event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    }

    ngOnChanges() {
        if (this.open) {
            if (this.editData) {
                
                this.asset = {
                    assetid: this.editData.id, 
                    genCode: this.editData.genCode,
                    genName: this.editData.name,
                    country: this.editData.country,
                    state: this.editData.state,
                    capacity: this.editData.capacity,
                    opMonth: this.editData.opMonth,
                    opYear: this.editData.opYear
                };
            } else {
                this.reset();
            }
        }
    }

    close() {
        this.open = false;
        this.openChange.emit(false);
    }

    reset() {
        this.asset = {};
    }

    save() {
        this.saveEvent.emit(this.asset);
        this.close();
    }
}
