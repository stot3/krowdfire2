import {Directive, ElementRef, OnInit, AfterViewInit} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
  selector: "[StreamsFontColor]",
  providers: [UtilService]
})

export class StreamsFontColorDirective {
  constructor(private elementRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var $element = jQuery(this.elementRef.nativeElement);

    if (UtilService.widgetProp.streamsfontcolor && $element && $element.length) {
      $element[0].style.setProperty("color", UtilService.widgetProp.streamsfontcolor, "important");
    }

  }
}
