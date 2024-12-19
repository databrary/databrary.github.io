'use strict';

app.config([
  '$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({enabled: true, requireBase: false});
  }
]);
