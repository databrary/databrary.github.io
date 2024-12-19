'use strict';

app.directive('frame', [
  'constantService',
  function (constants) {
    var link =
      function ($scope, $element, $attrs) {
        $scope.id = $attrs.id;
        $scope.title = constants.message($attrs.frameTitle);
      };

    return {
      restrict: 'A',
      templateUrl: 'site/frame.html',
      scope: true,
      transclude: true,
      replace: true,
      priority: 100,
      link: link
    };
  }
]);
