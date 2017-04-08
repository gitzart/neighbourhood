define([
  'knockout',
], function(ko) {
  'use strict';

  // Location model
  var Location = function(data) {
    var self = this;
    self.title = data.title;
    self.position = data.position;
    self.filtered = ko.observable(true);
  };

  return Location;
});
