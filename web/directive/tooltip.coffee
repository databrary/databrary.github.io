'use strict'

app.directive 'tooltip', [
  'tooltipService',
  (tooltips) ->
    restrict: 'A'
    scope: false
    link: ($scope, $element, $attrs) ->
      if message = $scope.$eval($attrs.tooltip)
        t = tooltips.add($element, message)
        $scope.$on '$destroy', () -> t.remove($element)
      return
]
