import {Directive, ElementRef, OnInit, AfterViewInit} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
  selector: "[PaymentFontColor]",
  providers: [UtilService]
})

export class PaymentFontColorDirective {
  constructor(private elementRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var $element = jQuery(this.elementRef.nativeElement);

    if (UtilService.widgetProp.paymentfontcolor && $element && $element.length) {
      $element[0].style.setProperty("color", UtilService.widgetProp.paymentfontcolor, "important");
    }

  }
}
