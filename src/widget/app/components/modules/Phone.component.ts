import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import {ConstantsGlobal} from "../../Constants-Global";
import { TranslationService } from '../../service/Translation.service';

declare var jQuery: any;

@Component({
  selector: 'phone-form',
  template: require("raw-loader!./Phone.html")
})

export class PhoneComponent implements OnInit {

  @Input() phoneObj: any;

  PHONE_TYPES: Array<any> = [
    {
      name: "Landline",
      id: 1
    },
    {
      name: "Mobile",
      id: 2
    },
    {
      name: "Fax",
      id: 3
    }
  ]

  constructor(@Inject(TranslationService) private translationService: TranslationService) {
    this.translationService.setupTranslation("campaign_phone"); 
  }

  ngOnInit() {
    this.phoneObj.phone_number_type_id = this.PHONE_TYPES[1].id;
  }

  ngAfterViewInit() {
    jQuery(".phone-type-dropdown").dropdown();
  }

  onPhoneTypeSelected(typeId: number) {
    this.phoneObj.phone_number_type_id = typeId;
  }

  /**
   * Translate Function
   */
  translate(name){
    return TranslationService.translation[name];
  }
}