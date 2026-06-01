import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { InputSanitizerService } from '../../core/services/input-sanitizer.service';
import { ToastService } from '../services/toast.service';


@Directive({
  selector: 'input, textarea',
  standalone: true
})
export class SanitizeInputDirective {

  private readonly SKIP_TYPES = ['checkbox', 'radio', 'file', 'date', 'number', 'range', 'color', 'hidden'];

  constructor(
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    private sanitizer: InputSanitizerService,
    @Optional() @Self() private ngControl: NgControl,
    private toast: ToastService
  ) {}

  private shouldSkip(): boolean {
    const type = (this.el.nativeElement as HTMLInputElement).type?.toLowerCase();
    return this.SKIP_TYPES.includes(type);
  }

  
  @HostListener('input')
  onInput(): void {
    if (this.shouldSkip()) return;
    const raw = this.el.nativeElement.value;
    if (this.sanitizer.isDangerous(raw)) {
      this.warnAndClean(raw);
    }
  }

  
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.shouldSkip()) return;
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (this.sanitizer.isDangerous(pasted)) {
      event.preventDefault();
      console.warn('🛡️ [Security] Blocked dangerous paste content.');
      this.toast.warning('Invalid content detected. Scripts and HTML tags are not allowed.');
    }
  }

  
  @HostListener('blur')
  onBlur(): void {
    if (this.shouldSkip()) return;
    const raw = this.el.nativeElement.value;
    const clean = this.sanitizer.sanitize(raw);

    if (clean !== raw) {
      this.el.nativeElement.value = clean;
      
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(clean, { emitEvent: true });
      }
    }
  }

  
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (this.shouldSkip()) return;
    const blocked = ['<', '>'];
    if (blocked.includes(event.key)) {
      event.preventDefault();
    }
  }

  private warnAndClean(raw: string): void {
    const clean = this.sanitizer.sanitize(raw);
    this.el.nativeElement.value = clean;
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(clean, { emitEvent: true });
    }
    console.warn('🛡️ [Security] Dangerous input stripped.');
  }
}
