'use strict'

app.directive 'showInvestigators', [
  'constantService',
  (constants) ->
    restrict: 'E'
    scope: true
    transclude: true,
    templateUrl: 'volume/showInvestigators.html',
    link: ($scope, $element, $attrs) ->
      $scope.title = $attrs.investigatorsTitle

      maxPerm = constants.permission[$attrs.maxlevel] ? constants.permission.length
      minPerm = constants.permission[$attrs.minlevel] ? 0
      $scope.investigators = $scope.volume.access.filter (i) ->
        minPerm <= i.individual < maxPerm && (i.children || i.individual >= constants.permission.READ) && i.party.id != constants.party.STAFF

]
