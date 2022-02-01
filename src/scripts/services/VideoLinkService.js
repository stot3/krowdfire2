// Service for determining how to display video.
app.service('VideoLinkService', function($sce, RESOURCE_REGIONS) {

  var current_link = "";
  var video_type = "";
  var video_link = "";
  var video_id = "";
  var settings = { mute: true, autoplay: false };

  this.get_video_type = function() {
    return video_type;
  }

  this.get_video_link = function() {
    return video_link;
  }

  this.set_video_type = function(type) {
    video_type = type;
  }

  this.set_video_link = function(link, trust) {
    if (trust) {
      video_link = $sce.trustAsResourceUrl(link);
    } else {
      video_link = link;
    }
  }

  this.setSettings = function(setting_data) {
    settings = setting_data;
  }

  // Detects youtube and vimeo links, custom otherwise
  this.check_video_type = function(link) {
    video_type = "custom";

    if (!link || link.length <= 0) {
      video_type = "none";
      return;
    }
    if (link.indexOf("youtube") >= 0 || link.indexOf("youtu.be") >= 0) {
      video_type = "youtube";
    } else if (link.indexOf("vimeo") >= 0) {
      video_type = "vimeo";
    }
  }

  // Extracts id of video and places in corrisponding link/code. If custom just use the link.
  this.processVideoLink = function(link, campaign_id) {
    if (video_type == "" ||
      current_link != link) {
      this.check_video_type(link);
    }
    if (campaign_id === undefined) {
      campaign_id == "";
    }
    // Extract id of youtube or vimeo video.
    if (video_type == "youtube") {
      // retrieve video id from URL
      var url = new URL(link);
      var video_id;
      if(url.hostname == 'youtu.be'){
        if(!url.pathname){
          return;
        }
        video_id = url.pathname.slice(1,url.pathname.length);
      }
      else{
        if(!url.searchParams){
          return;
        }
        video_id = url.searchParams.get('v');
      }
      this.set_video_link(video_id, false);

    } else if (video_type == "vimeo") {
      var lastIndex = link.lastIndexOf("/");
      if (lastIndex >= 0) {
        video_id = link.substring(lastIndex + 1);
        lastIndex = video_id.lastIndexOf("?");
        if (lastIndex >= 0) {
          video_id = video_id.substring(0, lastIndex);
        }
      }
      var vimeo_link = "https://player.vimeo.com/video/" + video_id + "?&badge=0&loop=1&title=false&byline=false";

      if ((settings.mute && settings.mute == true) ||
        (settings.thumbnail && settings.thumbnail == true)) {
        vimeo_link += "&muted=1";
      }
      if (settings.autoplay == true) {
        vimeo_link += "&autoplay=1";
      }
      this.set_video_link(vimeo_link, true);
    } else {
      this.set_video_link(link, true);
    }
  }

  // Checks region 6 for a link and extracts video id.
  this.proccessCampaigns = function(campaigns) {
    if (campaigns.length <= 0) {
      return campaigns;
    }
    for (var i = 0; i < campaigns.length; i++) {
      if (campaigns[i].links) {
        var thumbnailVideoLink = "";
        for (var j = 0; j < campaigns[i].links.length; j++) {
          if (campaigns[i].links[j].region_id == RESOURCE_REGIONS.campaign.thumbnail_video) {
            thumbnailVideoLink = campaigns[i].links[j].uri;
          }
        };
        if (thumbnailVideoLink != "") {
          var videoSettings = { mute: true, autoplay: true };
          this.setSettings(videoSettings);

          this.processVideoLink(thumbnailVideoLink, campaigns[i].id);

          campaigns[i].thumbnail_video_type = this.get_video_type();
          campaigns[i].thumbnail_video_link = this.get_video_link();
        }
      }
    };

    return campaigns;
  }

  // Youtube api code.
  this.onYouTubePlayerAPIReady = function(id, campaign_id) {
    if (id === undefined) {
      id = video_id;
    }
    var youtubeTarget = 'ytplayer';
    if (campaign_id != "" &&
      campaign_id !== undefined) {
      youtubeTarget += "-" + campaign_id;
    }
    var ytPlayer = new YT.Player(youtubeTarget, {
      playerVars: {
        autoplay: settings.autoplay ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        showinfo: 0,
        loop: 1,
        playlist: id,
      },
      videoId: id,
      events: {
        'onReady': this.onPlayerReady
      }
    });
  }

  // The API will call this function when the video player is ready.
  this.onPlayerReady = function(event) {
    if ((settings.mute && settings.mute == true) ||
      (settings.thumbnail && settings.thumbnail == true)) {
      event.target.mute();
    }
  }
});