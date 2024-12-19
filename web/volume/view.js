'use strict';

app.controller('volume/view', [
  '$scope', 'volume', 'displayService',
  function ($scope, volume, display) {
    $scope.volume = volume;
    display.title = volume.name;
    $scope.checkpublicsharefull = volume.publicsharefull || volume.publicsharefull === null;
  }
]);
