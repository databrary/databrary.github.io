'use strict'

app.directive 'inputAge', [
  'constantService', 'displayService',
  (constants, display) ->
    restrict: 'E'
    templateUrl: 'site/inputAge.html'
    require: 'ngModel'
    scope: {}
    link:
      pre: ($scope, $element, $attrs, ctrl) ->
        AGE = constants.age

        ctrl.$render = ->
          u = AGE[$scope.unit = display.ageMode(ctrl.$viewValue)]
          # messy, alternatively we could just use a raw input:
          $scope.value = parseFloat((ctrl.$viewValue / u).toFixed(Math.ceil(Math.log10(u))))
          return

        $scope.changeValue = (event) ->
          ctrl.$setViewValue(Math.round($scope.value * AGE[$scope.unit]), event)
          return

        $scope.changeUnit = () ->
          display.toggleAge($scope.unit)
          return

        $scope.$on 'displayService-toggleAge', ctrl.$render

        return

      post: ($scope, $element, $attrs) ->
        input = $element[0].firstChild
        select = $element[0].children[1]
        input.setAttribute('id', $attrs.inputId) if $attrs.inputId
        select.setAttribute('id', $attrs.selectId) if $attrs.selectId

        return
]
