import {Directive, ElementRef, OnInit, AfterViewInit} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
  selector: "[FontColor]",
  providers: [UtilService]
})

export class FontColorDirective {
  constructor(private elementRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var $element = jQuery(this.elementRef.nativeElement);

    if (UtilService.widgetProp.fontcolor && $element && $element.length) {
      $element[0].style.setProperty("color", UtilService.widgetProp.fontcolor, "important");
    }

  }
}
