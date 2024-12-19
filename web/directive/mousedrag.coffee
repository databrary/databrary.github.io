'use strict'

app.directive 'mouseDragRegion', [
  () ->
    restrict: 'A'
    controller: [
      '$element',
      ($element) ->
        this.region = $element
        return
    ]
]

app.directive 'mouseDrag', [
  '$parse',
  ($parse) ->
    restrict: 'A'
    require: '?^mouseDragRegion'
    compile: ($element, $attrs) ->
      action = $parse($attrs.mouseDrag)
      ($scope, $element, $attrs, region) ->
        region = if region then region.region else $element
        $element.on 'mousedown', (down) ->
          startTime = down.timeStamp
          mouseup = (up) ->
            final = up.type != 'mousemove'
            region.off 'mouseleave mouseup mousemove', mouseup if final
            # maybe should also count enough movement as a drag, even under time thresh
            if startTime != undefined
              return if final || up.timeStamp - startTime < 250
              startTime = undefined
            $scope.$apply () ->
              if action($scope, {$down:down, $up:up}) == false
                region.off 'mouseleave mouseup mousemove', mouseup unless final
            false
          region.on 'mouseleave mouseup mousemove', mouseup
          false
        return
]
