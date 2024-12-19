'use strict'

app.controller 'party/profile', [
  '$scope', '$location', '$sce', 'displayService', 'constantService', 'messageService', 'party'
  ($scope, $location, $sce, display, constants, messages, party) ->
    display.title = party.name
    $scope.party = party

    class Item
      class: () ->
        switch s = @selected
          when true then ["radio-selected"]
          when undefined then (if $scope.selected then [] else ["radio"])
          else ["user-access", constants.permission[s.individual]]

      Object.defineProperty @prototype, 'selected',
        get: -> @constructor.selection[@id]

      select: () ->
        s = @selected
        @constructor.selection = {}
        messages.clear(Item)
        if s == true
          $scope.selected = undefined
          $scope.editable = undefined
          @constructor.foreign.selection = {}
        else
          $scope.selected = @
          $scope.editable = @volume?.checkPermission(constants.permission.ADMIN)
          @constructor.selection[@id] = true
          @constructor.foreign.selection = @access
          messages.add
            body: "Highlighting " + @selectionMessage()
            type: 'dark'
            owner: Item
          @selectionMessage()
        return

    class Party extends Item
      @all = {}

      constructor: (@party) ->
        @access = {}
        Party.all[@party.id] = @

      @make = (p) ->
        Party.all[p.id] || new Party(p)

      Object.defineProperty @prototype, 'id',
        get: -> @party.id

      @selection = {}

      selectionMessage: ->
        constants.message('profile.parties.selected', @party.name)

      edit: (t) ->
        if $scope.editable
          $scope.selected.editAccess(@party)
        else if t
          $location.url(party.editRoute(t, @party.id))

    class Volume extends Item
      constructor: (@volume) ->
        @access = {}
        for a in @volume.access when a.party.id != constants.party.STAFF
          p = Party.make(a.party)
          p.access[@volume.id] = a
          @access[p.party.id] = a

      Object.defineProperty @prototype, 'id',
        get: -> @volume.id
      Object.defineProperty @prototype, 'self',
        get: -> @access[party.id]

      @selection = {}

      selectionMessage: ->
        constants.message('profile.volumes.selected', @volume.displayName)

      editAccess: (p) ->
        $location.url(@volume.editRoute('access', p))

      edit: () ->
        if (s = $scope.selected) && (s == @ || p = s.party) && @volume.checkPermission(constants.permission.ADMIN)
          @editAccess(p)
        else if @volume.checkPermission(constants.permission.EDIT)
          $location.url(@volume.editRoute())

    Party.foreign = Volume
    Volume.foreign = Party

    volumes =
      individual: [] # volumes with individual >= ADMIN
      collaborator: [] # volumes with individual < ADMIN
      inherited: {} # volumes with parent.children > NONE, by parent
    $scope.parties = parties =
      parents: for a in party.parents
        p = Party.make(a.party)
        p.parent = a
        volumes.inherited[p.party.id] = [] if a.member
        p
      children: [] # children indexed by .member access
      collaborators: [] # all other parties on volumes with permission >= ADMIN
    collaborators = {}

    for v in party.volumes
      v = new Volume(v)
      if s = v.self # current party has some permission
        (if s.individual >= constants.permission.ADMIN then volumes.individual else volumes.collaborator).push(v)
      else
        # add to inherited list for each parent with children > NONE
        for ii, il of volumes.inherited
          if v.access[ii]?.children
            il.push(v)
      if v.volume.permission >= constants.permission.ADMIN
        # add everyone on volume to collaborators if permission >= ADMIN
        for pi of v.access
          collaborators[pi] = true

    # cull collaborators accounted for elsewhere
    delete collaborators[party.id]
    for a in party.parents
      delete collaborators[a.party.id]
    notificationArray = []
    for a in party.children
      delete collaborators[a.party.id]
      p = Party.make(a.party)
      p.child = a
      (parties.children[a.member] || (parties.children[a.member] = [])).push(p)
      unless a.member || a.site
        Object.keys(sessionStorage).forEach (item) ->
          if item.indexOf('notification') > -1
            notificationArray.push(sessionStorage.getItem(item))
          return
        notificationBody = '<span>' + constants.message('auth.notice.pending', {sce:$sce.HTML}, a.party.name) + ' <a href="' + party.editRoute('grant', a.party.id) + '">Manage</a>.</span>'
        if !notificationArray.includes(notificationBody)
          messages.add
            type: 'yellow',
            body: $sce.trustAsHtml(notificationBody)
    parties.collaborators = (Party.all[pi] for pi of collaborators)

    stringSort = (a,b) -> +(a > b) || +(a == b) - 1
    partySort = (a,b) -> stringSort(a.party.sortname, b.party.sortname)

    volumes.individual.type = "individual"
    volumes.collaborator.type = "collaborator"
    $scope.volumes = [volumes.individual]
    if volumes.collaborator.length
      $scope.volumes.push(volumes.collaborator)
    for ii, il of volumes.inherited
      p = Party.all[ii]
      il.type = "inherited"
      il.parent = Party.all[ii]
      $scope.volumes.push(il)

    parties.parents.sort(partySort) # .parent.site/member?
    parties.parents.type = "parents"
    for cl in parties.children when cl
      cl.sort(partySort)
    parties.collaborators.sort(partySort)
    parties.collaborators.type = 'collaborators'

    today = Date.now()
    $scope.isExpired = (a) ->
      new Date(a.expires) < today

    $scope.hasExpired = (result) ->
      expiredChildren = []
      for key, value of result
        for k, v of value
          if new Date(v.child.expires) < today
            expiredChildren.push(key)
      if expiredChildren.length > 0
        return true
      else
        return false
      return

    $scope.memberhasCurrent = (result) ->
      currentChildren = []
      for key, value of result
        if new Date(value.child.expires) >= today
          currentChildren.push(key)
      if currentChildren.length > 0
        return true
      else
        return false
      return

    $scope.sortVolumes = (b) ->
      if $scope.volumeSort == b
        # volumes.individual.reverse()
        # volumes.collaborator.reverse()
        # for ii, il of volumes.inherited
        #   il.reverse()
        return
      volumeSort =
        switch b
          when 'name' then (a,b) -> stringSort(a.volume.displayName, b.volume.displayName)
          when 'access' then (a,b) -> b.volume.accessPreset - a.volume.accessPreset || b.self.children - a.self.children || b.volume.permission - a.volume.permission || stringSort(a.volume.displayName, b.volume.displayName)
          when 'permission' then (a,b) -> b.volume.permission - a.volume.permission || stringSort(a.volume.displayName, b.volume.displayName)
      volumes.individual.sort(volumeSort)
      volumes.collaborator.sort(volumeSort)
      for ii, il of volumes.inherited
        il.sort(volumeSort)
      $scope.volumeSort = b
      sessionStorage.setItem 'sort', b
      return
    if sessionStorage.getItem('sort')
      $scope.sortVolumes sessionStorage.getItem('sort')
    else
      $scope.sortVolumes 'permission'

    parties.childrensort = []
    for key, value of parties.children
      for x of value
        value[x]['member'] = key
        parties.childrensort.push(value[x])

    $scope.affiliateSort = 'accesslevel'

    namest = false
    expirationdatest = false
    $scope.changeaffiliateSort = (x) ->
      $scope.affiliateSort = x
      angular.element('.affilatesortdiv').not('.' + x + '-div').hide()
      angular.element('.affilatesortdiv.' + x + '-div').show()
      if x == "name"
        if namest == false
          parties.childrensort.sort (a, b) ->
            stringSort(a.party.prename, b.party.prename)
          parties.childrensort.sort (a, b) ->
            partySort(a, b)
          namest = true
        else
          parties.childrensort.sort (a, b) ->
            stringSort(b.party.prename, a.party.prename)
          parties.childrensort.sort (a, b) ->
            partySort(b, a)
          namest = false
      else if x == "expirationdate"
        if expirationdatest == false
          parties.childrensort.sort (a, b) ->
            new Date(a.child.expires) - new Date(b.child.expires)
          expirationdatest = true
        else
          parties.childrensort.sort (a, b) ->
            new Date(b.child.expires) - new Date(a.child.expires)
          expirationdatest = false
      return

    return
]
