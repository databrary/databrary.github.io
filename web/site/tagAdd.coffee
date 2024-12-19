'use strict'

app.directive 'tagAdd', [
  '$sce', 'constantService', 'modelService', 'messageService',
  ($sce, constants, models, messages) ->
    restrict: 'E'
    templateUrl: 'site/tagAdd.html'
    link: ($scope, $element, $attrs) ->
      form = $scope.tagAddForm
      $scope.keyword = 'keyword' of $attrs

      select = (tag) -> ->
        $scope.vote(tag, true).then () -> ''

      form.search = (input) ->
        return input unless form.$valid
        models.Tag.search(input).then (data) ->
            l = for tag in data
              text: tag
              select: select(tag)
            unless input in data
              l.push
                text: 'Create tag: ' + input
                select: select(input)
                default: true
            l
          , (res) ->
            messages.addError
              body: constants.message('tags.auto.error', {sce: $sce.HTML})
              report: res
            [
              text: input
              select: select(input)
            ]

      form.submit = (input) ->
        $scope.vote(input, true).then () -> ''

      return
]
