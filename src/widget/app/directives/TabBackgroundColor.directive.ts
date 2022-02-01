import {Directive, ElementRef, OnInit, AfterViewInit} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
  selector: "[TabBackgroundColor]",
  providers: [UtilService]
})

export class TabBackgroundColorDirective {
  constructor(private elementRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var $element = jQuery(this.elementRef.nativeElement);

    if (UtilService.widgetProp.tabbackgroundcolor && $element && $element.length) {
      $element[0].style.setProperty("background", UtilService.widgetProp.tabbackgroundcolor, "important");
    }

  }
}
