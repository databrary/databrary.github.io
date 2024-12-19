'use strict'

app.directive 'activityChange', [
  'constantService',
  (constants) ->
    restrict: 'A'
    transclude: 'element'
    priority: 500
    link: ($scope, $element, $attrs, ctrl, $transclude) ->
      af = $attrs.activityChange
      afi = af.lastIndexOf('.')
      act = $scope.$eval(af.substring(0, afi))
      field = af.substring(afi+1)
      val =
        new: act[field]
        old: act.old?[field]

      return unless val.old? || val.new?

      dt = $('<dt/>').text(($attrs.title || constants.message($attrs.titleMessage)))
      dt.append(':')
      dt.addClass('activity-change-title')
      dd = $('<dd/>')
      add = (which) ->
        return unless val[which]?
        scope = $scope.$new()
        scope.value = val[which]
        $transclude(scope, (clone) ->
          clone.addClass('activity-'+which)
          dd.append(clone))
      add('old')
      dd.append('<wbr>')
      add('new')

      $element.after(dt, dd)
      return
]
