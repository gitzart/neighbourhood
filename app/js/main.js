require.config({
  paths: {
    require: 'lib/require',
    jquery: 'lib/jquery',
    knockout: 'lib/knockout',
    mapapi: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC_kU9l3eJ20DEPF2qq_XsQcz5ejxwbyns&v=3&callback=define',
  },
});

require([
  'jquery',
  'knockout',
  'googlemap',
  'viewmodels/location',
], function($, ko, GoogleMap, LocationViewModel) {
  'use strict';

  $.get('/api/data.json')
    .done(function(data, status, xhr) {
      var locations = data.locations;
      if (locations) {
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
      } else {
        console.log('No data is found.');
      }
    })
    .fail(function(xhr, status, error) {
      console.log(xhr.status);
      console.log(status);
      console.log(error);
    });
});
