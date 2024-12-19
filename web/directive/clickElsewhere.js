'use strict';

app.directive('clickElsewhere', [
  '$parse', '$document',
  function ($parse, $document) { return {
    restrict: 'A',
    compile: function ($element, $attrs) {
      var action = $parse($attrs.clickElsewhere);
      return function ($scope, $element) {
        function handler(event) {
          if ($element[0] != event.target && !$.contains($element[0], event.target))
            $scope.$apply(function () {
              action($scope, {$event:event});
            });
        }
        $document.on('click', handler);
        $scope.$on('$destroy', function () {
          $document.off('click', handler);
        });
      };
    }
  }; }
]);
