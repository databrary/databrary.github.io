'use strict';

app.directive('portrait', [
  '$parse',
  function ($parse) {
    return {
      restrict: 'E',
      templateUrl: 'party/portrait.html',
      link: {
        pre: function ($scope, $element, $attrs) {
          $scope.portraitExtra = $parse($attrs.extra)($scope);
        },
        post: function ($scope, $element, $attrs) {
          $element.find('.portrait').addClass($attrs.class);
          $element.attr('class', '');
        }
      }
    };
  }
]);
