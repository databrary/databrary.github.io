'use strict'

app.directive 'partyData', [
  () ->
    restrict: 'E'
    templateUrl: 'party/data.html'
    scope: false
]
