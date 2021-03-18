/* Service that displays either: 1. time left until end date 2. the date when the campaign ended 3. the date the campaign will begin
called in the home page under the recent campaign sections and in the campaign list on the admin page. */
app.service('TimeStatusService', ['$rootScope', function ($rootScope) {

  this.days_text = "days ago";
  this.day_text = "day ago";
  this.rdays_text = "days to go";
  this.rday_text = "day to go";
  this.hours_text = "hours ago";
  this.hour_text = "hour ago";
  this.rhours_text = "hours to go";
  this.rhour_text = "hour to go";
  this.minutes_text = "minutes ago";
  this.minute_text = "minute ago";
  this.rminutes_text = "minutes to go";
  this.rminute_text = "minute to go";

  var timeStatusObj = {
    timeStatusNumber: '',
    timeStatusText: ''
  }

  this.getTimeStatus = function (campaign) {

    if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && (campaign.days_remaining * -1) > 1) {
      timeStatusObj.timeStatusNumber = campaign.days_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.days_text;
    } else if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && (campaign.days_remaining * -1) == 1) {
      timeStatusObj.timeStatusNumber = campaign.days_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.day_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining > 1) {
      timeStatusObj.timeStatusNumber = campaign.days_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rdays_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 1) {
      timeStatusObj.timeStatusNumber = campaign.days_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rday_text;
    } else if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && (campaign.hours_remaining * -1) > 1) {
      timeStatusObj.timeStatusNumber = campaign.hours_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.hours_text;
    } else if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && (campaign.hours_remaining * -1) == 1) {
      timeStatusObj.timeStatusNumber = campaign.hours_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.hour_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining > 1) {
      timeStatusObj.timeStatusNumber = campaign.hours_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rhours_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining == 1) {
      timeStatusObj.timeStatusNumber = campaign.hours_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rhour_text;
    } else if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining == 0 && (campaign.minutes_remaining * -1) > 1) {
      timeStatusObj.timeStatusNumber = campaign.minutes_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.minutes_text;
    } else if (this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining == 0 && (campaign.minutes_remaining * -1) == 1) {
      timeStatusObj.timeStatusNumber = campaign.minutes_remaining_inclusive * -1;
      timeStatusObj.timeStatusText = this.minute_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining == 0 && campaign.minutes_remaining > 1) {
      timeStatusObj.timeStatusNumber = campaign.minutes_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rminutes_text;
    } else if (!this.dateInPast(campaign.ends, campaign.seconds_remaining) && campaign.days_remaining == 0 && campaign.hours_remaining == 0 && campaign.minutes_remaining == 1) {
      timeStatusObj.timeStatusNumber = campaign.minutes_remaining_inclusive;
      timeStatusObj.timeStatusText = this.rminute_text;
    }
    return timeStatusObj;
  }

  this.dateInPast = function (value, sec) {
    if (sec == 0 || sec == "00" || sec < 0) {
      return true;
    } else {
      return false;
    }
  }
}]);