import {Directive, ElementRef, OnInit, AfterViewInit} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
  selector: "[RewardsFontColor]",
  providers: [UtilService]
})

export class RewardsFontColorDirective {
  constructor(private elementRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    var $element = jQuery(this.elementRef.nativeElement);

    if (UtilService.widgetProp.rewardsfontcolor && $element && $element.length) {
      $element[0].style.setProperty("color", UtilService.widgetProp.rewardsfontcolor, "important");
    }

  }
}
