define([
  'knockout',
  'models/Location',
], function(ko, Location) {
  'use strict';

  var LocationViewModel = function(data) {
    var self = this;

    /* =======================================================
     =================== Data
     ========================================================= */
    self.map = data.map;
    self.locations = ko.observableArray();
    self.markers = data.map._markers;
    self.keyword = ko.observable();

    // Initialize location data
    self.locations(ko.utils.arrayMap(data.locations, function(location) {
      return new Location(location);
    }));

    /* =======================================================
     =================== Operations
     ========================================================= */

    // Filter the locations by the given keyword and
    // only show the relative markers and hide the rest
    self.filterLocations = function() {
      setTimeout(function() {
        var re = new RegExp(self.keyword().trim(), 'i');
        ko.utils.arrayForEach(self.locations(), function(location, index) {
          if (re.test(location.title)) {
            location.filtered(true);
            self.map.showMarker(self.markers[index]);
          } else {
            location.filtered(false);
            self.map.hideMarker(self.markers[index]);
          }
        });
      }, 250);
    };

    self.openInfoWindow = function(index, location) {
      self.map.triggerMarkerEvent(self.markers[index()], 'click');
    };

    self.closeInfoWindow = function(index, location) {
      self.map.triggerInfoWindowEvent(
        self.map._infowindows[index()],
        'closeclick'
      );
    };

    self.toggleMarkerHighlight = function(index, location) {
      var marker = self.markers[index()];
      var event = marker.getIcon() ? 'mouseout' : 'mouseover';
      self.map.triggerMarkerEvent(marker, event);
    };
  };

  return LocationViewModel;
});
