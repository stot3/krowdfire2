app.service('ThemeService', function(Restangular, $timeout, PortalSettingsService) {
  var number_theme = 8;
  var scope = {};
  scope.theme_classes = [];
  scope.top_nav_theme = {};


  scope.topNav = function() {
    PortalSettingsService.getSettingsObj().then(function(success) {
      return success.public_setting.site_top_nav_theme;
    });
  }

  scope.init = function(){
    PortalSettingsService.getSettingsObj().then(function(success) {

      //legacy colors
      legacyColors = [
        '#FAFAFA',
        '#DB4DDB',
        '#94CA20',
        '#00B5AD',
        '#4C9EE7',
        '#D13F2B',
        '#FF9E35',
        '#FFCC00',
        '#8B69DB',
        '#333333',
        '#ffffff',
        '#00caf2',
        '#FF0081',
      ]

      var root = document.documentElement;
      var colors = success.public_setting.site_theme_color;
      if(colors.top_nav_background_color.value)
        root.style.setProperty('--top-nav-bg-color', colors.top_nav_background_color.value);
      else
        root.style.setProperty('--top-nav-bg-color', legacyColors[colors.top_nav_background_color.index]);
      if(colors.top_nav_font_color.value)
        root.style.setProperty('--top-nav-font-color', colors.top_nav_font_color.value);
      else
        root.style.setProperty('--top-nav-font-color', legacyColors[colors.top_nav_font_color.index]);
      if(colors.table_color.value)
        root.style.setProperty('--table-color', colors.table_color.value);
      else
        root.style.setProperty('--table-color', legacyColors[colors.table_color.index]);
      //root.style.setProperty('--table-color-hover', colors);
      //root.style.setProperty('--table-color-alter', colors);
      if(colors.reward_block_color.value)
        root.style.setProperty('--reward-color', colors.reward_block_color.value);
      else
        root.style.setProperty('--reward-color', legacyColors[colors.reward_block_color.index]);
      if(colors.footer_font_color.value)
        root.style.setProperty('--footer-font-color', colors.footer_font_color.value);
      else
        root.style.setProperty('--footer-font-color', legacyColors[colors.footer_font_color.index]);
      if(colors.footer_background_color.value)
        root.style.setProperty('--footer-bg-color', colors.footer_background_color.value);
      else
        root.style.setProperty('--footer-bg-color', legacyColors[colors.footer_background_color.index]);
      if(colors.font_color.value)
        root.style.setProperty('--font-color', colors.font_color.value);
      else
        root.style.setProperty('--font-color', legacyColors[colors.font_color.index]);
      if(colors.button_color.value)
        root.style.setProperty('--button-color', colors.button_color.value);
      else
        root.style.setProperty('--button-color', legacyColors[colors.button_color.index]);
      if(colors.banner_color.value)
        root.style.setProperty('--banner-color', colors.banner_color.value);
      else
        root.style.setProperty('--banner-color', legacyColors[colors.banner_color.index]);
    });
  }

  scope.themeColor = function() {
      scope.theme_classes = [
        'theme-button',
        'theme-table',
        'theme-banner',
        'theme-font',
        'theme-reward',
        'theme-top-nav-background',
        'theme-top-nav-font',
        'theme-footer-background',
        'theme-footer-font', 
      ];
      return scope.theme_classes;
  }
  scope.refresh = function() {
    this.themeColor();
  }

  return scope;
});