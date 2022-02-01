import { Directive, ElementRef, OnInit } from "@angular/core";
import { ConstantsGlobal } from "../Constants-Global";
declare var jQuery: any;

@Directive({
  selector: "[ngSemantic]"
})

export class SemanticDirective {

  elemClass: string;
  $elem: any;

  constructor(element: ElementRef) {
    this.$elem = jQuery(element.nativeElement);
  }

  ngOnInit() {
    if (this.$elem.hasClass("accordion")) {
      this.$elem.accordion();
    } else if (this.$elem.hasClass("dropdown")) {
      if (this.$elem.hasClass("share-campaign") || this.$elem.hasClass("account-dropdown")) {
        this.$elem.dropdown({
          action: "nothing"
        });
      }
      else {
        this.$elem.dropdown();
      }
    } else if (this.$elem.hasClass("menu")) {
      this.$elem.find(".item").tab();
    } else if (this.$elem.hasClass("progress")) {
      this.$elem.progress();
    }
  }
}
