'use strict'

app.directive 'partyComments', [
  () ->
    restrict: 'E'
    templateUrl: 'party/comments.html'
    scope: false
    link: ($scope) ->
      $scope.comments = $scope.party.comments
      return
]
