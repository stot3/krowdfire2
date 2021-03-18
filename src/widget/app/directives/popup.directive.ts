import {Directive, ElementRef, OnInit} from '@angular/core';

declare var jQuery: any;

// Angular directive decorator
@Directive({
  selector: '[popupInit]'
})

export class PopupDirective implements OnInit {
  // ElementRef grants us direct access to the DOM element through its nativeElement property
  element: ElementRef;

  constructor(element: ElementRef) {
    this.element = element;
  }
  ngOnInit() {
    jQuery(this.element.nativeElement).popup();
  }
}
