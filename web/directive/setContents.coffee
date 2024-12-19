app.directive 'setContents', [
  () ->
    restrict: 'A'
    link: ($scope, $element, $attrs) ->
      x = $scope.$eval($attrs.setContents)
      if x
        $element.empty()
        $element.append(x)
]
