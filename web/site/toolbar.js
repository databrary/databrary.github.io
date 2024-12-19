'use strict';

app.directive('toolbar', [
  'pageService',
  function (page) {
    return {
      restrict: 'E',
      templateUrl: 'site/toolbar.html',
      scope: {},
      link: function ($scope) {
        $scope.page = page;
        
        var modal = document.getElementById('loginModal');

        $scope.$watch(function(){return page.models.Login.isLoggedIn()}, function(newVal, oldVal){
          if(newVal === true){
            modal.style.display = "none";
          }
        }, true)

        $scope.hover = undefined;
        $scope.hoverToggle = function (hover, $event) {
          $scope.hover = (($scope.hover === hover) ? undefined : hover);
          if ($event)
            $event.stopPropagation();
        };
        $scope.$on('$locationChangeStart', function () {
          $scope.hover = undefined;
        });
        $scope.search = function () {
          page.$location.url(page.router.search()).search($scope.search.data);
          $scope.search.data.q = "";
        };
        $scope.search.data = {};
        /* Not ideal, should really come with the rest of user data: */
        if (page.models.Login.isLoggedIn() && !('notifications' in page.models.Login))
          page.models.Login.get({'notifications':true});
      }
    };
  }
]);
