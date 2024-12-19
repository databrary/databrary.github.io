'use strict';

app.directive('volumeList', [
  'pageService',
  function (page) { return {
    restrict: 'E',
    scope: {
      volumes: "=data",
    },
    templateUrl: 'volume/list.html',
    link: function ($scope) {
      $scope.page = page;
    }
  }; }
]);

