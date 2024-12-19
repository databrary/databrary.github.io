'use strict'

app.controller 'site/search', [
  '$scope', '$location', 'constantService', 'displayService', 'modelService', 'searchService', 'parties', 'volumes',
  ($scope, $location, constants, display, models, Search, parties, volumes) ->
    display.title = 'Search'

    spellcheck = {}
    process = (r) ->
      list = r.response.docs
      list.count = r.response.numFound
      if (sug = r.spellcheck) && (sug = sug.suggestions)
        for i in [1..sug.length] by 2
          spellcheck[sug[i-1]] = sug[i].suggestion
          $scope.spellcheck = spellcheck
      list

    if parties
      $scope.parties = process(parties)
      unless volumes
        type = Search.Party
        $scope.count = $scope.parties.count
    if volumes
      $scope.volumes = process(volumes)
      unless parties
        type = Search.Volume
        $scope.count = $scope.volumes.count

    params = $location.search()
    $scope.query = params.q || ''
    if type
      offset = parseInt(params.offset, 10) || 0
      $scope.pageCurrent = 1 + (offset / type.limit)
      $scope.pageCount = Math.ceil($scope.count / type.limit)

    finite = (x) ->
      x? && isFinite(x)

    Default =
      parse: (x) -> x
      print: (x) -> if x then x
    Number =
      parse: (x) -> if x != '*' then parseFloat(x)
      print: (x) -> if finite(x) then x else '*'
    rangeRegex = /^\[([-+0-9.e]+|\*) TO ([-+0-9.e]+|\*)\]$/i
    Range =
      set: (x) -> x && (finite(x[0]) || finite(x[1]))
      parse: (x) ->
        x = rangeRegex.exec(x) || []
        [Number.parse(x[1]) ? -Infinity, Number.parse(x[2]) ? Infinity]
      print: (x) ->
        if x
          unless x[0] > this.range[0]
            x[0] = -Infinity
          unless x[1] < this.range[1]
            x[1] = Infinity
        if Range.set(x) then '['+Number.print(x[0])+' TO '+Number.print(x[1])+']'
    Quoted =
      parse: (x) ->
        x.substring(x.startsWith('"'), x.length-x.endsWith('"'))
      print: (x) -> if x then '"'+x+'"'

    $scope.years = [1925, (new Date()).getFullYear()]
    handlers =
      record_age:
        parse: Range.parse
        print: Range.print
        range: [0, constants.age.limit]
      container_date:
        parse: (x) ->
          x = Range.parse(x)
          if Range.set(x)
            fields.container_top = 'false'
          x
        print: (x) ->
          if fields.container_top then Range.print.call(this, x)
        range: $scope.years
      numeric: Range
      tag_name: Quoted

    $scope.fields = fields = {}
    for f, v of handlers
      fields[f] = [v.range[0],v.range[1]] if v.range
    for f, v of params
      if f.startsWith('f.')
        n = f.substr(2)
        fields[n] = (handlers[n] ? Default).parse(v)
      else if f.startsWith('m.')
        mi = f.substr(2)

    any = (o) ->
      for f, v of o
        return true if v?
      return false

    $scope.search = (offset) ->
      q =
        q: $scope.query || undefined
        offset: offset
        volume: type?.volume
      for f, v of fields
        q['f.'+f] = (handlers[f] ? Default).print(v)
      delete q['f.container_top'] if q['f.container_date']
      $location.search(q)
      return

    $scope.searchParties = (auth, inst) ->
      fields = {}
      fields.party_authorization = auth
      fields.party_is_institution = inst
      type = Search.Party
      $scope.search(0)
    $scope.searchVolumes = () ->
      type = Search.Volume
      $scope.search(0)
    $scope.searchSpellcheck = (w, s) ->
      $scope.query = $scope.query.replace(w, s)
      $scope.search()
    $scope.searchPage = (n) ->
      $scope.search(type.limit*(n-1))

    startTag = fields.tag_name
    $scope.tagSearch = (input) ->
      return input if input == startTag
      models.Tag.search(input).then (data) ->
        for tag in data
          text: tag
          select: () ->
            fields.tag_name = this.text
            $scope.searchVolumes()
            this.text

    $scope.formats = _.filter(constants.format, (f) -> !f.transcodable || f.id < 0)
    $scope.customSortformat= (format) ->
      if format.id == -800
        return -1
      format.name

    ageSliderValue = [0,0]
    ageLogOffset = 16
    $scope.ageSlider = (value) ->
      if value?
        fields.record_age[0] = Math.round(Math.exp(value[0])-ageLogOffset)
        fields.record_age[1] = Math.round(Math.exp(value[1])-ageLogOffset)
      else
        x = Math.log(ageLogOffset+Math.max(0,fields.record_age[0]))
        y = Math.log(ageLogOffset+Math.min(constants.age.limit,fields.record_age[1]))
        if x != ageSliderValue[0] || y != ageSliderValue[1]
          ageSliderValue = [x, y]
        ageSliderValue
    $scope.ageRange = [Math.log(ageLogOffset), Math.log(ageLogOffset+constants.age.limit)]
    $scope.clearAge = () ->
      fields.record_age = [-Infinity,Infinity]

    $scope.expandVolume = (v) ->
      if v && $scope.expanded?.volume == v
        $scope.expanded = undefined
        return
      $scope.expanded = {volume:v}
      return unless v
      v.get ['excerpts']
      return

    if $scope.fields.content_type == 'excerpt' && !$scope.expanded
      $scope.expandVolume($scope.volumes[0])
    return

]
