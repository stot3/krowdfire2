import {Directive, ElementRef, Input, SimpleChange} from "@angular/core";
declare var jQuery: any;

@Directive({
  selector: "[videoEmbed]"
})

export class VideoEmbedDirective {

  @Input() campaign: any;
  $elem: any;

  constructor(private element: ElementRef) {
    this.$elem = jQuery(element.nativeElement);
    if (this.campaign && this.$elem.embed) {
      this.getFeaturedVideo(this.campaign);
    }
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    if (changes["campaign"].currentValue && this.$elem.embed) {
      this.getFeaturedVideo(changes["campaign"].currentValue);
    }
  }

  getFeaturedVideo(campaign: any) {
    if (campaign.links != null && campaign.links.length) {
      for (var index in campaign.links) {
        if (campaign.links[index].resource_content_type_id == 1 && campaign.links[index].resource_content_type == "video") {
          var link = campaign.links[index].uri;
          var source = "", id = "";
          if (link.indexOf("youtu") != -1) {
            source = "youtube";
            var watchParam = "watch?v=", timeParam = "?t=";
            if (link.indexOf(watchParam) != -1) {
              if (link.indexOf(timeParam) != -1) {
                id = link.substr(link.indexOf(watchParam) + watchParam.length, link.indexOf(timeParam) - link.indexOf(watchParam) - watchParam.length);
              }
              else {
                id = link.substr(link.indexOf(watchParam) + watchParam.length);
              }
            }
            else if (link.indexOf("youtu.be") != -1) {
              var youtubeParam = "youtu.be/";
              if (link.indexOf(youtubeParam) != -1 && link.indexOf(timeParam) != -1) {
                id = link.substr(link.indexOf(youtubeParam) + youtubeParam.length, link.indexOf(timeParam) - link.indexOf(youtubeParam) - link.indexOf(watchParam));
              }
              else {
                id = link.substr(link.indexOf(youtubeParam) + youtubeParam.length);
              }
            }
          }
          else if (link.indexOf("vimeo") != -1) {
            source = "vimeo";
            id = link.split("/")[link.split("/").length - 1];
            if (id.indexOf("?") != -1) {
              id = id.substr(0, id.indexOf("?"));
            }
          }
          campaign.videoObj = {
            "source": source,
            "id": id
          };
          campaign.links[index].uri;
          this.setVideo();
          break;
        }
      }
    }
  }

  setVideo(){
    this.$elem.embed({
      source: this.campaign.videoObj.source,
      id: this.campaign.videoObj.id
    });
  }

}
