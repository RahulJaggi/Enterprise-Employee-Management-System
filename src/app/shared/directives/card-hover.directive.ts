import { Directive, HostListener, HostBinding, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appCardHover]',
  standalone: true,
})
export class CardHoverDirective {
  private readonly el = inject(ElementRef);

  @HostBinding('style.transition') transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
  @HostBinding('style.cursor') cursor = 'pointer';

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.transform = 'translateY(-4px)';
    this.el.nativeElement.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.transform = 'translateY(0)';
    this.el.nativeElement.style.boxShadow = 'none';
  }
}
