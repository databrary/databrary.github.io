'use strict'

app.directive 'assetDisplay', [
  'constantService',
  (constants) ->
    restrict: 'E'
    templateUrl: 'asset/display.html'
    scope:
      assetFn: '&asset'
    link: ($scope, $element, $attrs) ->
      asset = $scope.assetFn()
      $scope.asset = if 'exact' of $attrs then asset else asset.inContext()
      $scope.readable = $scope.asset.checkPermission(constants.permission.VIEW)
      if $scope.asset != asset
        $scope.clip = asset.segment.relativeTo($scope.asset.segment)
      return
]
