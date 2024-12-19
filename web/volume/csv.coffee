'use strict'

app.controller 'volume/csv', [
  '$scope', 'displayService', 'volume',
  ($scope, display, volume) ->

    display.title = volume.name + ".csv"
    $scope.volume = volume

    $scope.close = ->
      window.history.back()
]