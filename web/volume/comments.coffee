'use strict'

app.directive 'volumeComments', [
  'constantService', 'messageService', 'modelService',
  (constants, messages, models) ->
    restrict: 'E'
    templateUrl: 'volume/comments.html'
    scope: false
    link: ($scope) ->
      $scope.canPost = models.Login.isAuthorized()
      refresh = () ->
        $scope.comments = $scope.volume.comments
      refresh()

      pullComments = () ->
        $scope.volume.get(['comments']).then((res) ->
            $scope.comments = res.comments
          , (res) ->
            messages.addError
              body: constants.message('comments.update.error')
              report: res
          )

      $scope.commentClass = (comment) ->
        cls = {}
        if comment.parents
          cls['depth-'+Math.min(comment.parents.length, 5)] = true
        cls

      $scope.replyTo = undefined

      $scope.setReply = (comment) ->
        $scope.replyTo = comment

      $scope.$on 'commentReplyForm-init', (event, form) ->
        form.successFn = pullComments
        form.cancelFn = $scope.setReply
        form.target = $scope.replyTo
        event.stopPropagation()

      $scope.jumpLink = (comment) ->
        comment.container.route {asset: comment.id, select:comment.segment.format()}
]
