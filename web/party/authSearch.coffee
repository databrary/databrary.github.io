'use strict'

app.directive 'authSearchForm', [
  'modelService', 'constantService',
  (models, constants) ->
    restrict: 'E'
    templateUrl: 'party/authSearch.html'
    link: ($scope, $element, $attrs) ->
      party = $scope.party || models.Login.user
      form = $scope.authSearchForm

      form.principal = $attrs.principal
      form.apply = form.principal != 'child'

      $scope.$watch ->
          form.principal
        , (principal) ->
          form.validator.client({
              name:{tips: constants.message('auth.search.' + (principal || 'placeholder') + '.help')}
            }, true)
          form.placeholderText = $attrs.placeholderText || constants.message('auth.search.' + (form.principal || 'placeholder') + '.prompt')
          return

      select = (found) -> ->
        $scope.authSearchSelectFn(found, form)
        form.$setPristine()
        ''

      notfound =
        text: constants.message('auth.notfound')
        select: ->
          $scope.authSearchNotFoundFn(form.nameVal, form)
          form.$setPristine()
          ''

      form.search = (val) ->
        models.Party.search(
            query: val
            institution: form.principal == 'principal' || (if form.principal == 'affiliate' then false else undefined)
          ).then (data) ->
              form.validator.server {}

              l = for found in data when found.id != party.id
                text: found.name
                select: select(found)
                email: ' (' + found.email + ')' if found.email

              l.push notfound
              l
            , (res) ->
              form.validator.server res
              return

      form.validator.client
          name:
            tips: constants.message('auth.search.name.help'),
        , true

      return
]
