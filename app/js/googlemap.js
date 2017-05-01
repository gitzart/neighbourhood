define([
  'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyC_kU9l3eJ20DEPF2qq_XsQcz5ejxwbyns&v=3',
], function() {
  'use strict';

  /* =======================================================================
   =================================== Marker
   ========================================================================= */
  /**
   * A marker to pinpoint a position on the map.
   *
   * @class
   * @param {google.maps.Map} map - The map to set the marker on.
   */
  function Marker(map) {
    var self = this;

    self._map = map;
    self._marker = undefined;

    self.event = {
      click: function(cb) {
        self._marker.addListener('click', cb);
        return self.event;
      },
      mouseOver: function(cb) {
        self._marker.addListener('mouseover', cb);
        return self.event;
      },
      mouseOut: function(cb) {
        self._marker.addListener('mouseout', cb);
        return self.event;
      },
    };

    self.trigger = {
      click: function() {
        google.maps.event.trigger(self._marker, 'click');
      },
      mouseOver: function() {
        google.maps.event.trigger(self._marker, 'mouseover');
      },
      mouseOut: function() {
        google.maps.event.trigger(self._marker, 'mouseout');
      },
    };
  }

  /**
   * Create a marker.
   *
   * @param {?Object} [opts] - The options to create a marker with.
   * @see {@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerOptions}
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.create = function(opts) {
    this._marker = new google.maps.Marker(opts || null);
    this._marker.setMap(this._map);
    if (opts && opts.animation) {
      this._marker.setAnimation(google.maps.Animation.DROP);
    }
    return this;
  };

  /**
   * Set the visibility of the marker.
   *
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.show = function() {
    this._marker.setVisible(true);
    return this;
  };

  /**
   * Remove the visibility of the marker.
   *
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.hide = function() {
    this._marker.setVisible(false);
    return this;
  };

  /**
   * Change the default marker icon.
   *
   * @param {string} [icon=https://maps.google.com/mapfiles/ms/icons/blue-dot.png] - The marker icon URL.
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.addIcon = function(icon) {
    icon = icon || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    this._marker.setIcon({
      url: icon,
      scaledSize: new google.maps.Size(40, 40),
    });
    return this;
  };

  /**
   * Set the default marker icon.
   *
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.removeIcon = function() {
    this._marker.setIcon(null);
    return this;
  };

  /**
   * Animate the marker with a bounce effect.
   *
   * @param {number} [time=2] - The number of time the marker bounces.
   * @return {Marker} The current `Marker` instance.
   */
  Marker.prototype.bounce = function(time) {
    var DURATION_PER_BOUNCE = 700;
    time = time ? DURATION_PER_BOUNCE * time : DURATION_PER_BOUNCE * 2;
    this._marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this._marker.setAnimation(null);
    }).bind(this), time);
    return this;
  };

  /* =======================================================================
   =================================== Bounds
   ========================================================================= */
  /**
   * A latlng bound object to set the map viewport to contain markers.
   *
   * @class
   * @param {google.maps.Map} map - The map to bound the markers on.
   */
  function Bounds(map) {
    this._map = map;
    this._bounds = undefined;
  }

  /**
   * Create a [google.maps.LatLngBounds]{@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#LatLngBounds} instance.
   *
   * @param {?Object} [sw] - The southwest latitude and longitude.
   * @param {?Object} [ne] - The northeast latitude and longitude.
   * @return {Bounds} The current `Bounds` instance.
   */
  Bounds.prototype.create = function(sw, ne) {
    this._bounds = new google.maps.LatLngBounds(sw || null, ne || null);
    return this;
  };

  /**
   * Extend the bounding area.
   *
   * @param {Object} latlng - The latitude and longitude.
   * @return {Bounds} The current `Bounds` instance.
   */
  Bounds.prototype.extend = function(latlng) {
    this._bounds.extend(latlng);
    return this;
  };

  /**
   * Contain the markers inside the map viewport.
   *
   * @return {Bounds} The current `Bounds` instance.
   */
  Bounds.prototype.fit = function() {
    this._map.fitBounds(this._bounds);
    return this;
  };

  /* =======================================================================
   =================================== InfoWindow
   ========================================================================= */
  /**
   * An information window for a specific position.
   *
   * @class
   * @param {google.maps.Map} map - The map to display the info windows on.
   */
  function InfoWindow(map) {
    var self = this;

    self._map = map;
    self._infoWindow = undefined;

    self.event = {
      close: function(cb) {
        self._infoWindow.addListener('closeclick', cb);
        return self.event;
      },
    };

    self.trigger = {
      close: function() {
        google.maps.event.trigger(self._infoWindow, 'closeclick');
      },
    };
  }

  /**
   * Create an infoWindow.
   *
   * @param {?Object} [opts] - The options to create an infoWindow with.
   * @see {@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#InfoWindowOptions}
   * @return {InfoWindow} The current `InfoWindow` instance.
   */
  InfoWindow.prototype.create = function(opts) {
    this._infoWindow = new google.maps.InfoWindow(opts || null);
    return this;
  };

  /**
   * Open the infoWindow on the map.
   *
   * @param {*} anchor - The anchor to attach the infoWindow to. Consult the [`open` method of `InfoWindow` class]{@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#InfoWindow}.
   * @return {InfoWindow} The current `InfoWindow` instance.
   */
  InfoWindow.prototype.open = function(anchor) {
    this._infoWindow.open(this._map, anchor || null);
    return this;
  };

  /**
   * Close the infoWindow.
   *
   * @return {InfoWindow} The current `InfoWindow` instance.
   */
  InfoWindow.prototype.close = function() {
    this._infoWindow.close();
    return this;
  };

  /* =======================================================================
   =================================== GoogleMap
   ========================================================================= */
  /**
   * A [Google Map]{@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#Map} instance.
   *
   * @class
   */
  function GoogleMap() {
    var self = this;

    self._map = undefined;

    /**
     * Create a map.
     *
     * @param {Object} container - The DOM element to place a map in.
     * @param {?Object} [opts] - The options to create a map with.
     * @see {@link https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions}
     * @return {GoogleMap} The current `GoogleMap` instance.
     */
    self.create = function(container, opts) {
      self._map = new google.maps.Map(container, opts || null);
      return self;
    };

    self.trigger = {
      resize: function() {
        google.maps.event.trigger(self._map, 'resize');
      },
    };

    /**
     * A [Marker]{@link Marker} object.
     *
     * @return {Marker} The new `Marker` instance.
     */
    self.marker = function() {
      return new Marker(self._map);
    };

    /**
     * A [Bounds]{@link Bounds} object.
     *
     * @return {Bounds} The new `Bounds` instance.
     */
    self.bounds = function() {
      return new Bounds(self._map);
    };

    /**
     * An [InfoWindow]{@link InfoWindow} object.
     *
     * @return {InfoWindow} The new `InfoWindow` instance.
     */
    self.infoWindow = function() {
      return new InfoWindow(self._map);
    };
  }

  return GoogleMap;
});
