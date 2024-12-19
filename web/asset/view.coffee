'use strict'

app.controller 'asset/view', [
  '$scope', 'displayService', 'asset',
  ($scope, display, asset) ->
    $scope.close = ->
      window.history.back()
    $scope.asset = asset
    display.title = asset.displayName
    $scope.volume = asset.volume
    $scope.hasThumbnail = (asset.format.type == 'image' || asset.format.type == 'video' && asset.duration && !asset.pending)
  ]
