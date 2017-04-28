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
  var overlayMap = new GoogleMap();
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
    self.isLocationFocused = ko.observable(false);

    // Initialize destination data
    self.destinations().info($.map(data, function(d, index) {
      var marker = map.marker().create({
        id: index,
        position: d.position,
        title: d.name,
        animation: true,
      });

      var infoWindow = map.infoWindow().create({
        id: index,
        content: d.name,
        maxWidth: 200,
      });

      // Create new `Location` instance and add new properties.
      var destination = new Location(index, d.name, d.position,
                                     marker, infoWindow);
      destination.nearbyVenues = {
        bounds: map.bounds().create(),
        info: ko.observableArray(),
      };

      self.destinations().bounds.extend(marker._marker.getPosition());

      // Add marker events
      marker.event.click(function() {
        marker.bounce();
        self.isLocationFocused(destination);
        self.findNearbyVenues(destination);
        // Can delete mouse events
      })
        .mouseOver(function() {
          if (!self.isLocationFocused()) {
            infoWindow.open(marker._marker);
          }
        })
        .mouseOut(function() {
          if (!self.isLocationFocused()) {
            infoWindow.close();
          }
        });

      // Add infoWindow events
      infoWindow.event.close(function() {
        infoWindow.close();
        self.isLocationFocused(false);
      });

      return destination;
    }));

    // Bound the destination markers, not venue markers.
    self.boundDestinations = function() {
      self.destinations().bounds.fit();
      // map.event.centerChanged(function() {
      //   map._center = self.destinations().bounds.center();
      // });
    };

    // Bound initially when the destination data loads.
    self.boundDestinations();

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
      // Slide in the side navigation drawer.
      document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer();
      location.marker.trigger.click();
    };

    self.closeInfoWindow = function(location) {
      location.infoWindow.trigger.close();
    };

    self.toggleInfoWindow = function(location, evt) {
      // Marker events of `destinations` and `venues` are
      // defined differently.
      if (evt.type === 'mouseover') {  // Destination marker events
        location.marker.trigger.mouseOver();
      } else if (evt.type === 'mouseout') {
        location.marker.trigger.mouseOut();
      } else if (evt.type === 'click') {  // Venue marker events
        if (location.infoWindow.isActive) {
          location.infoWindow.isActive = false;
          location.infoWindow.trigger.close();
        } else {
          location.infoWindow.isActive = true;
          location.marker.trigger.click();
        }
      }
    };

    self.toggleFavorite = function(destination) {
      destination.isFavorite(!destination.isFavorite());
    };

    self.showInMap = function(venue) {
      var dest = self.isLocationFocused();
      overlayMap.create(document.querySelector('.multi-mode-canvas'), {
        center: {lat: 40.7713024, lng: -73.9332393},
        zoom: 8,
      });
      overlayMap.bounds().create()
        .extend(dest.marker._marker.getPosition())
        .extend(venue.marker._marker.getPosition())
        .fit();
      dest.marker._marker.setMap(overlayMap._map);
      venue.marker.addIcon(
        'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
      )._marker.setMap(overlayMap._map);
    };

    // Find the interesting venues around the selected destination.
    self.findNearbyVenues = function(dest) {
      if (dest.nearbyVenues.info().length) {
        dest.nearbyVenues.bounds.fit();
        self.venues(dest.nearbyVenues);
        return;
      }

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
          dest.nearbyVenues.info($.map(venues, function(v, index) {
            if (!v.venue || !v.tips) {
              return null;
            }

            var name = v.venue.name;

            var position = {
              lat: v.venue.location.lat,
              lng: v.venue.location.lng,
            };

            var marker = map.marker().create({
              id: index,
              position: position,
              title: name,
              animation: true,
            }).addIcon('https://maps.google.com/mapfiles/ms/icons/yellow-dot.png');

            var infoWindow = map.infoWindow().create({
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
                'bg_32' + v.venue.categories[0].icon.suffix,
            };
            venue.photo = v.venue.photos.groups[0].items[0].prefix +
              'width320' + v.venue.photos.groups[0].items[0].suffix;
            venue.rating = v.venue.rating;
            venue.tip = v.tips[0].text;

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
          dest.nearbyVenues.bounds.fit();
          self.venues(dest.nearbyVenues);
        })
        .fail(function(xhr, status, error) {
          console.log(xhr, status, error);
        });
    };
  }

  return LocationViewModel;
});
