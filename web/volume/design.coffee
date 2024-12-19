'use strict'

app.directive 'volumeDesign', [
  '$location', 'constantService', 'routerService', 'messageService',
  ($location, constants, router, messages) ->
    restrict: 'E'
    templateUrl: 'volume/design.html'
    require: '^wizard',
    link: ($scope, $element, $attrs, wizard) ->
      volume = $scope.volume
      form = $scope.volumeDesign
      selectedArray =  []

      $element.on 'click', (e) ->
        inputEl = angular.element(e.target).not('input').closest('li.clickable').find('input')
        if inputEl.attr('class')
          inputElclass = inputEl.attr('class').substring(inputEl.attr('class').indexOf('class')+5, inputEl.attr('class').indexOf('class')+6)
        if selectedArray.includes(inputElclass)
          inputEl.trigger 'click'
          inputEl.trigger 'click'
          selectedArray.splice(selectedArray.indexOf(inputElclass), 1)
        else
          inputEl.trigger 'click'
        return

      $scope.select = (c) ->
        form.metric = {}
        return unless ($scope.selected = constants.category[c])?
        $location.replace().search('key', undefined)
        if volume.metrics[c]
          for m in volume.metrics[c]
            form.metric[m] = true
        else
          for m in $scope.selected.metrics when m.required?
            form.metric[m.id] = true
        return

      init = () ->
        form.category = {}
        for c of volume.metrics
          form.category[c] = true
          selectedArray.push(c)
        $scope.select($scope.selected?.id || $location.search().key)
        return

      reinit = () ->
        form.category = {}
        for c of volume.metrics
          form.category[c] = true
        $scope.select($scope.selected?.id || $location.search().key)

      init()

      $scope.change = (c, m) ->
        return unless c?
        messages.clear(form)
        form.$setSubmitted()
        volume.setVolumeMetrics(c, m, if m? then form.metric[m] else form.category[c]).then(() ->
            reinit()
            form.$setPristine()
            return
          , (res) ->
            reinit()
            form.$setUnsubmitted()
            messages.addError
              body: 'Error changing volume design'
              report: res
              owner: form
            return)
        # set/clear indicator when necessary
        # could be done more efficiently without a separate call
        unless m? && (i = $scope.selected.indicator) && m != i.id
          return
        if form.metric[m]
          s = false
        else if !_.some(form.metric)
          s = true
        else
          return
        i = i.id
        if form.metric[i] != s
          form.metric[i] = s
          $scope.change(c, i)
        return

      $scope.manage = () ->
        $location.replace().search('key', $scope.selected.id)
        wizard.activateStep('data')
        return

      $scope.stop = (e) ->
        e.stopPropagation()
        return false
]
