'use strict'

app.directive 'loadParty', [
  'modelService',
  (models) ->
    restrict: 'A'
    transclude: 'element'
    priority: 500
    scope: true
    link: ($scope, $element, $attrs, ctrl, $transclude) ->
      id = $scope.$eval($attrs.loadParty)

      loading = $('<span class="load"/>')
      loading.text('[loading party ' + id + ']')
      $element.replaceWith(loading)

      models.Party.get(id).then (party) ->
        $scope.party = party
        $transclude($scope, (clone) ->
          loading.replaceWith(clone)
          return)
        return

      return
]
