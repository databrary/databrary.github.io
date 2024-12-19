'use strict';

app.directive('focus', [
  '$timeout',
  function ($timeout) {
    var link = function ($scope, $element, $attrs) {
      if ($attrs.focus === '' || $scope.$eval($attrs.focus))
        $timeout(function(){
         $element[0].focus();
        } ,0);
    };

    return {
      restrict: 'A',
      link: link,
    };
  }
]);
