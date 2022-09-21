import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
@Pipe({
  name: 'safeURL'
})
export class SafeURLPipe implements PipeTransform {
  constructor( private sanitizer: DomSanitizer) {  }
 public transform(value: string):SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }

}
