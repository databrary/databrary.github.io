'use strict'

app.directive 'fundingSearchForm', [
  'modelService', 'constantService',
  (models, constants) ->
    restrict: 'E'
    templateUrl: 'volume/fundingSearch.html'
    link: ($scope) ->
      form = $scope.fundingSearchForm

      select = (found) -> ->
        $scope.selectFn(found)
        form.$setPristine()
        ''

      form.search = (val, all) ->
        models.funder(val, all)
          .then (data) ->
              form.validator.server {}
              l = for found in data
                text: found.name
                select: select(found)
              if !all
                l.push
                  text: constants.message('funding.search.more')
                  select: -> form.search(val, true)
              l
            , (res) ->
              form.validator.server res
              return

      form.validator.client
          name:
            tips: constants.message('funding.search.name.help'),
        , true

      return
]
