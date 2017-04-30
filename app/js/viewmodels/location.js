define([
  'jquery',
  'knockout',
  'googlemap',
  'models/Location',
], function($, ko, GoogleMap, Location) {
  'use strict';

  // Map style provided by https://snazzymaps.com and
  // https://snazzymaps.com/style/72543/assassins-creed-iv
  var somosAssassinos = [{"featureType":"all","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels","stylers":[{"saturation":"-100"},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#d5c8a5"},{"lightness":40},{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"lightness":16},{"color":"#000000"}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":20},{"color":"#000000"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#4d6059"}]},{"featureType":"landscape","elementType":"geometry.stroke","stylers":[{"color":"#4d6059"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#604d4d"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#30423d"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#30423d"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#7f8d89"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#7f8d89"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#44474e"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#7f8d89"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#3e5851"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#3e5851"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#3e5851"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#3e5851"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19},{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#2b3638"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2b3638"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#24282b"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"color":"#24282b"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}];

  var map = new GoogleMap().create(document.querySelector('#map-canvas'), {
    center: {lat: 40.7713024, lng: -73.9332393},
    zoom: 8,
    styles: somosAssassinos,
  });
  var overlayMap = new GoogleMap().create(
    document.querySelector('#overlay-map-canvas'));
  var foursquareAPI = {
    version: '20170410',
    clientID: '1C1I0SPV4ZZ4YDKCGFAIJ3BLE0MLOM3RDW1SYKBKUSXLOXIE',
    clientSecret: 'G0NPXGT4NMLOH0W2CWBZEA5HPAYKXUNAHD55YT21AGPMPXYM',
  };

  function LocationViewModel(data) {
    var self = this;

    self.destinations = ko.observable({
      bounds: map.bounds().create(),
      info: ko.observableArray(),
    });
    self.venues = ko.observable({});
    self.keyword = ko.observable();
    self.focusedLocation = ko.observable();

    // Initialize destination data
    self.destinations().info($.map(data, function(d, index) {
      var marker = map.marker().create({
        id: index,
        position: d.position,
        title: d.name,
        animation: true,
      });

      if (d.isFavorite) {
        marker.addIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
      }

      var infoWindow = map.infoWindow().create({
        id: index,
        content: d.name,
        maxWidth: 200,
      });

      // Create new `Location` instance and add new properties.
      var destination = new Location(index, d.name, d.position,
                                     marker, infoWindow, d.isFavorite);
      destination.nearbyVenues = {
        bounds: overlayMap.bounds().create(),
        info: ko.observableArray(),
      };

      self.destinations().bounds.extend(marker._marker.getPosition());

      // Add marker events
      marker.event.click(function() {
        marker.bounce();
        infoWindow.open(marker._marker);
        if (!self.focusedLocation()) {
          self.focusedLocation(destination);
          // Move `destination` marker to the `overlayMap`.
          overlayMap.trigger.resize();
          overlayMap._map.setOptions({
            center: destination.position,
            zoom: 16,
          });
          destination.marker._marker.setMap(overlayMap._map);
          self.findNearbyVenues(destination);
        }
      })
        .mouseOver(function() {
          if (!self.focusedLocation()) {
            infoWindow.open(marker._marker);
          }
        })
        .mouseOut(function() {
          if (!self.focusedLocation()) {
            infoWindow.close();
          }
        });

      // Add infoWindow events
      infoWindow.event.close(function() {
        infoWindow.close();
      });

      return destination;
    }));

    // Bound initially when the destination data loads.
    self.destinations().bounds.fit();

    // Save the destinations to the localStorage.
    self.saveDestinations = function() {
      var dests = self.destinations().info();
      var o = ko.observableArray($.map(dests, function(d, index) {
        return {
          id: d.id,
          name: d.name,
          position: d.position,
          isFavorite: d.isFavorite,
        };
      }));
      localStorage.setItem('destinations', ko.toJSON(o));
    };

    // Save the destinations initially
    self.saveDestinations();

    // Search the destinations
    self.filter = function() {
      var re = new RegExp(self.keyword().trim(), 'i');
      $.each(self.destinations().info(), function(index, d) {
        if (re.test(d.name)) {
          d.marker.show();
          d.isFiltered(true);
        } else {
          d.marker.hide();
          d.isFiltered(false);
        }
      });
    };

    // Open, close, or toggle the infoWindow of `Location` instances.
    // Both destinations and venues.
    self.openInfoWindow = function(location) {
      location.marker.trigger.click();
    };

    self.closeInfoWindow = function(location) {
      location.infoWindow.trigger.close();
    };

    self.toggleInfoWindow = function(location, evt) {
      // Marker events of `destinations` and `venues` are
      // defined differently.
      // Destination marker events
      if (evt.type === 'mouseover') {
        location.marker.trigger.mouseOver();
      } else if (evt.type === 'mouseout') {
        location.marker.trigger.mouseOut();
      }

      // Venue marker events
      if (evt.type === 'click') {
        if (location.infoWindow.isActive) {
          location.infoWindow.isActive = false;
          self.closeInfoWindow(location);
        } else {
          location.infoWindow.isActive = true;
          self.openInfoWindow(location);
        }
      }
    };

    // Mark/unmark a favorite destination.
    self.toggleFavorite = function(destination) {
      if (destination.isFavorite()) {
        destination.marker.removeIcon();
      } else {
        destination.marker.addIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
      }
      destination.isFavorite(!destination.isFavorite());
      self.saveDestinations();
    };

    // Close the overlay HTML
    self.closeOverlay = function() {
      self.focusedLocation().marker._marker.setMap(map._map);
      self.focusedLocation(false);
    };

    // Show the destination and venue markers on the map.
    self.showInMap = function(venue) {
      var dest = self.focusedLocation();
      // Hide previously opened markers and infowindows.
      $.each(dest.nearbyVenues.info(), function(index, v) {
        v.marker.hide();
        self.closeInfoWindow(v);
      });
      // Fixed the bounding bug
      // BUG: `infoWindow` takes its own space when opened
      // which results in some markers, when bounded, cannot be seen,
      // clipped, hidden by the map viewport.
      self.closeInfoWindow(dest);
      venue.marker.show();
      overlayMap.bounds().create()
        .extend(dest.position)
        .extend(venue.position)
        .fit();
    };

    // Find the interesting venues around the selected destination.
    self.findNearbyVenues = function(dest) {
      if (dest.nearbyVenues.info().length) {
        self.venues(dest.nearbyVenues);
        return;
      }

      // Reset the `venues` instance.
      self.venues({});

      // Empty the '.venue-layout__content' HTML element
      $('.venue-layout__content').empty();

      // Fetch the data if not done already.
      $.get('https://api.foursquare.com/v2/venues/explore', {
        ll: dest.position.lat + ',' + dest.position.lng,
        venuePhotos: true,
        // limit: 5,
        client_id: foursquareAPI.clientID,
        client_secret: foursquareAPI.clientSecret,
        v: foursquareAPI.version,
      })
        .done(function(data, status, xhr) {
          var venues = data.response.groups[0].items;

          if (venues.length === 0) {
            $('.venue-layout__content').empty();
            $('<div/>')
              .addClass('error')
              .append('No venues exist :(')
              .appendTo('.venue-layout__content');
            return;
          }

          dest.nearbyVenues.info($.map(venues, function(v, index) {
            var name = v.venue.name;

            var position = {
              lat: v.venue.location.lat,
              lng: v.venue.location.lng,
            };

            var marker = overlayMap.marker().create({
              id: index,
              position: position,
              title: name,
            })
              .addIcon('https://maps.google.com/mapfiles/ms/icons/yellow-dot.png')
              .hide();

            var infoWindow = overlayMap.infoWindow().create({
              id: index,
              content: name,
              maxWidth: 200,
            });

            // Create new `Location` instance and add new properties
            var venue = new Location(v.venue.id, name, position,
                                     marker, infoWindow);
            venue.address = {
              street: v.venue.location.formattedAddress[0],
              state: v.venue.location.formattedAddress[1],
              country: v.venue.location.formattedAddress[2],
            };
            venue.category = {
              name: v.venue.categories[0].name,
              icon: v.venue.categories[0].icon.prefix +
                '32' + v.venue.categories[0].icon.suffix,
            };
            venue.photo = v.venue.photos.groups[0].items[0].prefix +
              'width320' + v.venue.photos.groups[0].items[0].suffix;
            venue.rating = v.venue.rating;
            venue.tip = v.tips ? v.tips[0].text : 'No tips available :(';

            dest.nearbyVenues.bounds.extend(marker._marker.getPosition());

            // Add marker and infoWindow events
            marker.event.click(function() {
              infoWindow.open(marker._marker);
            });

            infoWindow.event.close(function() {
              infoWindow.close();
            });

            return venue;
          }));
          self.venues(dest.nearbyVenues);
        })
        .fail(function(xhr, status, error) {
          $('.venue-layout__content').empty();
          $('<div/>')
            .addClass('error mdl-typography--display-1')
            .append(xhr.status + ' ' + error)
            .appendTo('.venue-layout__content');
          throw error;
        });
    };
  }

  return LocationViewModel;
});
