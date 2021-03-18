import {TestBed} from "@angular/core/testing";
import {AppComponent} from "./embed-widget.component";

import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {CommonModule} from '@angular/common';
import {HttpModule} from "@angular/http";

import {CardTypeDirective} from "./directives/CardType.directive";
import {SemanticDirective} from "./directives/semantic.directive";
import {ThemeColorDirective} from "./directives/ThemeColor.directive";
import {FontColorDirective} from "./directives/FontColor.directive";
import {VideoEmbedDirective} from "./directives/VideoEmbed.directive";

import {ProgressComponent} from "./components/modules/ProgressBar.component";
import {CardComponent} from "./components/modules/Card.component";
import {AddressComponent} from "./components/modules/Address.component";
import {PhoneComponent} from "./components/modules/Phone.component";
import {CommentComponent} from "./components/comment/Comment.component";
import {LoginComponent} from "./components/modules/Login.component";
import {RegisterComponent} from "./components/modules/Register.component";

import {StreamMessagePipe} from "./Pipe/StreamMessage.pipe";

import {ConstantsGlobal} from "./Constants-Global";

describe("Main App", () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        CommonModule,
        HttpModule
      ],
      declarations: [
        AppComponent,
        CardTypeDirective,
        SemanticDirective,
        ThemeColorDirective,
        FontColorDirective,
        VideoEmbedDirective,
        ProgressComponent,
        CardComponent,
        AddressComponent,
        PhoneComponent,
        CommentComponent,
        LoginComponent,
        RegisterComponent,
        StreamMessagePipe
      ]
    });
  });

  it("is here", () => {
    let app = TestBed.createComponent(AppComponent);
    expect(app.componentInstance instanceof AppComponent).toBe(true, 'should create Appcomponent');
  });

  it("has api url", () => {
    let app = TestBed.createComponent(AppComponent);
    let appInstance = app.componentInstance;
    expect(appInstance.API_HOST).toBe(ConstantsGlobal.API_HOST);
  });

  it("has campaign", (done) => {
    let app = TestBed.createComponent(AppComponent);
    let appInstance = app.componentInstance;
    expect(appInstance.mCampaign).toBeUndefined();
  });
  
});