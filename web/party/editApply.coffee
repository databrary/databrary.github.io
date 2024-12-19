'use strict'

app.directive 'partyEditApplyForm', [
  '$location', 'constantService', 'modelService', 'messageService', 'displayService',
  ($location, constants, models, messages, display) ->
    restrict: 'E'
    templateUrl: 'party/editApply.html'
    link: ($scope) ->
      form = $scope.partyEditApplyForm
      form.data = $scope.party.parents.slice()

      authSearchSelectFn = (found) ->
        form.data.push
          new: true
          party: found
        display.scrollTo('fieldset article.permission-auth.pef:last')
        return

      $scope.authSearchNotFoundFn = (query) ->
        form.data.push
          new: true
          query: query
        display.scrollTo('fieldset article.permission-auth.pef:last')
        return

      $scope.authApplySuccessFn = (auth) ->
        messages.add
          body: constants.message('auth.apply.save.success')
          type: 'green'
          owner: form

        form.data.remove(auth) unless auth.party
        return

      $scope.authApplyCancelFn = (auth) ->
        messages.add
          body: constants.message('auth.apply.remove.success')
          type: 'green'
          owner: form

        form.data.remove(auth)
        return

      $scope.authSearchSelectFn = (p) ->
        if form.data.some((auth) -> auth.party.id == p.id)
          display.scrollTo("#auth-"+p.id)
        else if $scope.party.children.some((a) -> a.party.id == p.id)
          messages.add
            type: 'red'
            body: constants.message('auth.apply.child')
        else
          authSearchSelectFn(p)
        return

      if (p = $location.search().party)?
        $location.search('party', null)
        models.Party.get(p).then($scope.authSearchSelectFn)

      return
]
