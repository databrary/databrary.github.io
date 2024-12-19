'use strict'

app.controller 'volume/search', [
  '$scope', '$location', 'displayService', 'volumes',
  ($scope, $location, display, volumes) ->
    limit = 25-1 # server-side default
    offset = parseInt($location.search().offset, 10) || 0
    display.title = 'Search'
    $scope.volumes = volumes
    $scope.number = 1 + (offset / limit)
    if volumes.length > limit
      $scope.next = -> $location.search('offset', offset + limit)
      $scope.volumes.pop()
    if offset > 0
      $scope.prev = -> $location.search('offset', Math.max(0, offset - limit))
    return
]
