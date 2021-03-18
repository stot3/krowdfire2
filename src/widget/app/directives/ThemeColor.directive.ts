import {Directive, OnInit, AfterViewInit, ElementRef} from "@angular/core";
import {UtilService} from "../service/Util.service";

declare var jQuery: any;

@Directive({
    selector: "[ThemeColor]",
    providers: [UtilService]
})

export class ThemeColorDirective {

    constructor(private elementRef: ElementRef) {

    }

    ngInit() {

    }

    ngAfterViewInit() {
        var $element = jQuery(this.elementRef.nativeElement);
        if (UtilService.widgetProp.themecolor && $element && $element.length) {
            $element[0].style.setProperty("background-color", UtilService.widgetProp.themecolor, "important");
        }
    }
}
