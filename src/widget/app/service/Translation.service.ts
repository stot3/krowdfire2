import { Http, Headers, RequestOptions, Response } from "@angular/http";
import { Injectable } from "@angular/core";
import { ConstantsGlobal } from "../Constants-Global";

declare var jQuery: any;

@Injectable()
export class TranslationService {
  public static translation: any = "";
  preferredTranslation: any = [];
  defaultTranslation: any = [];
  mergedTranslation: any;
  public static loadedTranslations: Array<string> = [];
  private translationPath: string;
  private options: any;

  constructor(private http: Http) {
    let headers = new Headers();
    this.options = new RequestOptions({
      headers: headers,
      withCredentials: false
    });
  }

  getTranslationPath() {
    switch (process.env.ENV) {
      case "development":
        this.translationPath = "/translations/";
        break;
      case "production":
        if(!ConstantsGlobal.getSiteURL()) {
          this.translationPath = ConstantsGlobal.getSiteHost() + "/widget/translations/";
        } else {
          this.translationPath = ConstantsGlobal.getSiteURL() + "/widget/translations/";
        }
        break;
      default:
        this.translationPath = "/translations/";
    }
  }

  setupTranslation(componentName) {
    this.getTranslationPath();
    if (jQuery.inArray(componentName, TranslationService.loadedTranslations) == -1) {
      TranslationService.loadedTranslations.push(componentName);
      this.http.get(this.translationPath + ConstantsGlobal.DEFAULT_LANG + '/' + componentName + '.json', this.options)
        .map((res: Response) => res.json())
        .subscribe(
        translation => {
          this.defaultTranslation = Object.assign({}, this.defaultTranslation, translation)
          this.setupPreferredTranslation(componentName);
        }
        );
    }
  }

  setupPreferredTranslation(componentName) {
    this.getTranslationPath();
    if (ConstantsGlobal.PREFERRED_LANG != ConstantsGlobal.DEFAULT_LANG) {
      this.http.get(this.translationPath + ConstantsGlobal.PREFERRED_LANG + '/' + componentName + '.json', this.options)
        .map((res: Response) => res.json())
        .subscribe(
        translation => {
          this.preferredTranslation = Object.assign({}, this.defaultTranslation, translation);
          this.mergedTranslations();
        },
        error => {this.mergedTranslations()},
        );
    } else {
      this.mergedTranslations();
    }
  }

  mergedTranslations() {
    this.mergedTranslation = this.defaultTranslation;
    for (let index in this.defaultTranslation) {
      if (this.preferredTranslation[index]) {
        this.mergedTranslation[index] = this.preferredTranslation[index];
      }
    }

    let original = TranslationService.translation;
    let merged = this.mergedTranslation;
    jQuery.extend(merged, original);
    TranslationService.translation = merged;
  }

}
