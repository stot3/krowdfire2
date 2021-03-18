import {Component, Input, OnInit, ElementRef} from "@angular/core"
import {UtilService} from "../../service/Util.service";

declare var jQuery: any;

@Component({
  selector: 'ng-prog',
  template: require("raw-loader!./ProgressBar.html"),
  providers: [UtilService]
})

export class ProgressComponent {
  @Input() progressValue: number;
  @Input() progressID: string;
  @Input() isProfile: boolean;

  element: any;

  constructor(elementRef: ElementRef) {
    this.element = elementRef.nativeElement;
    if (!this.isProfile) {
      this.isProfile = false;
    }
  }

  ngAfterViewInit() {
    this.progressValue = this.progressValue >= 100 ? 100 : this.progressValue;
    jQuery("#" + this.progressID).progress({
      percent: this.progressValue
    });
  }

  ngOnChanges() {
    this.progressValue = this.progressValue >= 100 ? 100 : this.progressValue;
    jQuery("#" + this.progressID).progress({
      percent: this.progressValue
    });
  }
}
