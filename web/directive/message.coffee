'use strict'

app.directive 'message', [
  'constantService', '$sce',
  (constants, $sce) ->
    restrict: 'A'
    compile: ($element, $attrs) ->
      fill =
        if 'messageHtml' of $attrs
          ($element, $attrs) ->
            $element.html($sce.getTrustedHtml(constants.message($attrs.message, {sce:$sce.HTML})))
            return
        else
          ($element, $attrs) ->
            $element[0].textContent = constants.message $attrs.message
            return
      if $attrs.message.includes('{{')
        ($scope, $element, $attrs) ->
          fill($element, $attrs)
      else
        fill($element, $attrs)
]
