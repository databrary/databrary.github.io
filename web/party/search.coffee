'use strict'

app.controller 'party/search', [
  '$scope', '$location', 'displayService', 'parties',
  ($scope, $location, display, parties) ->
    limit = 25-1 # server-side default
    offset = parseInt($location.search().offset, 10) || 0
    display.title = 'Users'
    $scope.parties = parties
    $scope.number = 1 + (offset / limit)
    if parties.length > limit
      $scope.next = -> $location.search('offset', offset + limit)
      $scope.parties.pop()
    if offset > 0
      $scope.prev = -> $location.search('offset', Math.max(0, offset - limit))
    return
]
