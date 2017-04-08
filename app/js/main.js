require.config({
  paths: {
    require: 'lib/require',
    knockout: 'lib/knockout',
    mapapi: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC_kU9l3eJ20DEPF2qq_XsQcz5ejxwbyns&v=3&callback=define',
  },
});

require([
  'knockout',
  'googlemap',
  'viewmodels/location',
], function(ko, GoogleMap, LocationViewModel) {
  'use strict';

  var locations = [
    {
      "title": "Park Ave Penthouse",
      "position": {
        "lat": 40.7713024,
        "lng": -73.9632393
      }
    },
    {
      "title": "Chelsea Loft",
      "position": {
        "lat": 40.7444883,
        "lng": -73.9949465
      }
    },
    {
      "title": "Union Square Open Floor Plan",
      "position": {
        "lat": 40.7347062,
        "lng": -73.9895759
      }
    },
    {
      "title": "East Village Hip Studio",
      "position": {
        "lat": 40.7281777,
        "lng": -73.984377
      }
    },
    {
      "title": "TriBeCa Artsy Bachelor Pad",
      "position": {
        "lat": 40.7195264,
        "lng": -74.0089934
      }
    },
    {
      "title": "Chinatown Homey Space",
      "position": {
        "lat": 40.7180628,
        "lng": -73.9961237
      }
    }
  ];

  // Create a GoogleMap instance
  var map = new GoogleMap();

  // Create the main map
  map.create({
    center: locations[0].position,
    zoom: 8,
  });

  // Create location markers
  map.addMarkers(locations);

  // Kick off the Knockout viewmodel
  ko.applyBindings(new LocationViewModel({
    map: map,
    locations: locations,
  }));
});
