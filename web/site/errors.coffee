'use strict'

app.directive('errors', [
  'displayService', 'constantService', 'pageService',
  (display, constants, page) ->
    restrict: 'E'
    scope: {}
    templateUrl: 'site/errors.html'
    link: ($scope) ->
      $scope.page = page
      $scope.$on 'displayService-error', (event, error) ->
        display.title = "Error"
        error.title ?= constants.messages.error['r' + error.status] || constants.message('error.resolve')
        error.message ?= constants.messages.error['message' + error.status] || constants.message('error.message')
        $scope.error = error
        return
      return
])
