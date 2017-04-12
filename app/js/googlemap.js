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

    // Create the map
    self.create = function(opts) {
      self._map.setOptions(opts);
    };

    // Adjust the map size to see all the markers
    self.bound = function() {
      self._map.fitBounds(self._bounds);
    };

    // Create a marker
    // Return a marker object
    self.addMarker = function(opts) {
      return new google.maps.Marker(opts);
    };

    // Show the marker on the map
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

    // Create an array of markers and bound them to the map
    // Return a marker array
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

    // Create an infowindow
    // Return an infowindow object
    self.addInfoWindow = function(opts) {
      return new google.maps.InfoWindow(opts);
    };

    // Attach an infowindow to a marker
    self.openInfoWindow = function(infowindow, marker) {
      infowindow.open(self._map, marker);
    };

    // Add event listeners to the marker
    self.setMarkerEvents = function(marker) {
      // On mouse over, change the marker `icon`
      marker.addListener('mouseover', function() {
        marker.setIcon({
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(40, 40),
        });
      });

      // On mouse out, set the default marker `icon`
      marker.addListener('mouseout', function() {
        marker.setIcon(null);
      });

      // On click, animate the marker, create an infowindow and
      // open it on the marker
      marker.addListener('click', function() {
        self.bounceMarker(marker);
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
        self.openInfoWindow(infowindow, marker);
      });
    };

    // Add event listeners to the infowinow
    self.setInfoWindowEvents = function(infowindow) {
      // On close button click, remove the infowindow from the DOM
      infowindow.addListener('closeclick', function() {
        infowindow.close();
      });
    };

    // Trigger the marker events
    self.triggerMarkerEvent = function(marker, event) {
      if (marker && event) {
        google.maps.event.trigger(marker, event);
      }
    };

    // Trigger the infowindow events
    self.triggerInfoWindowEvent = function(infowindow, event) {
      if (infowindow && event) {
        google.maps.event.trigger(infowindow, event);
      }
    };
  };

  return GoogleMap;
});
