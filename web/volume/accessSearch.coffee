'use strict'

app.directive 'accessSearchForm', [
  'constantService', 'modelService',
  (constants, models) ->
    restrict: 'E'
    templateUrl: 'volume/accessSearch.html',
    link: ($scope, $element, $attrs) ->
      volume = $scope.volume
      form = $scope.accessSearchForm

      select = (found) -> ->
        $scope.selectFn(found)
        form.$setPristine()
        ''

      form.search = (val) ->
        models.Party.search(
            query: val
          ).then (data) ->
              form.validator.server {}
              for found in data
                text: found.name
                email: ' (' + found.email + ')' if found.email != undefined
                select: select(found)
            , (res) ->
              form.validator.server res
              return

      form.validator.client
          name:
            tips: constants.message('access.search.name.help')
        , true

      return
]
