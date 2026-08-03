import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true,
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';
    const stringValue = value.toString().replace(/\D/g, '');
    if (stringValue.length === 10) {
      return `(${stringValue.substring(0, 3)}) ${stringValue.substring(3, 6)}-${stringValue.substring(6)}`;
    }
    if (stringValue.length === 11) {
      return `+${stringValue.charAt(0)} (${stringValue.substring(1, 4)}) ${stringValue.substring(
        4,
        7
      )}-${stringValue.substring(7)}`;
    }
    return value.toString();
  }
}
