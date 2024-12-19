'use strict';

app.directive('wizardStep', [
  function () {
    return {
      restrict: 'E',
      templateUrl: 'site/wizardStep.html',
      require: '^wizard',
      scope: {},
      transclude: true,
      link: {
        pre: function ($scope, $element, $attrs, wizard) {
          $scope.name = $attrs.name;
          $scope.id = wizard.name + '-' + $scope.name;
        },
        post: function ($scope, $element, $attrs, wizard) {
          $scope.$scope = $scope.$$childHead;
          wizard.addStep($scope);
        }
      }
    };
  }
]);
