define([
  'knockout',
], function(ko) {
  'use strict';

  // Location model
  function Location(id, name, position, marker, infoWindow,
                    favorite, filter) {
    var self = this;
    self.id = id;
    self.name = name;
    self.position = position;
    self.marker = marker || null;
    self.infoWindow = infoWindow || null;
    self.isFavorite = ko.observable(favorite || false);
    self.isFiltered = ko.observable(filter || true);
  }

  return Location;
});
