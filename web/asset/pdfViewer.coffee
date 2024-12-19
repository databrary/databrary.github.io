'use strict'

app.directive 'pdfViewer', [
  () ->
    restrict: 'E'
    transclude: true
    scope:
      asset:  '=asset'
    link: ($scope, $elem, $attrs, controller, $transclude) ->
      pdfElement = $elem[0]
      objectTag = document.createElement('object')
      objectTag.setAttribute('data', $scope.asset.downloadRoute(true))
      objectTag.setAttribute('width', '80%')
      objectTag.setAttribute('type', $scope.asset.format.mimetype)
      $transclude (elem) ->
        _.each elem, (i) -> objectTag.appendChild i
      pdfElement.appendChild(objectTag)
      return

]
