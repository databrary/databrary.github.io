'use strict';

app.directive('partyNetwork', [
  'modelService',
  function (models) {
    return {
    restrict: 'E',
    templateUrl: 'party/network.html',
    scope: false,
    link: function ($scope) {
      var user = models.Login.user.id;
      function isUser(a) {
        return a.party.id === user;
      }

      $scope.isParent =
        $scope.party.parents.some(isUser);
      $scope.isRelation = $scope.isParent ||
        /* you always exist on your own page */
        $scope.party.id <= 0 || $scope.party.id === user ||
        $scope.party.children.some(isUser);

      $scope.partyChildrenCount = Object.keys($scope.party.children).length;
      $scope.partyParentsCount = Object.keys($scope.party.parents).length;
    }
    };
  }
]);
