import { Directive, ElementRef, HostListener, forwardRef, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HtmlEntityEncoderService } from '../../core/services/html-entity-encoder.service';


@Directive({
  selector: 'input[type="text"], textarea, input:not([type]), input[type="email"], input[type="search"]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtmlEntityEncoderDirective),
      multi: true
    }
  ],
  standalone: true
})
export class HtmlEntityEncoderDirective implements ControlValueAccessor {
  private isWritingValue = false;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    private encoderService: HtmlEntityEncoderService,
    private renderer: Renderer2
  ) {}

  
  writeValue(value: any): void {
    if (value == null) {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
    } else if (typeof value === 'string') {
      this.isWritingValue = true;
      
      const displayValue = this.encoderService.decodeFromEntity(value);
      this.renderer.setProperty(this.el.nativeElement, 'value', displayValue);
      this.isWritingValue = false;
    }
  }

  
  @HostListener('blur')
  @HostListener('change')
  onInputChange(): void {
    if (this.isWritingValue) return;
    this.emitEncodedValue();
  }

  
  @HostListener('input')
  onInput(): void {
    if (this.isWritingValue) return;
    
    setTimeout(() => this.emitEncodedValue(), 0);
  }

  
  private getRawValue(): string {
    return this.el.nativeElement.value;
  }

  
  private getEncodedValue(): string {
    const rawValue = this.getRawValue();
    return this.encoderService.encodeToEntity(rawValue);
  }

  
  private emitEncodedValue(): void {
    const encodedValue = this.getEncodedValue();
    this.onChange(encodedValue);
    this.onTouched();
  }

  
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }
}
