'use strict';

app.controller('party/login', [
  '$location', 'displayService', 'modelService',
  function ($location, display, models) {
    display.title = "Login";
    if (models.Login.isLoggedIn())
      $location.url('/');
  }
]);
