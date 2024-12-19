'use strict'

app.controller 'volume/slotActivity', [
  '$scope', 'displayService', 'activity',
  ($scope, display, activity) ->
    slot = activity.slot
    display.title = slot.displayName + " activity"
    $scope.slot = slot
    $scope.activity = activity
    return
]
