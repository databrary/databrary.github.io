'use strict'

app.directive 'volumeMeter', [
  '$compile', '$templateCache', 'constantService', 'displayService', 'messageService', '$sce'
  ($compile, $templateCache, constants, display, messages, $sce) ->
    restrict: 'E'
    templateUrl: 'volume/meter.html'
    require: '^wizard',
    scope:
      volumeFn: '&volume'
    link: ($scope, $element, $attrs, wizard) ->
      $scope.volume = volume = $scope.volumeFn()
      return unless volume
      $scope.name = 'meter'
      $scope.id = wizard.name + '-meter'
      $scope.complete = true
      $scope.tab = $compile($templateCache.get('volume/meterTab.html'))($scope)
      $scope.unstyled = true
      wizard.addStep($scope)

      class Metric
        constructor: (@test) ->
          return

        run: () ->
          @done = @test()

      $scope.metrics = metrics =
        name: new Metric ->
          !!volume.name
        description: new Metric ->
          volume.body?.length >= 500
        citation: new Metric ->
          !!volume.citation
        keywords: new Metric ->
          n = 0
          for t in volume.tags when t.keyword
            n++
            return true if n >= 3
        excerpts: new Metric ->
          n = 0
          for e in volume.excerpts when e.release >= constants.release.SHARED
            n++
            return true if n >= 3
        thumbnail: new Metric ->
          for e in volume.excerpts when e.release >= constants.release.PUBLIC and (e.format.type == 'image' || e.format.type == 'video')
            return true
        design: new Metric ->
          for m of volume.metrics
            return true
        session: new Metric ->
          for ci, c of volume.containers when !c.top
            return true
        record: new Metric ->
          for ri, r of volume.records
            return true
        asset: new Metric ->
          for ai, a of volume.assets when a.container
            return true
        share: new Metric ->
          volume.accessPreset

      addCategory = (c) ->
        cat = constants.categoryName[c]
        def = (m for m in cat.metrics when m.required?)
        metrics[c] = new Metric ->
          design = volume.metrics[cat.id] || []
          !(@metrics = (m.name for m in def when !(m.id in design))).length

      for c in ['participant', 'context']
        addCategory(c)

      $scope.goto = (step, target, message...) ->
        wizard.activateStep(step)
        display.scrollTo(target) if target
        if message.length
          messages.add
            type: 'tutorial'
            persist: true
            body: message.map($sce.trustAsHtml)
        return

      for n, m of metrics
        m.run()

]
