'use strict';

app.directive('volumeOwners', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'volume/owners.html',
      scope: false,
      replace: true
    };
  }
]);
