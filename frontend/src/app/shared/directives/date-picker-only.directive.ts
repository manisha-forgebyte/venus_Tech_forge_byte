import { Directive, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateFormatterService } from '../../core/services/date-formatter.service';


@Directive({
  selector: 'input[type="date"]',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: DatePickerOnlyDirective, multi: true }
  ]
})
export class DatePickerOnlyDirective implements ControlValueAccessor, OnInit {

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};
  private isoValue = '';
  private hiddenDateInput!: HTMLInputElement;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    private dateFormatter: DateFormatterService
  ) {
    const input = this.el.nativeElement;
    input.type = 'text';
    input.placeholder = 'mm/dd/yyyy';
    input.style.paddingRight = '36px';
  }

  ngOnInit(): void {
    this.createWrapper();
  }

  
  private createWrapper(): void {
    const input = this.el.nativeElement;
    const parent = input.parentNode;
    if (!parent) return;

    
    const wrapper = this.renderer.createElement('div');
    this.renderer.setStyle(wrapper, 'position', 'relative');
    this.renderer.setStyle(wrapper, 'display', 'inline-block');
    this.renderer.setStyle(wrapper, 'width', '100%');

    
    this.renderer.insertBefore(parent, wrapper, input);
    this.renderer.appendChild(wrapper, input);

    
    this.hiddenDateInput = this.renderer.createElement('input');
    this.renderer.setAttribute(this.hiddenDateInput, 'type', 'date');
    this.renderer.setStyle(this.hiddenDateInput, 'position', 'absolute');
    this.renderer.setStyle(this.hiddenDateInput, 'opacity', '0');
    this.renderer.setStyle(this.hiddenDateInput, 'width', '0');
    this.renderer.setStyle(this.hiddenDateInput, 'height', '0');
    this.renderer.setStyle(this.hiddenDateInput, 'overflow', 'hidden');
    this.renderer.setStyle(this.hiddenDateInput, 'pointerEvents', 'none');
    this.renderer.appendChild(wrapper, this.hiddenDateInput);

    
    this.renderer.listen(this.hiddenDateInput, 'change', (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      this.isoValue = val;
      input.value = val ? this.dateFormatter.formatToDisplay(val) : '';
      this.onChange(this.isoValue);
      this.onTouched();
    });

    
    const iconBtn = this.renderer.createElement('button');
    this.renderer.setAttribute(iconBtn, 'type', 'button');
    this.renderer.setAttribute(iconBtn, 'tabindex', '-1');
    this.renderer.setAttribute(iconBtn, 'aria-label', 'Open calendar');
    this.renderer.setStyle(iconBtn, 'position', 'absolute');
    this.renderer.setStyle(iconBtn, 'right', '4px');
    this.renderer.setStyle(iconBtn, 'top', '50%');
    this.renderer.setStyle(iconBtn, 'transform', 'translateY(-50%)');
    this.renderer.setStyle(iconBtn, 'background', 'none');
    this.renderer.setStyle(iconBtn, 'border', 'none');
    this.renderer.setStyle(iconBtn, 'cursor', 'pointer');
    this.renderer.setStyle(iconBtn, 'padding', '4px');
    this.renderer.setStyle(iconBtn, 'display', 'flex');
    this.renderer.setStyle(iconBtn, 'alignItems', 'center');
    this.renderer.setStyle(iconBtn, 'justifyContent', 'center');
    this.renderer.setStyle(iconBtn, 'color', '#94a3b8');
    iconBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

    this.renderer.listen(iconBtn, 'click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (input.disabled) return;
      this.hiddenDateInput.value = this.isoValue;
      try {
        this.hiddenDateInput.showPicker();
      } catch {
        this.hiddenDateInput.click();
      }
    });

    this.renderer.appendChild(wrapper, iconBtn);
  }

  writeValue(value: any): void {
    if (value) {
      this.isoValue = this.dateFormatter.formatToInputDate(value);
      this.el.nativeElement.value = this.dateFormatter.formatToDisplay(value);
    } else {
      this.isoValue = '';
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowed = ['Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowed.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  
  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);

    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    }

    input.value = formatted;
    input.setSelectionRange(formatted.length, formatted.length);
    this.emitFromDisplay(formatted);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  
  private emitFromDisplay(displayVal: string): void {
    if (displayVal.length === 10) {
      const iso = this.dateFormatter.parseDisplayFormatToIso(displayVal);
      if (iso) {
        this.isoValue = iso;
        this.onChange(iso);
        return;
      }
    }
    this.isoValue = '';
    this.onChange('');
  }
}
