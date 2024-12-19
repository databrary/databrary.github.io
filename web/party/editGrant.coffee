'use strict'

app.directive 'partyEditGrantForm', [
  '$location', 'constantService', 'modelService', 'messageService', 'displayService',
  ($location, constants, models, messages, display) ->
    restrict: 'E',
    templateUrl: 'party/editGrant.html',
    link: ($scope) ->
      form = $scope.partyEditGrantForm
      form.data = $scope.party.children.slice()

      (($) ->

        $.fn.goTo = (yoffset) ->
          if yoffset
            scrolloffset = yoffset
          else
            scrolloffset = 0
          $('html, body').animate { scrollTop: $(this).offset().top + scrolloffset + 'px' }, 'fast'
          this

        return
      ) jQuery

      authSearchSelectFn = (found, searchForm) ->
        messages.clear(searchForm) if searchForm
        exp = new Date()
        exp.setFullYear(exp.getFullYear()+1)
        form.data.push
          new: true
          party: found
          site: 0
          member: 0
          expires: exp.getTime()
        if angular.element('#expiredaff').is(':visible')
          angular.element('#expiredaff').goTo(-150)
        else
          angular.element('article.permission-auth.cf.peg.anchor.clearfix:last').goTo(450)
        return

      $scope.authSearchNotFoundFn = (name, searchForm) ->
        messages.add
          type: 'yellow'
          body: constants.message('auth.grant.notfound')
          owner: searchForm

      $scope.authDenySuccessFn = (auth) ->
        form.data.remove(auth)

      form.saveAll = () ->
        $scope.$broadcast('authGrantSave')

      $scope.authSearchSelectFn = (p, searchForm) ->
        if form.data.some((auth) -> auth.party.id == p.id)
          angular.element('article#auth-' + p.id).goTo(-150)
        else if $scope.party.parents.some((a) -> a.party.id == p.id)
          messages.add
            type: 'red'
            body: constants.message('auth.grant.parent')
            owner: searchForm
        else
          authSearchSelectFn(p, searchForm)
        return

      $scope.getClass = (date) ->
        today = Date.now()
        if new Date(date) > today
          return true
        else  
         return false
        return

      $scope.$watch ->
        angular.element('.affiliatediv').each () ->
          if $(this).next().is('article')
            $(this).show()
          else
            $(this).hide()
          return
        return

      if (p = $location.search().party)?
        $location.search('party', null)
        models.Party.get(p).then($scope.authSearchSelectFn)

      return
]