define([
  'jquery',
  'knockout',
  'models/Location',
], function($, ko, Location) {
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
    self.nearbyVenues = [];
    self.selectedNearbyVenue = ko.observableArray();
    self.foursquareAPI = {
      version: '20170410',
      clientID: '1C1I0SPV4ZZ4YDKCGFAIJ3BLE0MLOM3RDW1SYKBKUSXLOXIE',
      clientSecret: 'G0NPXGT4NMLOH0W2CWBZEA5HPAYKXUNAHD55YT21AGPMPXYM',
    };

    // Initialize location data
    self.locations(ko.utils.arrayMap(
      data.locations,
      function(location, index) {
        location.id = index;
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

    self.openInfoWindow = function(location) {
      self.map.triggerMarkerEvent(self.markers[location.id], 'click');
      self.findNearbyVenues(location);
    };

    self.findNearbyVenues = function(location) {
      var url = 'https://api.foursquare.com/v2/venues/explore';
      if (self.nearbyVenues[location.id]) {
        self.selectedNearbyVenue(self.nearbyVenues[location.id]);
        return;
      }
      self.nearbyVenues[location.id] = [];
      $.get(url, {
        ll: location.position.lat + ',' + location.position.lng,
        venuePhotos: true,
        // limit: 5,
        client_id: self.foursquareAPI.clientID,
        client_secret: self.foursquareAPI.clientSecret,
        v: self.foursquareAPI.version,
      })
        .done(function(data, status, xhr) {
          console.log('donedonedone');
          $.each(data.response.groups[0].items, function(i, v) {
            self.nearbyVenues[location.id].push({
              id: v.venue.id,
              name: v.venue.name,
              categoryName: v.venue.categories[0].name,
              categoryIcon: v.venue.categories[0].icon.prefix +
                'bg_32' + v.venue.categories[0].icon.suffix,
              photo: v.venue.photos.groups[0].items[0].prefix +
                'width342' + v.venue.photos.groups[0].items[0].suffix,
              rating: v.venue.rating,
              tip: v.tips[0].text,
            });
          });
          self.selectedNearbyVenue(self.nearbyVenues[location.id]);
        })
        .fail(function(xhr, status, error) {

        });
    };

    self.closeInfoWindow = function(location) {
      self.map.triggerInfoWindowEvent(
        self.map._infowindows[location.id],
        'closeclick'
      );
    };

    self.toggleMarkerHighlight = function(location) {
      var marker = self.markers[location.id];
      var event = marker.getIcon() ? 'mouseout' : 'mouseover';
      self.map.triggerMarkerEvent(marker, event);
    };
  };

  return LocationViewModel;
});
