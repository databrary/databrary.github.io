'use strict'

app.directive 'volumeExcerpts', [
  'constantService', 'messageService', '$sce'
  (constants, messages, $sce) ->
    restrict: 'E'
    templateUrl: 'volume/excerpts.html'
    scope: false
    link: ($scope, $element, $attrs) ->
      $scope.current = $scope.volume.excerpts[0]

      if $scope.releases = 'release' of $attrs
        $scope.excerpts = excerpts = []
        for e in $scope.volume.excerpts
          if l = excerpts[e.release]
            l.push(e)
          else
            l = excerpts[e.release] = [e]
            l.release = constants.release[e.release]
      else
        $scope.excerpts = [$scope.volume.excerpts]

      $scope.setCurrent = (asset) ->
        $scope.current = asset

      $scope.hasThumbnail = (asset) ->
        asset.checkPermission(constants.permission.VIEW) && (asset.format.type == 'image' || asset.format.type == 'video' && asset.duration && !asset.pending)

      $scope.tutorial = (message...) ->
        if message.length
          messages.add
            type: 'tutorial'
            persist: true
            body: message.map($sce.trustAsHtml)
        return
]
