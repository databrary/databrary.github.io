'use strict'

app.controller 'party/activity', [
  '$scope', 'displayService', 'activity',
  ($scope, display, activity) ->
    party = activity.party
    display.title = party.name + " activity"
    $scope.party = party
    $scope.activity = activity
    return
]
