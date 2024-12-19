'use strict';

app.directive('panel', [
  'constantService', '$location',
  function (constants, $location) {
    var link = function ($scope, $element, $attrs) {
      if ('id' in $attrs)
        $scope.id = $attrs.id;
      else
        $scope.id = '';

      $scope.title = constants.message($attrs.panelTitle);
      $scope.top = 'top' in $attrs;
      $scope.enabled = true;
      $scope.edit = $attrs.editLink && function(event) {
        $location.url($attrs.editLink);
        event.stopPropagation();
        return false;
      };
    };

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'site/panel.html',
      transclude: true,
      replace: true,
      priority: 100,
      link: link
    };
  }
]);
