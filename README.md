# neighbourhood
A map project built with Google Map API and other third party APIs.

## Run the production ready code
Install [Web Server for Chrome app](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en). Open the app, choose the `dist` folder and go to [http://127.0.0.1:8887](http://127.0.0.1:8887).

## How to compile
Go to the project root folder and in the terminal
```
$ npm install
$ bower install
$ gulp
```

### Three available `gulp` tasks

* Run the source code version
```
$ gulp
```

* Run the production version
```
$ gulp serve:dist
```

* Build the production version
```
$ gulp build
```

## App Usage
* Preset locations
  * are represented by map markers.
  * can be clicked to find nearby places.
  * can be filtered using the search box.
  * can be marked as favorite.
  
* Nearby locations
  * are designed as cards.
  * clicking its photo or title will open map info windows.
  * clicking the `place` icon at the top right corner will show its location on the map.




## Attribution
* Map style by [Snazzymaps](https://snazzymaps.com/style/72543/assassins-creed-iv).
* Nearby venues data by [Foursquare API](https://developer.foursquare.com).
