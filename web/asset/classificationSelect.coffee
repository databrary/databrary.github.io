'use strict'

app.directive 'classificationSelect', [
  'constantService',
  (constants) ->
    restrict: 'E'
    templateUrl: 'asset/classificationSelect.html'
    scope:
      value: '=ngModel'
      name: '@'
      defaultFn: '&default'
      forceFn: '&force'
    link: ($scope) ->
      def = ($scope.defaultFn() || 0)+''
      $scope.force = $scope.forceFn()
      $scope.releases = constants.release.map (l) ->
        constants.message('release.'+l+'.title') + ': ' + constants.message('release.'+l+'.select')
      $scope.form = Object.defineProperties {},
        check:
          get: ->
            $scope.value?
          set: (c) ->
            $scope.value = if c then def
            return
        value:
          get: ->
            $scope.value+''
          set: (v) ->
            $scope.value = v
            return
      return
]
