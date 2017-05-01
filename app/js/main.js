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
    async: 'lib/async',
  },
});

// Error error on the wall, who is the buggiest of them all.
require.onError = function(err) {
  // Google API error
  if (typeof google === 'undefined') {
    $('#map-canvas').empty();
    $('<div/>')
      .addClass('error')
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
          alert('No locations are found.');
        }
      })
      .fail(function(xhr, status, error) {
        alert('No locations are found.');
        throw error;
      });
  }
});
