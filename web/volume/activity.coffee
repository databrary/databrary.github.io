'use strict'

app.controller 'volume/activity', [
  '$scope', 'displayService', 'activity',
  ($scope, display, activity) ->
    volume = activity.volume
    display.title = volume.name + " activity"
    $scope.volume = volume
    $scope.activity = activity
    return
]
