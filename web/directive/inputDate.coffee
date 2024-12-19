'use strict'

app.directive 'inputDate', [
  () ->
    restrict: 'A'
    link: ($scope, $element) ->
      try
        $element[0].type = 'date'
      catch
      return
]
