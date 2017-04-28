require.config({
  paths: {
    jquery: [
      // 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
      'lib/jquery',
    ],
    knockout: [
      // 'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min',
      'lib/knockout',
    ],
    mapapi: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC_kU9l3eJ20DEPF2qq_XsQcz5ejxwbyns&v=3&callback=define',
  },
});

require.onError = function(err) {
  console.log(err);
  if (typeof google === 'undefined' && err.requireType === 'scripterror') {
    $('#map-canvas').html('Error error on the wall, who is the buggiest of them all.');
    console.log(err.requireModules + ' is needed.');
  }

  if (err.requireType === 'timeout') {
    alert('time is running out.');
  }

  throw err;
};

require([
  'jquery',
  'knockout',
  'viewmodels/location',
], function($, ko, LocationViewModel) {
  'use strict';

  $.getJSON('/api/data.json')
    .done(function(data, status, xhr) {
      var locations = data.locations;
      if (locations) {
        ko.applyBindings(new LocationViewModel(locations));
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
