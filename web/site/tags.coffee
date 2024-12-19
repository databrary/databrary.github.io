'use strict'

app.directive 'tags', [
  'constantService', 'messageService', 'tooltipService', '$sce',
  (constants, messages, tooltips, $sce) ->
    restrict: 'E'
    templateUrl: 'site/tags.html'
    scope:
      targetFn: '&target'
      editFn: '&?edit'
    link: ($scope, $element, $attrs) ->
      target = $scope.targetFn()
      $scope.keyword = keyword = 'keyword' of $attrs
      edit = $scope.editFn?()

      include =
        if keyword
          (t) -> t.keyword
        else
          (t) -> t.weight

      $scope.tags = (t for t in target.tags when include(t))

      if edit
        $scope.target = if target.class == 'volume' then target.top else target

        $scope.vote = (name, vote) ->
          messages.clear($scope)
          $scope.target.setTag(name, vote, keyword).then (tag) ->
              if tag.keyword?.length
                tag.keyword = true
              if tag.vote?.length
                tag.vote = true
              i = $scope.tags.findIndex (t) -> t.id == tag.id
              if i == -1
                i = $scope.tags.length
              if include(tag)
                $scope.tags[i] = tag
              else
                $scope.tags.splice(i, 1)

              messages.add
                type: 'green'
                body: constants.message('tags.vote.success.'+(if vote then 'up' else 'null'), {sce: $sce.HTML}, tag.id)
                owner: $scope
              tooltips.clear() # hack for broken tooltips
              return
            , (res) ->
              messages.addError
                body: constants.message('tags.vote.error', {sce: $sce.HTML}, name)
                report: res
                owner: $scope
              return
      return
]
