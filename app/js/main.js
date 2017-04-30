require.config({
  paths: {
    jquery: [
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
      'lib/jquery',
    ],
    knockout: [
      'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min',
      'lib/knockout',
    ],
    mapapi: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC_kU9l3eJ20DEPF2qq_XsQcz5ejxwbyns&v=3&callback=define',
  },
});

// Error error on the wall, who is the buggiest of them all.
require.onError = function(err) {
  // Google API error
  if (typeof google === 'undefined' && err.requireType === 'scripterror') {
    $('#map-canvas').empty();
    $('<div/>')
      .addClass('error mdl-typography--subhead')
      .append('<i class="material-icons">error_outline</i>')
      .append('Google Map cannot be accessed!<br>')
      .append('Check the connection or the firewall.')
      .appendTo('#map-canvas');
  }
  throw err;
};

require([
  'jquery',
  'knockout',
  'viewmodels/location',
  'extends/handlers',
], function($, ko, LocationViewModel) {
  'use strict';

  // If data in localStorage, grab them.
  if (window.localStorage.getItem('destinations') !== null) {
    var destinations = ko.utils.parseJson(
      window.localStorage.getItem('destinations')
    );
    ko.applyBindings(new LocationViewModel(destinations));
  } else {  // Else, reach the server.
    $.getJSON('/api/data.json')
      .done(function(data, status, xhr) {
        var locations = data.locations;
        if (locations.length !== 0) {
          ko.applyBindings(new LocationViewModel(locations));
        } else {
          console.log('No data is found.');
        }
      })
      .fail(function(xhr, status, error) {
        console.log(xhr.status);
        console.log(status);
        throw error;
      });
  }
});
