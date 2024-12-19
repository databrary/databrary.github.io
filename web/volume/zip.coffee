'use strict'

app.controller 'volume/zip', [
  '$location', '$scope', 'constantService', 'displayService', 'volume', 'slot',
  ($location, $scope, constants, display, volume, slot) ->

    filt = false
    class RSet extends Array
      make = ([l, u]) ->
        {l:l, u:u ? l}
      parse = (x) ->
        make(x.split('-',2))
      constructor: ->
        if arguments.length
          @push(make(arguments))
        return
      add: (x) ->
        filt = true
        @push.apply(@, x.split(',').map(parse))
      member: (x) ->
        for r in @
          if r.l <= x && x <= r.u
            return true

    if slot
      display.title = slot.displayName + ".zip"
      $scope.slot = slot
      $scope.volume = slot.volume
      $scope.containers = [slot]
    else
      display.title = volume.name + ".zip"
      $scope.volume = volume

      incl = undefined
      excl = new RSet(volume.top.id)
      for k, v of $location.search()
        if "include".startsWith(k)
          incl ||= new RSet()
          incl.add(v)
        else if "exclude".startsWith(k)
          excl.add(v)
      incl ||= new RSet(-Infinity, Infinity)

      $scope.containers = (c for ci,c of volume.containers when incl.member(c.id) && !excl.member(c.id))
      $scope.filtered = filt

    t = 0
    d = 0
    z = 0
    $scope.filesInSession = {}
    for ci, c of $scope.containers
      $scope.filesInSession[ci] = Object.keys(c.assets).length
      for ai, a of c.assets
        t++
        if a.size
          d++
          z += a.size
    $scope.assetTotal = t
    $scope.assetDownload = d
    $scope.assetSize = Math.ceil(z/(1024*1024*1024))

    $scope.close = ->
      window.history.back()
      return
    return
 ]
