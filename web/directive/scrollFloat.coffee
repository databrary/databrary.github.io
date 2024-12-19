'use strict'

app.directive 'scrollFloat', [
  '$window','constantService'
  (window,constants) ->
    restrict: 'E'
    transclude: true,
    templateUrl: 'directive/scrollFloat.html',
    link: ($scope, $element) ->
      floater = $element[0].firstChild
      while floater && floater.tagName != 'DIV'
        floater = floater.nextSibling

      scroll = ->
        box = floater.getBoundingClientRect()
        skip = if constants.sandbox then 84 else 36
        $scope.scrollFloating = box.height && box.top < skip
      handler = $scope.$lift(scroll)
      window.addEventListener 'scroll', handler
      $scope.$on '$destroy', ->
        window.removeEventListener 'scroll', handler
      scroll()
      return
]
