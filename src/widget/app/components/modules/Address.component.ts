import { Component, Input, Inject, Output, OnInit, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { SemanticDirective } from "../../directives/semantic.directive";
import { ConstantsGlobal } from "../../Constants-Global";
import { UtilService } from "../../service/Util.service";
import { Http } from "@angular/http";
import { TranslationService } from '../../service/Translation.service';
import { Subject } from "rxjs/Subject";

declare var jQuery: any;

@Component({
  selector: "address-form",
  template: require("raw-loader!./Address.html")
})

export class AddressComponent implements OnInit {

  @Input() addressObj: Object;
  @Output() selectedCity = new EventEmitter();
  addressRes: Array<Object>;
  addressCity2: String;
  addressChange = new Subject<string>();

  constructor(private http: Http, @Inject(TranslationService) private translationService: TranslationService) {
    this.addressChange
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(
        res => this.queryAddress(res)
    );

    this.translationService.setupTranslation("campaign_address");
  }

  ngOnInit() {

  }

  onChangeCity(evt: any) {
    this.addressChange.next(evt);
  }

  setAddressRes(evt: Object) {
    let res: Array<Object> = evt["value"];
    this.addressRes = res;
    if (this.addressRes.length == 1) {
      this.onSelectAddress(this.addressRes[0]);
    }
  }

  onSelectAddress(city: any) {
    this.addressObj["city_id"] = city.city_id;
    this.addressObj["city"] = city.city;
    this.addressObj["country"] = city.country;

    this.selectedCity.emit(city);
  }

  onSearchBlur() {
    let value = jQuery(".cityDropdown").dropdown("get value");
    let item = jQuery(".cityDropdown").dropdown("get item", value);
    let cityid = jQuery(item).attr("id");
    if (this.addressObj.hasOwnProperty("city_id") && this.addressObj["city_id"] != cityid) {
      this.addressObj["city_id"] = cityid;
    }
  }

  queryAddress(query: string) {
    let cityQueryUrl = ConstantsGlobal.getApiUrl() + "locale/city/" + query;
    this.http.get(cityQueryUrl)
      .map(res => res.json())
      .subscribe(
      res => {
        this.setAddressRes({ value: res });
      },
      error => UtilService.logError(error)
      );
  }

  /**
   * Translate Function
   */
  translate(name) {
    return TranslationService.translation[name];
  }
}
