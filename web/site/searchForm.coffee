'use strict'

app.directive 'searchForm', [
  '$location', 'constantService', 'routerService',
  ($location, constants, routes) ->
    restrict: 'E'
    templateUrl: 'site/searchForm.html'
    scope: {}
    link: ($scope, $element, $attrs) ->
      $scope.types =
        volume: 'Data'
        principal: 'Authorized investigators'
        institution: 'Authorized institutions'
        party: 'All users and groups'
      params = $location.search()
      $scope.type = $attrs.type
      if $scope.type == 'party'
        if params.institution == 'true'
          $scope.type = 'institution'
        else if `params.authorization == constants.permission.EDIT`
          $scope.type = 'principal'
      $scope.query = params.query
      $scope.search = ->
        (switch $scope.type
          when 'volume'
            $location.url(routes.volumeSearch())
          when 'institution'
            $location.url(routes.partySearch()).search({institution:'true',authorization:constants.permission.ADMIN})
          when 'principal'
            $location.url(routes.partySearch()).search({institution:'false',authorization:constants.permission.EDIT})
          when 'party'
            $location.url(routes.partySearch())
          ).search('query', $scope.query)
        return
      return
]
