import {platformBrowserDynamic}    from '@angular/platform-browser-dynamic';
// import {platformBrowser} from "@angular/platform-browser";
import {AppModule} from "./app.module";
import {enableProdMode} from "@angular/core";
import "zone.js/dist/zone";
import "rxjs/Rx";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule);