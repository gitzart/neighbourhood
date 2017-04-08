define([
  'mapapi',
], function(mapapi) {
  'use strict';

  var GoogleMap = function() {
    var self = this;

    // Initialize necessary map features
    self._map = new google.maps.Map(document.querySelector('#map-canvas'));
    self._bounds = new google.maps.LatLngBounds();
    self._markers = [];
    self._infowindows = [];

    // Create the map with the given options
    self.create = function(opts) {
      self._map.setOptions(opts);
    };

    // Adjust the map size to see all the markers
    self.bound = function() {
      self._map.fitBounds(self._bounds);
    };

    // Create an individual marker with the given options
    // return a marker object
    self.addMarker = function(opts) {
      return new google.maps.Marker(opts);
    };

    // Show the marker
    self.showMarker = function(marker) {
      if (!marker.getMap()) {
        marker.setMap(self._map);
      }
    };

    // Hide the marker and marker related features (i.e, infowindow)
    self.hideMarker = function(marker) {
      if (marker.getMap()) {
        self.triggerInfoWindowEvent(
          self._infowindows[marker.get('id')],
          'closeclick'
        );
        marker.setMap(null);
      }
    };

    // Create an array of markers with the given data,
    // bound them to the map
    // return the marker array
    self.addMarkers = function(data) {
      data.forEach(function(v, i) {
        var marker = self.addMarker({
          map: self._map,
          id: i,
          position: v.position,
          title: v.title,
          animation: google.maps.Animation.DROP,
        });
        self._bounds.extend(marker.getPosition());
        self._markers.push(marker);
        self.setMarkerEvents(marker);
      });
      self.bound();
      return self._markers;
    };

    // Animate the marker to bounce for the given time
    // Default to 2 times
    self.bounceMarker = function(marker, time) {
      var durationPerBounce = 700;
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, time ? time * durationPerBounce : 2 * durationPerBounce);
    };

    // Create an individual infowindow with the given options
    // return an infowindow object
    self.addInfoWindow = function(opts) {
      return new google.maps.InfoWindow(opts);
    };

    // Open an infowindow on the given marker
    self.popInfoWindow = function(infowindow, marker) {
      infowindow.open(self._map, marker);
    };

    // Add event listeners to the marker
    self.setMarkerEvents = function(marker) {
      // Mouse over
      marker.addListener('mouseover', function() {
        marker.setIcon({
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(40, 40),
        });
      });

      // Mouse out
      marker.addListener('mouseout', function() {
        marker.setIcon(null);
      });

      // Click
      marker.addListener('click', function() {
        var index = marker.get('id');
        var infowindow = self._infowindows[index];
        if (!infowindow) {
          infowindow = self.addInfoWindow({
            id: index,
            content: marker.getTitle(),
          });
          self._infowindows[index] = infowindow;
          self.setInfoWindowEvents(infowindow);
        }
        self.bounceMarker(marker);
        self.popInfoWindow(infowindow, marker);
      });
    };

    // Add event listeners to the infowinow
    self.setInfoWindowEvents = function(infowindow) {
      // Close click
      infowindow.addListener('closeclick', function() {
        infowindow.close();
      });
    };

    // Trigger the marker events with the given event
    self.triggerMarkerEvent = function(marker, event) {
      if (marker && event) {
        google.maps.event.trigger(marker, event);
      }
    };

    // Trigger the infowindow events with the given event
    self.triggerInfoWindowEvent = function(infowindow, event) {
      if (infowindow && event) {
        google.maps.event.trigger(infowindow, event);
      }
    };
  };

  return GoogleMap;
});
