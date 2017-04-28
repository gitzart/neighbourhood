define([
  'jquery',
  'knockout',
], function($, ko) {
  'use strict';

  ko.bindingHandlers.fadeVisible = {
    update: function(element, valueAccessor) {
      var shouldDisplay = valueAccessor();
      return shouldDisplay ? $(element).fadeIn(200) : $(element).fadeOut(200);
    },
  };
});
