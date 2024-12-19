'use strict'

app.directive 'inputPosition', [
  '$parse', 'Offset',
  ($parse, Offset) ->
    restrict: 'A'
    require: 'ngModel'
    link: ($scope, $element, $attrs, ngModel) ->
      blank = if $attrs.inputPosition then parseFloat($attrs.inputPosition) else null
      ngModel.$parsers.push (value) ->
        return blank if value == ''
        value = Offset.parse(value)
        if isFinite(value) then value
      ngModel.$formatters.push (value) ->
        return '' if value == blank
        Offset.format(value)
      if 'positionMin' of $attrs
        min = $parse($attrs.positionMin)
        ngModel.$validators.min = (value) ->
          ngModel.$isEmpty(value) || !(value < min($scope))
      if 'positionMax' of $attrs
        max = $parse($attrs.positionMax)
        ngModel.$validators.max = (value) ->
          ngModel.$isEmpty(value) || !(value > max($scope))

      return
]
