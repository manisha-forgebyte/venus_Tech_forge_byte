import { Component, forwardRef, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface BaaOption {
  value: string;
  text: string;
}

@Component({
  selector: 'app-balancing-authority-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="baa-combo">
      <input type="text" class="form-input" 
        [(ngModel)]="searchText" 
        (input)="onSearchInput()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
        placeholder="Search or select..." 
        autocomplete="off"
        #baaInput>
      <span class="combo-arrow" (mousedown)="$event.preventDefault(); clearBlurTimer()" (click)="onToggle()">▼</span>
      
      <div class="baa-dropdown" 
        *ngIf="isDropdownOpen && filteredList.length > 0"
        [ngStyle]="dropdownStyle">
        <div class="baa-dropdown-item" 
          *ngFor="let item of filteredList" 
          (mousedown)="onItemSelect(item)">
          <div class="baa-item-code">{{ item.value }}</div>
          <div class="baa-item-name">{{ item.text }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .baa-combo {
      position: relative;
      width: 100%;
    }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #CBD5E0;
      border-radius: 8px;
      font-size: 13px;
      font-family: inherit;
      background-color: #fff;
      cursor: pointer;
      box-sizing: border-box;
    }
    .form-input:hover {
      border-color: #A0AEC0;
    }
    .form-input:focus {
      outline: none;
      border-color: #002980;
      box-shadow: 0 0 0 3px rgba(0, 41, 128, 0.1);
    }
    .combo-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 12px;
      color: #666;
      user-select: none;
    }
    .baa-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      margin-top: 2px;
      background: #1a2d4d;
      border: 1px solid #ccc;
      border-radius: 8px;
      max-height: 250px;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    .baa-dropdown-item {
      padding: 10px 14px;
      cursor: pointer;
      color: white;
      border-bottom: 1px solid #333;
    }
    .baa-dropdown-item:hover {
      background-color: #2a4d7d;
    }
    .baa-item-code {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .baa-item-name {
      font-size: 12px;
      color: #ccc;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BalancingAuthorityDropdownComponent),
      multi: true
    }
  ]
})
export class BalancingAuthorityDropdownComponent implements ControlValueAccessor {
  @Input() balancingAuthorities: BaaOption[] = [];
  @ViewChild('baaInput') baaInput!: ElementRef<HTMLInputElement>;
  
  searchText: string = '';
  selectedValue: string = '';
  filteredList: BaaOption[] = [];
  isDropdownOpen: boolean = false;
  dropdownStyle: any = {};
  private blurTimer: any;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.selectedValue = value || '';
    this.searchText = '';
    
    if (value) {
      const item = this.balancingAuthorities.find(i => i.value === value);
      if (item) {
        this.searchText = `${item.value} - ${item.text}`;
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    
  }

  onSearchInput(): void {
    const term = this.searchText.toLowerCase();
    if (term.length > 0) {
      this.filteredList = this.balancingAuthorities.filter(item =>
        item.text.toLowerCase().includes(term) || item.value.toLowerCase().includes(term)
      );
    } else {
      this.filteredList = this.balancingAuthorities.slice(0, 100);
    }
    this.isDropdownOpen = true;
    this.updateDropdownPosition();
  }

  onFocus(): void {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = undefined;
    }
    const term = this.searchText.toLowerCase();
    if (term.length > 0) {
      this.filteredList = this.balancingAuthorities.filter(item =>
        item.text.toLowerCase().includes(term) || item.value.toLowerCase().includes(term)
      );
    } else {
      this.filteredList = this.balancingAuthorities.slice(0, 100);
    }
    this.isDropdownOpen = true;
    this.updateDropdownPosition();
  }

  onBlur(): void {
    this.blurTimer = setTimeout(() => {
      this.isDropdownOpen = false;
      this.filteredList = [];
    }, 200);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isDropdownOpen = false;
      this.filteredList = [];
    }
  }

  clearBlurTimer(): void {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = undefined;
    }
  }

  onToggle(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      return;
    }
    this.filteredList = this.balancingAuthorities.slice(0, 100);
    this.isDropdownOpen = true;
    this.updateDropdownPosition();
  }

  onItemSelect(item: BaaOption): void {
    this.searchText = `${item.value} - ${item.text}`;
    this.selectedValue = item.value;
    this.isDropdownOpen = false;
    this.filteredList = [];
    this.onChange(this.selectedValue);
    this.onTouched();
  }

  private updateDropdownPosition(): void {
    
    
    if (!this.baaInput) return;
    const rect = this.baaInput.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 10;
    const maxH = Math.min(Math.max(spaceBelow, 120), 250);
    this.dropdownStyle = {
      'max-height': `${maxH}px`
    };
  }
}
