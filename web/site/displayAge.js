'use strict';

app.directive('displayAge', [
  'displayService',
  function (display) {
    return {
      restrict: 'E',
      templateUrl: 'site/displayAge.html',
      replace: true,
      scope: {
        value: '='
      },
      link: function ($scope) {
        function init() {
          $scope.age = display.formatAge($scope.value);
        }
        init();
        $scope.$on('displayService-toggleAge', init);
        $scope.$watch('value', init);
        $scope.change = display.toggleAge;
      }
    };
  }
]);
